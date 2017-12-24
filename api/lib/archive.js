const archiver = require("archiver");
const fs = require("fs");
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

module.exports = doArchive;