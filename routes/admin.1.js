var express = require('express');
var router = express.Router();
var constant = require('../config/constants')
var general_function = require('../config/function');
var ActiveDirectory = require('activedirectory');

var config = {
    url: 'ldap://ldap.bussan.co.id',
    baseDN: 'DC=bussan,DC=co,DC=id',
    username: 'CN=eyasrvc,OU=Services,OU=Information Technology,OU=Headquarter,DC=bussan,DC=co,DC=id',
    password: 'Bussan100'
}

const sequelize = require('../config/database');
const CekAksesModel = require('../models/cek_akses');
const TipeERModel = require('../models/tipe_er');
const MasterCheckerModel = require('../models/master_checker');
const MasterValidatorModel = require('../models/master_validator');
const CheckerModel = require('../models/checker');
const DepartemenModel = require('../models/departemen');

// CSRF Protection
var csrf = require('csurf');
var csrfProtection = csrf({
    cookie: true
});
// CSRF Protection

// Cek Session apakah ada atau tidak dan apakah session login sebagai admin, kalo tidak oper ke Halaman Login
var check_session_admin = require('../middleware/check_admin_session');

router.all('*', check_session_admin, (req, res, next) => {
    next()
})
// Cek Session apakah ada atau tidak dan apakah session login sebagai admin, kalo tidak oper ke Halaman Login

// Halaman index Admin
router.get('/', function (req, res, next) {
    var {
        level,
        cost_control,
        nama
    } = req.session
    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/admin/home',
        title_page: 'INDEX',
        body_class: 'no-skin',
        div_id: 'home',
        level: level,
        url: req.url,
        menu: general_function.cek_level(level),
        cost_control: cost_control
    });
});
// Halaman index Admin

// Halaman profil Admin
router.get('/profil', check_session_admin, (req, res, next) => {
    var {
        level,
        nama,
        login_time
    } = req.session
    var data = {
        nama: nama,
        login_time: login_time
    }
    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/admin/profile',
        title_page: 'PROFILE',
        body_class: 'no-skin',
        div_id: 'home',
        data_employee: data,
        level: level,
        url: req.url,
        menu: general_function.cek_level(level)
    })
})
// Halaman profil Admin

// Halaman Atur Hak Akses
router.get('/akses', csrfProtection, async (req, res, next) => {
    var {
        level,
        nama
    } = req.session

    var data = await sequelize.query("SELECT * FROM view_hak_akses", {
        type: sequelize.QueryTypes.SELECT
    });

    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/admin/akses',
        title_page: 'HAK AKSES',
        body_class: 'no-skin',
        div_id: 'home',
        level: level,
        url: req.url,
        data: data,
        menu: general_function.cek_level(level),
        csrfToken: req.csrfToken()
    })
})
// Halaman Atur Hak Akses


// Proses Delete Data Hak Akses
router.get('/delete_akses/:id', (req, res, next) => {
    var {
        id
    } = req.params;
    var {
        level,
        nama,
        login_time
    } = req.session

    CekAksesModel.update({
            deleted: '1',
            updated_date: `${general_function.login_time_his()}`,
            updated_by: `${nama}`,
        }, {
            where: {
                id_akses: `${id}`
            },
            returning: true,
            plain: true
        })
        .then(result => {
            if (result[1] == '1') {
                req.flash('info', '<div class="alert alert-success text-center"><strong>Hapus data Berhasil</strong></div>');
            } else if (result[1] == '0') {
                req.flash('info', '<div class="alert alert-danger text-center"><strong>Hapus data Gagal</strong></div>');
            }

            res.redirect('/admin/akses')
        })

})
// Proses Delete Data Hak Akses

