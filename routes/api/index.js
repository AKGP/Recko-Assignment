const routes = require('express').Router();

var familyRoutes = require('../family/index.js');
var personRoutes = require('../person/index.js');
var universeRoutes = require('../universe/index.js');
routes.use('/family',familyRoutes);
routes.use('/person',personRoutes);
routes.use('/universe',universeRoutes);

module.exports = routes;