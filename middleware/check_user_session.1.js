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

        const url = constant.url_ws;

        let args = {
            
                id: '',
                nik: `${nik}`
            
        }

        soap.createClientAsync(url).then((client) => {

            client.fsGetMasterAkses(args, function (err, result, rawResponse, soapHeader, rawRequest) {
                let callback_data;
                if (result.responsearrayDataHakAkses!=null) {
                    data = result.responsearrayDataHakAkses[0];
                    var active = data.active;
                    if(active=='0') {
                        return res.status(403).send('Access Denied, Your NIK is Not Active');
                    } else {
                        return next()
                    }
                } else {
                    return next()
                }
                
            })
        })
    }
  }