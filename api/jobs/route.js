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
  console.log(`set up tmp dir : ${dir}`);
  
  //FETCH all the  files, and hold them in the tmp dir
  const archivableFiles = []; //hold the paths here
  async.each(
    route.routeIds,
    (routeId, asyncDone) => {
      const urlForRoute = `/Move/ExportRoute/${routeId}?format=${route.format}`;
      const urlForMove  = `/move/export?id=${routeId}&format=${route.format}`
      const url = (route.downloadType === 'route') ? urlForRoute : urlForMove;
      const options = { url: url, cookie: route.cookie, dir: dir };
      lib.download(options).then(response => {
        const fileName = `${routeId}.${route.format}`;
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
          console.log('archiving files for s3');
          
          lib.archive(archivableFiles, options, f.slot());
        },
        zipUrl => {
          console.log(`uploading zip ${zipUrl}`);
          
          lib.uploadS3(zipUrl, options, f.slot());
        },
        s3Url => {
          console.log(`upload complete, url for download ${s3Url}`);
          
          route.url = s3Url;
          Route.findOneAndUpdate(
            { _id: route._id },
            route,
            { new: true },
            (err, updatedRoute) => {
              if (err) return done(err, null);
              console.log('delete tmp dir');
              
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
