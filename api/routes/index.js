const movesRoutes = require('./movesRoutes');
const routesRoutes = require('./routesRoutes');
module.exports = function(app) {
  movesRoutes(app);
  routesRoutes(app);
  // var movesController = require('../controllers/movesController');
  // app.route('/moves')
  //   .post(movesController.download_all_moves);
  
};