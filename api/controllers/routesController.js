const fs = require('fs');
var kue = require("kue"),
  queue = kue.createQueue();
const downloadRoutesJob = require("../jobs/route");
const uuidv4 = require("uuid/v4");
const Route = require("../models/routesModel");
const suuntoUploader = require("../lib/suunto-upload/suunto-uploader");


exports.download_all_routes = function(req, res) {
  const uuid = uuidv4();
  console.log(req.body, `new route request for ${uuid}`);

  //create a mongo object to save refrence to this download info
  var newRoute = new Route({
    uuid: uuid,
    routeIds: req.body.data,
    downloadType: req.body.type,
    cookie: req.body.cookie,
    format: req.body.options.format,
    sendTo: req.body.options.sendTo,
    dates: req.body.options.dates
  });
  newRoute.save(function(err, route) {
    if (err) res.send(err);
    console.log("route saved", err, route);

    //fetching routes can take a while...spin off a job to fetch, upload to s3 and notify
    const jobName = `downloadRoute_${route.uuid}`;
    queue
      .create(jobName, route)
      .priority("high")
      .attempts(5)
      .save();
    queue.process(jobName, function(job, done) {
      downloadRoutesJob(job.data, done);

      // end the process
      queue.shutdown(0, endError => {
        console.log("ending", endError);
      });
    });
    res.json(route);
  });
};
exports.upload_routes = function(req, res) {
  if (req.files) {
    const file = req.files.file;
    const rootDir = process.cwd();
    const uuid = uuidv4();
    const dir = `${rootDir}/tmp/${uuid}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const filePath = `/${dir}/${file.name}`;
    file.mv(filePath, err => {
      if (!err) {
        suuntoUploader(filePath,dir, req.body, (err, result) => {
          console.log(result);
          res.send(result);
        });
      } else {
        res.status(500).send({ message: "Unable to process file" });
      }
    });
  } else {
    res.status(500).send({ message: "Unable to process file" });
  }
};

exports.get_route = function(req, res) {
  Route.findById(req.params.id, function(err, route) {
    if (err) res.send(err);
    res.json(route);
  });
};
