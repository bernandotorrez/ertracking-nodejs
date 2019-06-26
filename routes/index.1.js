var express = require('express');
var router = express.Router();
var constant = require('../config/constants');
var ActiveDirectory = require('activedirectory');
var md5 = require('md5');
var general_function = require('../config/function');
var config = {
  url: 'ldap://ldap.bussan.co.id',
  baseDN: 'DC=bussan,DC=co,DC=id',
  username: 'CN=eyasrvc,OU=Services,OU=Information Technology,OU=Headquarter,DC=bussan,DC=co,DC=id',
  password: 'Bussan100'
}

var ad = new ActiveDirectory(config);
var soap = require('soap');

// CSRF Protection
var csrf = require('csurf');
var csrfProtection = csrf({
  cookie: true
});
// CSRF Protection

/* GET home page. */
router.get('/', (req, res, next) => {

  res.redirect('/login')
});

// winAuth = function (req, res, next) {
//   var useragent = require('express-useragent');
//   var source = req.headers['user-agent'];
//   ua = useragent.parse(source);
//   if(JSON.stringify(ua.isFirefox)=='false'){
//     var nodeSSPIObj = new nodeSSPI({
//         retrieveGroups: false,
//     })
//     nodeSSPIObj.authenticate(req, res, function (err) {
//         res.finished || next()
//     })
//   } else {
//     res.finished || next()
//   }
// }

router.get('/login', csrfProtection, (req, res, next) => {
  var useragent = require('express-useragent');
  var source = req.headers['user-agent'];
  ua = useragent.parse(source);
  if (JSON.stringify(ua.isFirefox) == 'false') {
    //  var nik = req.connection.user.substring(7, 18);
    //req.flash('info', 'Welcome');
    res.render('login_firefox', {

      title: constant.title,
      csrfToken: req.csrfToken()
    });
  } else {
    //req.flash('info', 'Welcome');
    res.render('login_firefox', {
      title: constant.title,
      csrfToken: req.csrfToken()
    });
  }
})

router.get('/login/chrome', (req, res, next) => {

  var {
    nik
  } = req.body;
  //var nik = '0246001010';

  ad.findUser('0441380718', function (err, user) {

    if (err) {
      res.send(err)
    }

    if (!user) {
      res.send('User: ' + nik + ' not found.');
    } else {
      res.send(user)
    }
  });
})

router.post('/login/firefox', csrfProtection, (req, res, next) => {

  var {
    nik,
    password
  } = req.body;

  adFindUser(nik, (result) => {

    let cn = `CN=${result.cn}`;
    adAuthenticate(result.dn, password, (login) => {

      if (login === true) {
        adFindUsers(cn, (results) => {
          var {
            givenName,
            employeeID
          } = results

          getDataEmployeeNIK(employeeID, (result_employee) => {

            // Error Handling WS
            if (result_employee.err) {
              next(result_employee.err)
            }

            req.session.departemen = result_employee.departemen;
            req.session.nama = givenName
            req.session.login = 'true'
            req.session.nik = employeeID
            req.session.login_time = general_function.login_time()

            //Cek apakah HQ atau Cabang
            var str = results.dn;
            var n = str.indexOf("Cabang");

            if (n == '-1') {
              var level = 'Headquarter'

              // Cek apakah cost control

              var departemen = results.groups[3].cn
              var departemen1 = results.groups[2].cn
              var is_cost_control = departemen.indexOf("CostControl");
              var is_cost_control1 = departemen1.indexOf("CostControl");

              if (is_cost_control == '-1' && is_cost_control1 == '-1') {
                var cost_control = 'false'
              } else {
                var cost_control = 'true'
              }
              // Cek apakah Cost Control

            } else {
              var level = 'Cabang'
            }
            //Cek apakah HQ atau Cabang

            req.session.level = level
            req.session.cost_control = cost_control

            res.redirect('/home')
          })
        })
      } else {
        req.flash('info', '<div class="alert alert-danger text-center"><strong>NIK</strong> atau <strong>Password</strong> anda Salah!</div>');
        res.redirect('/');
      }



    })
  })

})

router.get('/login/admin', csrfProtection, (req, res, next) => {
  res.render('login_admin', {
    title: constant.title,
    csrfToken: req.csrfToken()
  });
})

router.post('/login/admin', csrfProtection, (req, res, next) => {

  var {
    username,
    password
  } = req.body;

  LoginAdmin(username, password, (result) => {

    // Error Handling WS
    if (result.err) {
      next(result.err)
    }

    let {
      id_admin,
      nama
    } = result;

    if (id_admin === null) {
      req.flash('info', '<div class="alert alert-danger text-center"><strong>Username</strong> atau <strong>Password</strong> anda Salah!</div>');
      res.redirect('/login/admin');
    } else {
      req.session.nama = nama;
      req.session.departemen = 'COST CONTROL';
      req.session.login_time = general_function.login_time();
      req.session.level = 'admin'

      res.redirect('/admin');
    }
  })

})

