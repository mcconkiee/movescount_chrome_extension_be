const archiver = require("archiver");
const async = require("async");
const createFile = require("create-file");
var ff = require("ff");
const fs = require("fs");
const geolib = require("geolib");
const http = require("http");
const request = require("request");
var s3 = require("s3");
const uuidv4 = require("uuid/v4");

const config = require("../config");
const Route = require("../models/routesModel");

const deleteFolderRecursive = function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

const download = function download(options, done) {
  console.log("download ", options);

  return new Promise((resolve, reject) => {
    var httpOptions = {
      method: "GET",
      hostname: "www.movescount.com",
      port: null,
      path: options.url,
      headers: {
        cookie: options.cookie
      }
    };

    var req = http.request(httpOptions, function(_res) {
      var chunks = [];

      _res.on("data", function(chunk) {
        chunks.push(chunk);
      });
      _res.on("error", e => {
        reject(e);
      });

      _res.on("end", function() {
        var body = Buffer.concat(chunks);
        resolve(body);
      });
    });

    req.end();
  });
};

const uploadS3 = function uploadS3(zipUrl, options, done) {
  var client = s3.createClient({
    s3Options: config.s3
  });
  var params = {
    localFile: zipUrl,

    s3Params: {
      Bucket: config.s3.Bucket,
      Key: `routes/${options.uuid}.zip`
    }
  };
  var uploader = client.uploadFile(params);
  uploader.on("error", function(err) {
    console.error("unable to upload:", err.stack);
    done(err,null);
  });
  uploader.on("progress", function() {
    console.log(
      "progress",
      uploader.progressMd5Amount,
      uploader.progressAmount,
      uploader.progressTotal
    );
  });
  uploader.on("end", function() {
    console.log("done uploading");
    done(null, s3.getPublicUrl(params.s3Params.Bucket, params.s3Params.Key));
  });
};
const doArchive = function doArchive(data, options, done) {
  // create a file to stream archive data to.
  const url = options.dir + `/${options.uuid}.zip`;
  var output = fs.createWriteStream(url);
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
    done(null, url);
  });

  // good practice to catch this error explicitly
  archive.on("error", function(err) {
    throw err;
  });

  // This event is fired when the data source is drained no matter what was the data source.
  // It is not part of this library but rather from the NodeJS Stream API.
  // @see: https://nodejs.org/api/stream.html#stream_event_end
  output.on("end", function() {
    console.log("Data has been drained");
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
  const rootDir = process.cwd();
  const uuid = uuidv4();
  const dir = `${rootDir}/tmp/${uuid}`;
  const options = { dir: dir, uuid: uuid };
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  //FETCH all the gpx files, and hold them in the tmp dir
  const archivableFiles = []; //hold the paths here
  async.each(
    allIds,
    (routeId, done) => {
      const url = `/Move/ExportRoute/${routeId}?format=gpx`;
      const options = { url: url, cookie: req.body.cookie, dir: dir };
      download(options).then(response => {
        const fileName = `${routeId}.gpx`;
        const filePath = dir + `/${fileName}`;
        //create files
        createFile(filePath, response, err => {
          if (err) throw err;
          archivableFiles.push(filePath);
          done();
        });
      });
    },
    err => {
      if (err) throw err;
      const f = ff(
        this,
        () => {
          doArchive(archivableFiles, options, f.slot());
        },
        zipUrl => {
          uploadS3(zipUrl, options, f.slot());
        },
        s3Url => {
          var newRoute = new Route({ url: s3Url, uuid: uuid });
          newRoute.save(function(err, route) {
            if (err) res.send(err);
            deleteFolderRecursive(dir);
            res.json(route);
          });
        }
      ).onComplete(result => {
        console.log("all done** - zip url = ", result);
      });
    }
  );
};

exports.download_zip = function(req, res) {
  var file = __dirname + `/zips/gpxs_${req.params.id}.zip`;
  res.download(file); // Set disposition and send it.
};
