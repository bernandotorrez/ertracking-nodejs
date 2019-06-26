var soap = require('soap');
var constant = require('../config/constants');

module.exports = function (req, res, next) { 
    // 401 Unauthorized
    // 403 Forbidden 

    var {
        nik
    } = req.session

    if (!req.session.level || req.session.level == '') {

        // delete session object
        return res.status(403).send('Access Denied');

    } else {

        return next()
    }
  }