// Proses Insert Data Hak Akses
router.post('/insert_akses', csrfProtection, (req, res, next) => {
    var {
        domain,
        active
    } = req.body;

    domain = domain.trim()

    var ad = new ActiveDirectory(config);

    var {
        level,
        nama,
        login_time
    } = req.session

    ad.findUser(domain, function (err, user) {

        if (user === undefined || user === "undefined") {
            req.flash('info', '<div class="alert alert-danger text-center"><strong>NIK Tidak ditemukan</strong></div>');
            res.redirect('/admin/akses');
        } else {

            if (user.givenName == user.sn) {
                var nama_employee = user.givenName
            } else {
                var nama_employee = user.givenName + ' ' + user.sn;
            }

            CekAksesModel.findOne({
                    where: {
                        nik: `${domain}`,
                        deleted: '0'
                    }
                })
                .then(result => {
                    if (result) {
                        req.flash('info', '<div class="alert alert-info text-center"><strong>NIK sudah ada</strong></div>');

                        res.redirect('/admin/akses')
                    } else {
                        var query_insert = `INSERT INTO dbo.cek_akses (nik, nama, created_date, created_by, 
                    updated_date, updated_by, deleted, active) 
                    VALUES ('${domain}', '${nama_employee}', '${general_function.login_time_his()}', '${nama}',
                    '${general_function.login_time_his()}', '${nama}', '0', '${active}')`;

                        sequelize.query(query_insert).spread((results, metadata) => {
                            if (metadata == '1') {
                                req.flash('info', '<div class="alert alert-success text-center"><strong>Input data Berhasil</strong></div>');
                            } else {
                                req.flash('info', '<div class="alert alert-danger text-center"><strong>Input data Gagal</strong></div>');
                            }

                            res.redirect('/admin/akses')

                        })
                    }

                })
        }
    });

})
// Proses Insert Data Hak Akses

// Halaman Edit Hak Akses
router.get('/edit_akses/:id/:nik/:active', csrfProtection, (req, res, next) => {
    var {
        id,
        nik,
        active
    } = req.params;

    var {
        level,
        nama,
        login_time
    } = req.session

    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/admin/edit_akses',
        title_page: 'HAK AKSES',
        body_class: 'no-skin',
        div_id: 'home',
        level: level,
        url: req.url,
        data: {
            'id': id,
            'nik': nik,
            'active': active
        },
        menu: general_function.cek_level(level),
        csrfToken: req.csrfToken()
    })

})
// Halaman Edit Hak Akses

// Proses Update Data Hak Akses
router.post('/edit_akses', csrfProtection, (req, res, next) => {
    var {
        id_akses,
        domain,
        active
    } = req.body;
    var ad = new ActiveDirectory(config);
    var {
        level,
        nama,
        login_time
    } = req.session

    ad.findUser(domain, function (err, user) {
        var nama_employee = user.givenName + ' ' + user.sn;

        CekAksesModel.update({
                active: `${active}`,
                updated_date: `${general_function.login_time_his()}`,
                updated_by: `${nama}`,
            }, {
                where: {
                    id_akses: `${id_akses}`
                },
                returning: true,
                plain: true
            })
            .then(result => {
                if (result[1] == '1') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
                } else if (result[1] == '0') {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal</strong></div>');
                }

                res.redirect('/admin/akses')
            })
    });
})
// Proses Update Data Hak Akses

// Halaman Tipe ER
router.get('/tipe_er', async (req, res, next) => {
    var {
        level,
        nama
    } = req.session

    var query = `select * from view_tipe_er order by TIPE_ER asc`;
    var data = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT
    });

    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/admin/tipe_er',
        title_page: 'TIPE ER',
        body_class: 'no-skin',
        div_id: 'home',
        level: level,
        url: req.url,
        data: data,
        menu: general_function.cek_level(level)
    })

})
// Halaman Tipe ER

