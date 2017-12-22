var archiver = require("archiver");
const async = require("async");
const createFile = require("create-file");
var fs = require("fs");
const geolib = require("geolib");
const http = require("http");
const request = require("request");
const uuidv4 = require("uuid/v4");
const download = function download(id, cookie) {
  console.log("download ", id);

  return new Promise((resolve, reject) => {
    var options = {
      method: "GET",
      hostname: "www.movescount.com",
      port: null,
      path: `/Move/Route/${id}`,
      headers: {
        cookie: cookie
      }
    };

    var req = http.request(options, function(_res) {
      var chunks = [];

      _res.on("data", function(chunk) {
        chunks.push(chunk);
      });
      _res.on("error", e => {
        reject(e);
      });

      _res.on("end", function() {
        var body = Buffer.concat(chunks);
        const json = JSON.parse(body.toString());
        resolve(json);
      });
    });

    req.end();
  });
};
const removeFiles = function removeFiles(files, done) {
  async.each(
    files,
    (f,_done) => {
      fs.unlinkSync(f);
      _done();
    },
    e => {
      if (e) throw e;
      done()
    }
  );
};
const doArchive = function doArchive(data, options, done) {
  // create a file to stream archive data to.
  var output = fs.createWriteStream(options.dir + `/${options.uuid}.zip`);
  var archive = archiver("zip", {
    zlib: { level: 9 } // Sets the compression level.
  });
  // listen for all archive data to be written
  // 'close' event is fired only when a file descriptor is involved
  output.on("close", function() {
    console.log(archive.pointer() + " total bytes");
    console.log(
      "archiver has been finalized and the output file descriptor has closed."
    );
    removeFiles(data,done);
  });
  // This event is fired when the data source is drained no matter what was the data source.
  // It is not part of this library but rather from the NodeJS Stream API.
  // @see: https://nodejs.org/api/stream.html#stream_event_end
  output.on("end", function() {
    console.log("Data has been drained");
  });
  // good practice to catch this error explicitly
  archive.on("error", function(err) {
    throw err;
  });
  archive.pipe(output);
  data.forEach(d => {
    const comps = d.split("/");
    const nme = comps[comps.length - 1];
    archive.file(d, { name: nme });
  });
  archive.finalize();
};

exports.download_all_routes = function(req, res) {
  const allIds = req.body.data;
  const data = [];
  async.eachSeries(
    allIds,
    function(feedUri, done) {
      // call your async function
      download(feedUri, req.body.cookie)
        .then(response => {
          // your operation here;
          data.push(response);
          done();
        })
        .catch(e => {
          console.log(e);
          done(e);
        });
    },
    function(err) {
      // errors generated in the loop above will be accessible here
      if (err) throw err;

      const rootDir = process.cwd();
      const uuid = uuidv4();
      const dir = `${rootDir}/tmp/${uuid}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      const archivableFiles = [];
      async.each(
        data,
        (d, done) => {
          const gpxContents = geolib.gpxForJson(d, {
            name: d.routeName
          });
          const fileName = `${d.id}.gpx`;
          const filePath = dir + `/${fileName}`;

          //create files
          createFile(filePath, gpxContents, err => {
            if (err) throw err;
            archivableFiles.push(filePath);
            done();
          });
        },
        e => {
          //zip and hold it in tmp
          //TODO: clean up archivableFiles
          doArchive(archivableFiles, { dir: dir, uuid: uuid }, err => {
            console.log("all files but zip are gone");
            res.json({ dir: dir });
          });
        }
      );
    }
  );
};

exports.download_zip = function(req, res) {
  var file = __dirname + `/zips/gpxs_${req.params.id}.zip`;
  res.download(file); // Set disposition and send it.
};
