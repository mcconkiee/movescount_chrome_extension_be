const config = require("../config");
var mailgun = require("mailgun-js")(config.mailgun);

const emailForRoutes = function emailForRoutes(route, options, done) {
    console.log('email route', route,options);
    
  var data = {
    from: "Mover <me@ericmcconkie.com>",
    to: route.sendTo, //TODO - make dynamic
    subject: "Your routes are ready!",
    text: `Hi - your routes are ready for download. You can get them here: ${
      route.url
    }`
  };

  mailgun.messages().send(data,done);
  
};
module.exports = emailForRoutes;