// Proses Insert Data Tipe ER 
router.post('/tipe_er', (req, res, next) => {
    var {
        tipe_er,
        deskripsi
    } = req.body;
    tipe_er = general_function.capital_each_word(tipe_er)
    deskripsi = general_function.capital_each_word(deskripsi)
    var {
        nama
    } = req.session

    var query_insert = `INSERT INTO dbo.tipe_er_list (TIPE_ER, DESKRIPSI, created_date, created_by, 
            updated_date, updated_by, deleted) 
            VALUES ('${tipe_er}', '${deskripsi}', '${general_function.login_time_his()}', '${nama}',
            '${general_function.login_time_his()}', '${nama}', '0')`;

    TipeERModel.findOne({
            where: {
                TIPE_ER: `${tipe_er}`,
                deleted: '0'
            }
        })
        .then(result => {
            if (result) {
                req.flash('info', '<div class="alert alert-info text-center"><strong>Tipe ER sudah ada</strong></div>');

                res.redirect('/admin/tipe_er')
            } else {

                sequelize.query(query_insert).spread((results, metadata) => {
                    if (metadata == '1') {
                        req.flash('info', '<div class="alert alert-success text-center"><strong>Input data Berhasil</strong></div>');
                    } else {
                        req.flash('info', '<div class="alert alert-danger text-center"><strong>Input data Gagal</strong></div>');
                    }

                    res.redirect('/admin/tipe_er')

                })
            }

        })

})
// Proses Insert Data Tipe ER 

// Halaman Edit Tipe ER
router.get('/edit_tipe_er/:id', async (req, res, next) => {
    var {
        level,
        nama
    } = req.session
    var {
        id,
    } = req.params

    var query = `select id_tipe, TIPE_ER, DESKRIPSI from view_tipe_er where id_tipe = ${id}`;
    var data = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT
    });

    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/admin/edit_tipe_er',
        title_page: 'TIPE ER',
        body_class: 'no-skin',
        div_id: 'home',
        level: level,
        url: req.url,
        data: {
            'id': checkNULL(data[0].id_tipe),
            'tipe': checkNULL(data[0].TIPE_ER),
            'deskripsi':  checkNULL(data[0].DESKRIPSI)
        },
        menu: general_function.cek_level(level)
    })
})
// Halaman Edit Tipe ER

// Proses Update Data Tipe ER
router.post('/edit_tipe_er', (req, res, next) => {
    var {
        id_tipe,
        tipe_er,
        deskripsi
    } = req.body

    tipe_er = general_function.capital_each_word(tipe_er)
    deskripsi = general_function.capital_each_word(deskripsi)

    var {
        nama
    } = req.session

    TipeERModel.update({
            TIPE_ER: `${tipe_er}`,
            DESKRIPSI: `${deskripsi}`,
            updated_date: `${general_function.login_time_his()}`,
            updated_by: `${nama}`,
        }, {
            where: {
                id_tipe: `${id_tipe}`
            },
            returning: true,
            plain: true
        })
        .then(result => {
            if (result[1] == '1') {
                req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
            } else if (result[1] == '0') {
                req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal</strong></div>');
            }

            res.redirect('/admin/tipe_er')
        })
})
// Proses Update Data Tipe ER

// Proses Delete Data Tipe ER
router.get('/delete_tipe_er/:id', (req, res, next) => {
    var {
        id
    } = req.params;
    var {
        nama
    } = req.session

    TipeERModel.update({
            deleted: '1',
            updated_date: `${general_function.login_time_his()}`,
            updated_by: `${nama}`,
        }, {
            where: {
                id_tipe: `${id}`
            },
            returning: true,
            plain: true
        })
        .then(result => {
            if (result[1] == '1') {
                req.flash('info', '<div class="alert alert-success text-center"><strong>Hapus data Berhasil</strong></div>');
            } else if (result[1] == '0') {
                req.flash('info', '<div class="alert alert-danger text-center"><strong>Hapus data Gagal</strong></div>');
            }

            res.redirect('/admin/tipe_er')
        })
})
// Proses Delete Data Tipe ER

