
var express = require('express'),
  app = express(),
  fileUpload = require('express-fileupload'),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  routes = require('./api/routes');  

 // print process.argv
var argv = require('minimist')(process.argv.slice(2));
console.log(argv,'argv');
if(argv && argv.port){
  port = argv.port
}
// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/MovesCountExporter'); 


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

routes(app); //register the route


app.listen(port);


console.log('API server started on: ' + port);