router.get('/logout', (req, res, next) => {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }

})

router.get('/login/kakadewa', csrfProtection, (req, res, next) => {
  res.render('login_kakadewa', {

    title: constant.title,
    csrfToken: req.csrfToken()
  });
})

router.post('/login/kakadewa', csrfProtection, (req, res, next) => {
  let {
    nik
  } = req.body;

  adFindUser(nik, (result) => {

    if (result.status == 'gagal') {
      req.flash('info', '<div class="alert alert-danger text-center"><strong>NIK Tidak ditemukan</strong></div>');
      res.redirect('/login/kakadewa');
    } else {

      let cn = `CN=${result.cn}`;
      adFindUsers(cn, (results) => {
        var {
          givenName,
          employeeID
        } = results

        getDataEmployeeNIK(employeeID, (result_employee) => {

          // Error Handling WS
          if (result_employee.err) {
            next(result_employee.err)
          }

          req.session.departemen = result_employee.departemen;
          req.session.nama = givenName
          req.session.login = 'true'
          req.session.nik = employeeID
          req.session.login_time = general_function.login_time()

          //Cek apakah HQ atau Cabang
          var str = results.dn;
          var n = str.indexOf("Cabang");

          if (n == '-1') {
            var level = 'Headquarter'

            // Cek apakah cost control

            var departemen = results.groups[3].cn
            var departemen1 = results.groups[2].cn
            var is_cost_control = departemen.indexOf("CostControl");
            var is_cost_control1 = departemen1.indexOf("CostControl");

            if (is_cost_control == '-1' && is_cost_control1 == '-1') {
              var cost_control = 'false'
            } else {
              var cost_control = 'true'
            }
            // Cek apakah Cost Control

          } else {
            var level = 'Cabang'
          }
          //Cek apakah HQ atau Cabang
          req.session.level = level
          req.session.cost_control = cost_control

          res.redirect('/home')
        })
      })

    }


  })
})


router.get('/forbidden', (req, res, next) => {
  var {
    level,
    cost_control,
    nama
  } = req.session
  res.render('layout', {
    title: constant.title,
    nama: nama,
    content: '/user/forbidden',
    title_page: 'FORBIDDEN',
    body_class: 'no-skin',
    level: level,
    url: req.url,
    menu: general_function.cek_level(level),
    cost_control: cost_control
  });
})

// Function Active Directory
function adFindUser(nik, callback) {
  let msg, status;
  ad.findUser(nik, function (err, user) {

    if (err) {
      callback(err)
      return;
    }

    if (!user) {

      callback({
        status: 'gagal',
        msg: 'User: ' + nik + ' not found.'
      });
    } else {
      callback(user)
    }
  });
}

function adFindUsers(cn, callback) {
  ad.findUsers(cn, true, function (err, results) {
    if ((err) || (!results)) {
      callback('ERROR: ' + JSON.stringify(err));
      return;
    }

    callback(results[0])

  });
}

function adAuthenticate(dn, password, callback) {
  ad.authenticate(dn, password, function (err, auth) {
    if (err) {
      callback(err.description);
      return;
    }

    if (auth) {
      //res.send('Login Berhasil!');
      callback(auth)

    } else {
      callback('Login Gagal!');
    }

  });
}
// Function Active Directory

function getDataEmployeeNIK(no_karyawan, callback) {
  const url = constant.url_ws_employee;

  let args1 = {
    docGetEmployeeDataDynRequest: {
      NO_KARYAWAN: no_karyawan
    }
  }

  soap.createClientAsync(url).then((client) => {

      client.getEmployeeData1Dyn(args1, function (err, result, rawResponse, soapHeader, rawRequest) {

        if (!result) {
          callback('Data tidak Ditemukan')

        } else {
          var {
            NO_KARYAWAN,
            NAMA,
            DIVISI,
            DEPARTEMEN,
            JOB,
            POSISI,
            CABANG
          } = result.docGetEmployeeDataDynResponse;
          var data = {
            'no_karyawan': NO_KARYAWAN,
            'nama': NAMA,
            'cabang': CABANG,
            'divisi': DIVISI,
            'departemen': DEPARTEMEN,
            'job': JOB,
            'posisi': POSISI
          }
        }
        callback(data)

      })
    })
    .catch(err => {
      callback({
        'err': err
      });
    })

}

function LoginAdmin(username, password, callback) {
  const url = constant.url_ws;

  let args1 = {

    username: username,
    password: md5(password)

  }

  soap.createClientAsync(url).then((client) => {

      client.fsLoginAdmin(args1, function (err, result, rawResponse, soapHeader, rawRequest) {

        if (!result) {
          callback({
            'id_admin': null,
            'nama': null
          })
        } else {
          let hasil = result.loginAdmin[0]
          callback(hasil)
        }


      })
    })
    .catch(err => {
      callback({
        'err': err
      });
    })
}

module.exports = router;