// Halaman Master Checker
router.get('/master_checker', async (req, res, next) => {
    var {
        level,
        nama
    } = req.session

    var query = `select * from view_master_checker order by nama_checker asc`;
    var data = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT
    })

    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/admin/master_checker',
        title_page: 'CHECKER',
        body_class: 'no-skin',
        div_id: 'home',
        level: level,
        url: req.url,
        data: data,
        menu: general_function.cek_level(level)
    })
})
// Halaman Master Checker

// Proses Delete Data Master Checker
router.get('/delete_master_checker/:id', (req, res, next) => {
    var {
        id
    } = req.params;
    var {
        nama
    } = req.session

    MasterCheckerModel.update({
            deleted: '1',
            updated_date: `${general_function.login_time_his()}`,
            updated_by: `${nama}`,
        }, {
            where: {
                id_checker: `${id}`
            },
            returning: true,
            plain: true
        })
        .then(result => {
            if (result[1] == '1') {
                req.flash('info', '<div class="alert alert-success text-center"><strong>Hapus data Berhasil</strong></div>');
            } else if (result[1] == '0') {
                req.flash('info', '<div class="alert alert-danger text-center"><strong>Hapus data Gagal</strong></div>');
            }

            res.redirect('/admin/master_checker')
        })
})
// Proses Delete Data Master Checker

// Proses Insert Data Master Checker
router.post('/master_checker', (req, res, next) => {
    var {
        nama_checker
    } = req.body;
    //nama_checker = nama_checker.charAt(0).toUpperCase()
    nama_checker = general_function.capital_each_word(nama_checker)
    var {
        nama
    } = req.session

    var query_insert = `INSERT INTO dbo.master_checker (nama_checker, created_date, created_by, 
            updated_date, updated_by, deleted) 
            VALUES ('${nama_checker}', '${general_function.login_time_his()}', '${nama}',
            '${general_function.login_time_his()}', '${nama}', '0')`;

    MasterCheckerModel.findOne({
            where: {
                nama_checker: `${nama_checker}`,
                deleted: '0'
            }
        })
        .then(result => {
            if (result) {
                req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Checker sudah ada</strong></div>');

                res.redirect('/admin/master_checker')
            } else {

                sequelize.query(query_insert).spread((results, metadata) => {
                    if (metadata == '1') {
                        req.flash('info', '<div class="alert alert-success text-center"><strong>Input data Berhasil</strong></div>');
                    } else {
                        req.flash('info', '<div class="alert alert-danger text-center"><strong>Input data Gagal</strong></div>');
                    }

                    res.redirect('/admin/master_checker')

                })
            }

        })

})
// Proses Insert Data Master Checker

// Halaman Edit Master Checker
router.get('/edit_master_checker/:id/:nama_checker', (req, res, next) => {
    var {
        level,
        nama
    } = req.session
    var {
        id,
        nama_checker
    } = req.params

    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/admin/edit_master_checker',
        title_page: 'CHECKER',
        body_class: 'no-skin',
        div_id: 'home',
        level: level,
        url: req.url,
        data: {
            'id': id,
            'nama_checker': nama_checker
        },
        menu: general_function.cek_level(level)
    })
})
// Halaman Edit Master Checker

// Proses Update Data Master Checker
router.post('/edit_master_checker', (req, res, next) => {
    var {
        id_checker,
        nama_checker
    } = req.body
    var {
        nama
    } = req.session

    nama = general_function.capital_each_word(nama)

    var query = `UPDATE dbo.master_checker SET nama_checker = '${nama_checker}', 
    updated_date = '${general_function.login_time_his()}', updated_by = '${nama}'  
    WHERE id_checker = '${id_checker}'`;

    MasterCheckerModel.update({
            nama_checker: `${nama_checker}`,
            updated_date: `${general_function.login_time_his()}`,
            updated_by: `${nama}`,
        }, {
            where: {
                id_checker: `${id_checker}`
            },
            returning: true,
            plain: true
        })
        .then(result => {
            if (result[1] == '1') {
                req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
            } else if (result[1] == '0') {
                req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal</strong></div>');
            }

            res.redirect('/admin/master_checker')
        })
})
// Proses Update Data Master Checker

