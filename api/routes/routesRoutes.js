'use strict';
module.exports = function(app) {
  var routesController = require('../controllers/routesController');

  // todoList Routes
  app.route('/routes').post(routesController.download_all_routes);
  app.route('/routes/download/:id').get(routesController.download_zip);
};