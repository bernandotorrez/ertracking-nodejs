var express = require('express');
var router = express.Router();
var constant = require('../config/constants')
var nodeSSPI = require('node-sspi')
var ActiveDirectory = require('activedirectory');
var md5 = require('md5');
var general_function = require('../config/function')
var config = { url: 'ldap://ldap.bussan.co.id',
                baseDN: 'DC=bussan,DC=co,DC=id',
                username: 'CN=eyasrvc,OU=Services,OU=Information Technology,OU=Headquarter,DC=bussan,DC=co,DC=id',
                password: 'Bussan100' }
var ad = new ActiveDirectory(config);
router.get('/', (req, res, next) => {
    let password = 'B3rnando13';
    let nik = '0441380718';
    adFindUser(nik, (result) => {
        let cn = `CN=${result.cn}`;
        adAuthenticate(result.dn, password, (login) => {
            adFindUsers(cn, (results) => {
                res.send(results)
            })
        })
    })
})

function adFindUser(nik, callback){
    
    ad.findUser(nik, function(err, user) {

      if (err) {
          callback(err)
          return;
      }
  
      if (! user) {
              callback('User: ' + nik + ' not found.');
          } else {
              callback(user)
          }
    });
  }

  function adFindUsers(cn, callback){
    ad.findUsers(cn, true, function(err, results) {
        if ((err) || (! results)) {
         callback('ERROR: ' + JSON.stringify(err));
          return;
        }
        
        callback(results[0])
        
      });
  }

  function adAuthenticate(dn, password, callback){
    ad.authenticate(dn, password, function(err, auth) {
        if (err) {
         callback(err.description);
         return;
        }
        
        if (auth) {
          //res.send('Login Berhasil!');
          callback(auth)
              
        }
        else {
          callback('Login Gagal!');
        }
        
      });
  }

//   function getNIK(callback){
    
//         var nodeSSPIObj = new nodeSSPI({
//             retrieveGroups: false,
//         })

//         callback(nodeSSPIObj)
//   }

  module.exports = router