// Halaman Master Validator
router.get('/master_validator', async (req, res, next) => {
    var {
        level,
        nama
    } = req.session

    var query = `select * from view_master_validator order by nama_validator asc`;
    var data = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT
    })

    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/admin/master_validator',
        title_page: 'VALIDATOR',
        body_class: 'no-skin',
        div_id: 'home',
        level: level,
        url: req.url,
        data: data,
        menu: general_function.cek_level(level)
    })
})
// Halaman Master Validator

// Proses Insert Data Master Validator
router.post('/master_validator', (req, res, next) => {
    var {
        nama_validator
    } = req.body;
    nama_validator = general_function.capital_each_word(nama_validator)
    var {
        nama
    } = req.session

    var query_insert = `INSERT INTO dbo.master_validator (nama_validator, created_date, created_by, 
            updated_date, updated_by, deleted) 
            VALUES ('${nama_validator}', '${general_function.login_time_his()}', '${nama}',
            '${general_function.login_time_his()}', '${nama}', '0')`;

    MasterValidatorModel.findOne({
            where: {
                nama_validator: `${nama_validator}`,
                deleted: '0'
            }
        })
        .then(result => {
            if (result) {
                req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Validator sudah ada</strong></div>');

                res.redirect('/admin/master_validator')
            } else {

                sequelize.query(query_insert).spread((results, metadata) => {
                    if (metadata == '1') {
                        req.flash('info', '<div class="alert alert-success text-center"><strong>Input data Berhasil</strong></div>');
                    } else {
                        req.flash('info', '<div class="alert alert-danger text-center"><strong>Input data Gagal</strong></div>');
                    }

                    res.redirect('/admin/master_validator')

                })
            }

        })

})
// Proses Insert Data Master Validator

// Proses Delete Data Master Validator
router.get('/delete_master_validator/:id', (req, res, next) => {
    var {
        id
    } = req.params;
    var {
        nama
    } = req.session
    var query = `UPDATE dbo.master_validator SET deleted = 1, 
    updated_date = '${general_function.login_time_his()}', updated_by = '${nama}'  
    WHERE id_validator = '${id}'`;

    MasterValidatorModel.update({
            deleted: '1',
            updated_date: `${general_function.login_time_his()}`,
            updated_by: `${nama}`,
        }, {
            where: {
                id_validator: `${id}`
            },
            returning: true,
            plain: true
        })
        .then(result => {
            if (result[1] == '1') {
                req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
            } else if (result[1] == '0') {
                req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal</strong></div>');
            }

            res.redirect('/admin/master_validator')
        })
})
// Proses Delete Data Master Validator

// Halaman Edit Data Master Validator
router.get('/edit_master_validator/:id/:nama_validator', (req, res, next) => {
    var {
        level,
        nama
    } = req.session
    var {
        id,
        nama_validator
    } = req.params

    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/admin/edit_master_validator',
        title_page: 'VALIDATOR',
        body_class: 'no-skin',
        div_id: 'home',
        level: level,
        url: req.url,
        data: {
            'id': id,
            'nama_validator': nama_validator
        },
        menu: general_function.cek_level(level)
    })
})
// Halaman Edit Data Master Validator

// Proses Update Data Master Validator
router.post('/edit_master_validator', (req, res, next) => {
    var {
        id_validator,
        nama_validator
    } = req.body
    var {
        nama
    } = req.session

    nama = general_function.capital_each_word(nama)

    MasterValidatorModel.update({
            nama_validator: `${nama_validator}`,
            updated_date: `${general_function.login_time_his()}`,
            updated_by: `${nama}`,
        }, {
            where: {
                id_validator: `${id_validator}`
            },
            returning: true,
            plain: true
        })
        .then(result => {
            if (result[1] == '1') {
                req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
            } else if (result[1] == '0') {
                req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal</strong></div>');
            }

            res.redirect('/admin/master_validator')
        })
})
// Proses Update Data Master Validator

