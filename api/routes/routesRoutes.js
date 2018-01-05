'use strict';
module.exports = function(app) {
  var routesController = require('../controllers/routesController');

  // todoList Routes
  app.route('/routes/download').post(routesController.download_all_routes);
  app.route('/routes/upload').post(routesController.upload_routes);
  app.route('/routes/:id').get(routesController.get_route);
};