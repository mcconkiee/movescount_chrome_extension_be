var kue = require("kue"),
  queue = kue.createQueue();
const downloadRoutesJob = require("../jobs/route");
const uuidv4 = require("uuid/v4");
const Route = require("../models/routesModel");

exports.download_all_routes = function(req, res) {
  const allIds = req.body.data;
  const uuid = uuidv4();
  var newRoute = new Route({
    uuid: uuid,
    routeIds: allIds,
    sendTo: req.body.sendTo,
    cookie: req.body.cookie
  });
  newRoute.save(function(err, route) {
    if (err) res.send(err);

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
exports.get_route = function(req, res) {
  Route.findById(req.params.id, function(err, route) {
    if (err) res.send(err);
    res.json(route);
  });
};