// Halaman Checker
router.get('/checker', (req, res, next) => {
    var soap = require('soap');
    var url = constant.url_feedback;
    var {
        level,
        nama
    } = req.session;

    var query_master_checker = `select id_checker, nama_checker from view_master_checker order by nama_checker asc`;
    var query_validator = `select id_validator, nama_validator from view_master_validator order by nama_validator asc`;
    var query_list_checker = `select id_master_checker, id_cabang, id_checker, id_validator1, id_validator2, nama_checker, nama_validator1, nama_validator2 from view_list_checker order by id_cabang asc`;

    const data_master_checker = sequelize.query(query_master_checker, {
        type: sequelize.QueryTypes.SELECT
    });
    const data_master_validator = sequelize.query(query_validator, {
        type: sequelize.QueryTypes.SELECT
    });
    const data_list_checker = sequelize.query(query_list_checker, {
        type: sequelize.QueryTypes.SELECT
    });

    soap.createClientAsync(url).then((client) => {

        client.WSGetListBranch('', function (err, result, rawResponse, soapHeader, rawRequest) {
            if (err) {
                console.log(err)
            } else {

                var data_branch = result.docGetListBranchResponse.ArrayData

                Promise
                    .all([data_master_checker, data_master_validator, data_list_checker])
                    .then(responses => {
                        // responses[0]; data_master_checker
                        // responses[1]; data_master_validator
                        // responses[2]; data_list_checker

                        res.render('layout', {
                            title: constant.title,
                            nama: nama,
                            content: '/admin/checker',
                            title_page: 'CHECKER',
                            body_class: 'no-skin',
                            div_id: 'home',
                            level: level,
                            url: req.url,
                            data_branch: data_branch.reverse(),
                            data_checker: responses[0],
                            data_validator: responses[1],
                            data_list_checker: responses[2],
                            menu: general_function.cek_level(level)
                        })
                    })
                    .catch(err => {
                        console.log('**********ERROR RESULT****************');
                        console.log(err);
                    });

            }
        })
    })
})
// Halaman Checker

// Proses Delete Data Checker
router.get('/delete_checker/:id', (req, res, next) => {
    var {
        id
    } = req.params;
    var {
        nama
    } = req.session;

    CheckerModel.update({
            deleted: '1',
            updated_date: `${general_function.login_time_his()}`,
            updated_by: `${nama}`,
        }, {
            where: {
                id_master_checker: `${id}`
            },
            returning: true,
            plain: true
        })
        .then(result => {
            if (result[1] == '1') {
                req.flash('info', '<div class="alert alert-success text-center"><strong>Delete data Berhasil</strong></div>');
            } else if (result[1] == '0') {
                req.flash('info', '<div class="alert alert-danger text-center"><strong>Delete data Gagal</strong></div>');
            }

            res.redirect('/admin/checker')
        })
})
// Proses Delete Data Checker

