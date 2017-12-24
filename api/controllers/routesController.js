
const async = require("async");
const createFile = require("create-file");
var ff = require("ff");
var fs = require('fs');
const uuidv4 = require("uuid/v4");

const config = require("../config");
var mailgun = require('mailgun-js')(config.mailgun);
const Route = require("../models/routesModel");
const  lib = require('../lib');

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
      lib.download(options).then(response => {
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
          lib.archive(archivableFiles, options, f.slot());
        },
        zipUrl => {
          lib.uploadS3(zipUrl, options, f.slot());
        },
        s3Url => {
          var newRoute = new Route({ url: s3Url, uuid: uuid });
          newRoute.save(function(err, route) {
            if (err) res.send(err);
            deleteFolderRecursive(dir);
            lib.email(route,{to:'eric@ericmcconkie.com'})
            res.json(route);
          });
        }
      ).onComplete(result => {
        console.log("all done** - zip url = ", result);
      });
    }
  );
};
exports.get_route = function(req, res) {
  // var file = __dirname + `/zips/gpxs_${req.params.id}.zip`;

  // res.download(file); // Set disposition and send it.
  Route.findById(req.params.id, function(err, route) {
    if (err)
      res.send(err);
    res.json(route);
  });
};

