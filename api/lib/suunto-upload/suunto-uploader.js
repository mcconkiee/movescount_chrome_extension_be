const async = require("async");
const config = require("../../config");
const Errors = require("./errors.js");
const fs = require("fs");
const ff = require("ff");
const unzip = require("node-unzip-2");
const route = require('./upload-route')
// var path = process.argv[2];
const sleep = function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};
async function zzz() {
  await sleep(2000);
}
const suuntoUploader = function suuntoUploader(zip, destPath, options, done) {
  //read zip and write files
    
  fs
    .createReadStream(zip)
    .pipe(unzip.Parse())
    .on("entry", function(entry) {      
      const fileName = entry.path;
      if (fileName.includes(".gpx")) {
        //write file to tmp dir so we can read
        const filePath = `${destPath}/${fileName}`;
        entry.pipe(
          fs.createWriteStream(filePath).on("close", () => {
            console.log("onclose for file", filePath);
            
          })
        );
      }
    })
    .on("error", err => {
      console.log("onerror unzip");
    });
};
module.exports = suuntoUploader;
