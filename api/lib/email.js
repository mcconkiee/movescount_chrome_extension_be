const config = require("../config");
var mailgun = require("mailgun-js")(config.mailgun);

const emailForRoutes = function emailForRoutes(route, options, done) {
  var data = {
    from: "Mover <me@ericmcconkie.com>",
    to: options.to, //TODO - make dynamic
    subject: "Your routes are ready!",
    text: `Hi - your routes are ready for download. You can get them here: ${
      route.url
    }`
  };

  mailgun.messages().send(data, function(error, body) {    
    done(error,body);
  });
  
};
module.exports = emailForRoutes;