// Proses Insert Data Checker
router.post('/checker', (req, res, next) => {
    var {
        kode_cabang,
        checker,
        validator1,
        validator2
    } = req.body;
    var {
        nama
    } = req.session

    var query_insert = `INSERT INTO dbo.checker (id_checker, id_validator1, id_validator2,
            id_cabang, created_date, created_by, 
            updated_date, updated_by, deleted) 
            VALUES ('${checker}', '${validator1}', '${validator2}', '${kode_cabang}', 
            '${general_function.login_time_his()}', '${nama}',
            '${general_function.login_time_his()}', '${nama}', '0')`;

    CheckerModel.findOne({
            where: {
                id_cabang: `${kode_cabang}`,
                deleted: '0'
            }
        })
        .then(result => {
            if (result) {
                req.flash('info', '<div class="alert alert-info text-center"><strong>Kode Cabang sudah ada</strong></div>');

                res.redirect('/admin/checker')
            } else {

                sequelize.query(query_insert).spread((results, metadata) => {
                    if (metadata == '1') {
                        req.flash('info', '<div class="alert alert-success text-center"><strong>Input data Berhasil</strong></div>');
                    } else {
                        req.flash('info', '<div class="alert alert-danger text-center"><strong>Input data Gagal</strong></div>');
                    }

                    res.redirect('/admin/checker')

                })
            }

        })

})
// Proses Insert Data Checker

// Halaman Edit Checker
router.get('/edit_checker/:id', (req, res, next) => {
    var soap = require('soap');
    var url = constant.url_feedback;
    var {
        level,
        nama
    } = req.session
    var {
        id
    } = req.params

    var query_master_checker = `select id_checker, nama_checker from view_master_checker order by nama_checker asc`;
    var query_validator = `select id_validator, nama_validator from view_master_validator order by nama_validator asc`;
    var query_list_checker = `select id_master_checker, id_cabang, id_checker, id_validator1, id_validator2, nama_checker, nama_validator1, nama_validator2 from view_list_checker where id_master_checker = '${id}'`;

    const data_master_checker = sequelize.query(query_master_checker, {
        type: sequelize.QueryTypes.SELECT
    });
    const data_master_validator = sequelize.query(query_validator, {
        type: sequelize.QueryTypes.SELECT
    });
    const data_list_checker = sequelize.query(query_list_checker, {
        type: sequelize.QueryTypes.SELECT
    });

    soap.createClientAsync(url).then((client) => {

        client.WSGetListBranch('', function (err, result, rawResponse, soapHeader, rawRequest) {
            if (err) {
                console.log(err)
            } else {
                //get data from SOAP/WSDL


                var data_branch = result.docGetListBranchResponse.ArrayData

                Promise
                    .all([data_master_checker, data_master_validator, data_list_checker])
                    .then(responses => {
                        // responses[0]; data_master_checker
                        // responses[1]; data_master_validator
                        // responses[2]; data_list_checker

                        res.render('layout', {
                            title: constant.title,
                            nama: nama,
                            content: '/admin/edit_checker',
                            title_page: 'CHECKER',
                            body_class: 'no-skin',
                            div_id: 'home',
                            level: level,
                            url: req.url,
                            data_branch: data_branch.reverse(),
                            data_checker: responses[0],
                            data_validator: responses[1],
                            data_list_checker: responses[2],
                            id_master_checker: id,
                            menu: general_function.cek_level(level)
                        })
                    })
                    .catch(err => {
                        console.log('**********ERROR RESULT****************');
                        console.log(err);
                    });


            }
        })
    })
})
// Halaman Edit Checker

// Proses Update Data Checker
router.post('/edit_checker', (req, res, next) => {
    var {
        id_master_checker,
        kode_cabang,
        checker,
        validator1,
        validator2
    } = req.body;
    var {
        nama
    } = req.session

    CheckerModel.update({
            id_cabang: `${kode_cabang}`,
            id_checker: `${checker}`,
            id_validator1: `${validator1}`,
            id_validator2: `${validator2}`,
            updated_date: `${general_function.login_time_his()}`,
            updated_by: `${nama}`,
        }, {
            where: {
                id_master_checker: `${id_master_checker}`
            },
            returning: true,
            plain: true
        })
        .then(result => {
            if (result[1] == '1') {
                req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
            } else if (result[1] == '0') {
                req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal</strong></div>');
            }

            res.redirect('/admin/checker')
        })
})
// Proses Update Data Checker

