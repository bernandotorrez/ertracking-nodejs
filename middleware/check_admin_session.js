module.exports = function (req, res, next) { 
    // 401 Unauthorized
    // 403 Forbidden 

    if (!req.session.level || req.session.level == '' || req.session.level != 'admin' && req.session.cost_control != 'true') {
            // delete session object
            return res.status(403).send('Access Denied');
    }
    
   next()
  }