
const staticController = require('../controllers/staticController')
const routesRoutes = require('./routesRoutes');

module.exports = function(app) {
  routesRoutes(app);
  app.route('/ping').get(staticController.ping);  
};