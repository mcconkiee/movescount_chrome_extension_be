//https://blog.jscrambler.com/queue-jobs-kue/
const async = require("async");
const createFile = require("create-file");
var ff = require("ff");
const fs = require("fs");
const uuidv4 = require("uuid/v4");
const Route = require("../models/routesModel");
const lib = require("../lib");

const deleteFolderRecursive = function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

// processor.js
module.exports = function(route, done) {
  const rootDir = process.cwd();
  const uuid = uuidv4();
  const dir = `${rootDir}/tmp/${route.uuid}`;
  const options = { dir: dir, uuid: uuid };
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  //FETCH all the gpx files, and hold them in the tmp dir
  const archivableFiles = []; //hold the paths here
  async.each(
    route.routeIds,
    (routeId, asyncDone) => {
      const url = `/Move/ExportRoute/${routeId}?format=gpx`;
      const options = { url: url, cookie: route.cookie, dir: dir };
      lib.download(options).then(response => {
        const fileName = `${routeId}.gpx`;
        const filePath = dir + `/${fileName}`;
        //create files
        createFile(filePath, response, err => {
          if (err) throw err;
          archivableFiles.push(filePath);
          asyncDone();
        });
      });
    },
    err => {
      if (err) throw err;
      const f = ff(
        this,
        () => {
          lib.archive(archivableFiles, options, f.slot());
        },
        zipUrl => {
          lib.uploadS3(zipUrl, options, f.slot());
        },
        s3Url => {
          route.url = s3Url;
          Route.findOneAndUpdate(
            { _id: route._id },
            route,
            { new: true },
            (err, updatedRoute) => {
              if (err) return done(err, null);
              deleteFolderRecursive(dir);
              lib.email(updatedRoute, f.slot());              
            }
          );
        }
      ).onComplete(result => {
          console.log(result,'last event, all done');
          
        done(null, result);
      });
    }
  );
};