// Halaman Departemen
router.get('/departemen', async (req, res, next) => {
    var {
        level,
        nama
    } = req.session

    var query = `select * from view_master_departement order by Title asc`;
    var data = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT
    })

    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/admin/departemen',
        title_page: 'DEPARTEMEN',
        body_class: 'no-skin',
        div_id: 'home',
        level: level,
        url: req.url,
        data: data,
        menu: general_function.cek_level(level)
    })
})
// Halaman Departemen

// Proses Insert Data Departemen
router.post('/departemen', (req, res, next) => {
    var {
        nama_departemen
    } = req.body;
    nama_departemen = nama_departemen.toUpperCase()
    var {
        nama
    } = req.session

    var query_insert = `INSERT INTO dbo.department_list (Title, created_date, created_by, 
            updated_date, updated_by, deleted) 
            VALUES ('${nama_departemen}', '${general_function.login_time_his()}', '${nama}',
            '${general_function.login_time_his()}', '${nama}', '0')`;

    DepartemenModel.findOne({
            where: {
                Title: `${nama_departemen}`,
                deleted: '0'
            }
        })
        .then(result => {
            if (result) {
                req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Departemen sudah ada</strong></div>');

                res.redirect('/admin/departemen')
            } else {

                sequelize.query(query_insert).spread((results, metadata) => {
                    if (metadata == '1') {
                        req.flash('info', '<div class="alert alert-success text-center"><strong>Input data Berhasil</strong></div>');
                    } else {
                        req.flash('info', '<div class="alert alert-danger text-center"><strong>Input data Gagal</strong></div>');
                    }

                    res.redirect('/admin/departemen')

                })
            }

        })

})
// Proses Insert Data Departemen

// Proses Delete Data Departemen
router.get('/delete_departemen/:id', (req, res, next) => {
    var {
        id
    } = req.params;
    var {
        nama
    } = req.session;

    DepartemenModel.update({
            deleted: '1',
            updated_date: `${general_function.login_time_his()}`,
            updated_by: `${nama}`,
        }, {
            where: {
                id_departemen: `${id}`
            },
            returning: true,
            plain: true
        })
        .then(result => {
            if (result[1] == '1') {
                req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
            } else if (result[1] == '0') {
                req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal</strong></div>');
            }

            res.redirect('/admin/departemen')
        })
})
// Proses Delete Data Departemen

// Halaman Edit Departemen
router.get('/edit_departemen/:id/:departemen', (req, res, next) => {
    var {
        level,
        nama
    } = req.session
    var {
        id,
        departemen
    } = req.params

    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/admin/edit_departemen',
        title_page: 'DEPARTEMEN',
        body_class: 'no-skin',
        div_id: 'home',
        level: level,
        url: req.url,
        data: {
            'id': id,
            'departemen': departemen
        },
        menu: general_function.cek_level(level)
    })
})
// Halaman Edit Departemen

// Proses Update Data Departemen
router.post('/edit_departemen', (req, res, next) => {
    var {
        id_departemen,
        nama_departemen
    } = req.body
    var {
        nama
    } = req.session

    nama_departemen = nama_departemen.toUpperCase()

    var query = `UPDATE dbo.department_list SET Title = '${nama_departemen}', 
    updated_date = '${general_function.login_time_his()}', updated_by = '${nama}'  
    WHERE id_departemen = '${id_departemen}'`;

    DepartemenModel.update({
            Title: `${nama_departemen}`,
            updated_date: `${general_function.login_time_his()}`,
            updated_by: `${nama}`,
        }, {
            where: {
                id_departemen: `${id_departemen}`
            },
            returning: true,
            plain: true
        })
        .then(result => {
            if (result[1] == '1') {
                req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
            } else if (result[1] == '0') {
                req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal</strong></div>');
            }

            res.redirect('/admin/departemen')
        })
})
// Proses Update Data Departemen

function checkNULL(value){
    if(!value || value=='' || value==null || value===undefined) return '-'
    else return value
       
}
module.exports = router;