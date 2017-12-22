'use strict';
module.exports = function(app) {
  var movesController = require('../controllers/movesController');

  // todoList Routes
  app.route('/moves').post(movesController.download_all_moves);  
};