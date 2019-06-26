var express = require('express');
var router = express.Router();
var constant = require('../config/constants')
var general_function = require('../config/function');
var ActiveDirectory = require('activedirectory');
var asyncMiddleware = require('../middleware/async');
var soap = require('soap');

var config = {
    url: 'ldap://ldap.bussan.co.id',
    baseDN: 'DC=bussan,DC=co,DC=id',
    username: 'CN=eyasrvc,OU=Services,OU=Information Technology,OU=Headquarter,DC=bussan,DC=co,DC=id',
    password: 'Bussan100'
}


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
        cost_control_menu,
        nama
    } = req.session
    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/admin/home',
        title_page: 'INDEX',
        body_class: 'no-skin',
        full_url: `${req.protocol}://${req.get('host')}/`,
        level: level,
        url: req.url,
        menu: general_function.cek_level(level),
        cost_control: cost_control,
        cost_control_menu: cost_control_menu
    });
});
// Halaman index Admin

// Halaman profil Admin
router.get('/profil', check_session_admin, (req, res, next) => {
    var {
        level,
        nama,
        login_time,
        cost_control_menu,
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
        full_url: `${req.protocol}://${req.get('host')}/`,
        data_employee: data,
        level: level,
        url: req.url,
        menu: general_function.cek_level(level),
        cost_control_menu: cost_control_menu
    })
})
// Halaman profil Admin

// Halaman Atur Hak Akses
router.get('/akses', (req, res, next) => {
    var full_url = `${req.protocol}://${req.get('host')}/`;
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session

    getDataMasterAkses('', '', (result) => {

        if (result.err) {
            next(result.err)
        }

        getDataListBranch((result_branch) => {
            if (result_branch.err) {
                next(result_branch.err)
            }
            res.render('layout', {
                title: constant.title,
                nama: nama,
                content: '/admin/akses',
                title_page: 'HAK AKSES',
                body_class: 'no-skin',
                data_branch: result_branch,
                level: level,
                url: req.url,
                data: result,
                cost_control: cost_control,
                full_url: full_url,
                menu: general_function.cek_level(level),
                cost_control_menu: cost_control_menu
            })
        })
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

    // Proses Delete Data
    getDataMasterAkses(id, '', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_akses == 'No Data') {

            req.flash('info', '<div class="alert alert-info text-center"><strong>NIK Tidak ada</strong></div>');

            res.redirect('/admin/akses')
        } else {

            let created_date = '',
                created_by = '',
                domain = '',
                updated_date = '',
                deleted = 1,
                nama_employee = '',
                updated_by = nama;

            let {
                active,
                is_cost_control,
                office_code,
                office_name,
                office_addr
            } = cek_result[0]

            insertDataMasterAkses(id, domain, nama_employee, active, deleted, created_date, created_by, updated_date, updated_by, is_cost_control, office_code, office_name, office_addr, (delete_result) => {

                // Error Handling WS
                if (delete_result.err) {
                    next(delete_result.err)
                }

                if (delete_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Hapus data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Hapus data Gagal, Error : ' + `${delete_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/akses')
            })
        }
    })
    // Proses Delete Data

})
// Proses Delete Data Hak Akses

// Proses Insert Data Hak Akses
router.post('/insert_akses', (req, res, next) => {
    var {
        domain,
        active,
        nama_karyawan,
        kode_cabang,
        is_cost_control
    } = req.body;

    domain = domain.toString().trim();

    var ad = new ActiveDirectory(config);

    var {
        level,
        nama,
        login_time
    } = req.session

    let created_date = general_function.login_time_his(),
        created_by = nama,
        updated_date = '',
        updated_by = '',
        deleted = 0

    // Proses Insert Data
    getDataMasterAkses('', domain, (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_akses != 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>NIK sudah ada</strong></div>');

            res.redirect('/admin/akses')
        } else {

            var office_code = split_branch(kode_cabang).office_code;
            var office_name = split_branch(kode_cabang).office_name;
            var office_addr = split_branch(kode_cabang).office_addr;

            insertDataMasterAkses('', domain, nama_karyawan, active, deleted, created_date, created_by, updated_date, updated_by, is_cost_control, office_code, office_name, office_addr, (insert_result) => {

                if (insert_result.err) {
                    next(insert_result.err)
                }

                if (insert_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Input data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Input data Gagal, Error : ' + `${insert_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/akses')
            })
        }
    })
    // Proses Insert Data


})
// Proses Insert Data Hak Akses

// Halaman Edit Hak Akses
router.get('/edit_akses/:id', (req, res, next) => {
    var {
        id,
        nik,
        active
    } = req.params;

    var {
        level,
        nama,
        login_time,
        cost_control,
        cost_control_menu
    } = req.session

    let requestSegments = req.path.split('/');

    getDataMasterAkses(id, '', (result) => {
        if (result.err) {
            next(result.err)
        }

        let {
            office_code
        } = result[0]

        getDataListBranch((result_branch) => {
            if (result_branch.err) {
                next(result_branch.err)
            }

            res.render('layout', {
                title: constant.title,
                nama: nama,
                content: '/admin/edit_akses',
                title_page: 'HAK AKSES',
                body_class: 'no-skin',
                level: level,
                cost_control: cost_control,
                url: requestSegments[1],
                full_url: `${req.protocol}://${req.get('host')}/`,
                data: {
                    'id': result[0].id_akses,
                    'nik': result[0].nik,
                    'active': result[0].active,
                    'data_branch': result_branch,
                    'nama': result[0].nama,
                    'is_cost_control': result[0].is_cost_control,
                    'office_code': office_code
                },
                menu: general_function.cek_level(level),
                cost_control_menu: cost_control_menu
            })
        })


    })



})
// Halaman Edit Hak Akses

// Proses Update Data Hak Akses
router.post('/edit_akses', (req, res, next) => {
    var {
        id_akses,
        domain,
        active,
        nama_karyawan,
        is_cost_control,
        kode_cabang
    } = req.body;

    var ad = new ActiveDirectory(config);

    var {
        level,
        nama,
        login_time
    } = req.session

    let updated_date = general_function.login_time_his(),
        updated_by = nama

    // Proses Update Data
    getDataMasterAkses(id_akses, '', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_akses == 'No Data') {

            req.flash('info', '<div class="alert alert-info text-center"><strong>NIK Tidak ada</strong></div>');

            res.redirect('/admin/akses')
        } else {

            let {
                deleted
            } = cek_result[0];
            let created_date = '',
                created_by = ''

            var office_code = split_branch(kode_cabang).office_code;
            var office_name = split_branch(kode_cabang).office_name;
            var office_addr = split_branch(kode_cabang).office_addr;

            insertDataMasterAkses(id_akses, domain, nama_karyawan, active, deleted, created_date, created_by, updated_date, updated_by, is_cost_control, office_code, office_name, office_addr, (update_result) => {

                if (update_result.err) {
                    next(update_result.err)
                }

                if (update_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal, Error : ' + `${update_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/akses')
            })
        }
    })
    // Proses Update Data


})
// Proses Update Data Hak Akses

// Halaman Tipe ER
router.get('/tipe_er', (req, res, next) => {
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session

    getDataMasterTipeER('', '', '1', (result) => {

        if (result.err) {
            next(result.err)
        }

        res.render('layout', {
            title: constant.title,
            nama: nama,
            content: '/admin/tipe_er',
            title_page: 'TIPE ER',
            body_class: 'no-skin',
            full_url: `${req.protocol}://${req.get('host')}/`,
            level: level,
            url: req.url,
            data: result,
            cost_control: cost_control,
            menu: general_function.cek_level(level),
            cost_control_menu: cost_control_menu
        })
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
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        insert_by = nama;
    } else {
        insert_by = nik;
    }

    let created_by = insert_by,
        deleted = 0,
        created_date = '',
        updated_date = '',
        updated_by = ''

    // Proses Insert Data
    getDataMasterTipeER('', tipe_er, '1', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        var er_type = '1';

        if (cek_result[0].id_tipe != 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Tipe ER sudah ada</strong></div>');

            res.redirect('/admin/tipe_er')
        } else {
            insertDataMasterTipeER('', tipe_er, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, (insert_result) => {

                if (insert_result.err) {
                    next(insert_result.err)
                }

                if (insert_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Input data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Input data Gagal, Error : ' + `${insert_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/tipe_er')
            })
        }
    })
    // Proses Insert Data

})
// Proses Insert Data Tipe ER 

// Halaman Edit Tipe ER
router.get('/edit_tipe_er/:id', (req, res, next) => {
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session
    var {
        id,
    } = req.params

    let requestSegments = req.path.split('/');

    getDataMasterTipeER(id, '', '1', (result) => {

        if (result.err) {
            next(result.err)
        }

        res.render('layout', {
            title: constant.title,
            nama: nama,
            content: '/admin/edit_tipe_er',
            title_page: 'TIPE ER',
            body_class: 'no-skin',
            level: level,
            cost_control: cost_control,
            url: requestSegments[1],
            full_url: `${req.protocol}://${req.get('host')}/`,
            data: {
                'id': checkNULLStrip(result[0].id_tipe),
                'tipe': checkNULLStrip(result[0].TIPE_ER),
                'deskripsi': checkNULLStrip(result[0].DESKRIPSI)
            },
            menu: general_function.cek_level(level),
            cost_control_menu: cost_control_menu
        })

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
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        edit_by = nama;
    } else {
        edit_by = nik;
    }

    let updated_by = edit_by,
        deleted = 0,
        created_date = '',
        created_by = '',
        updated_date = ''

    // Proses Update Data
    getDataMasterTipeER(id_tipe, '', '1', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        var er_type = '1';

        if (cek_result[0].id_tipe == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Tipe ER tidak ada</strong></div>');

            res.redirect('/admin/tipe_er')
        } else {
            insertDataMasterTipeER(id_tipe, tipe_er, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, (update_result) => {

                if (update_result.err) {
                    next(update_result.err)
                }

                if (update_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal, Error : ' + `${update_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/tipe_er')
            })
        }
    })
    // Proses Update Data

})
// Proses Update Data Tipe ER

// Proses Delete Data Tipe ER
router.get('/delete_tipe_er/:id', (req, res, next) => {
    var {
        id
    } = req.params;
    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        delete_by = nama;
    } else {
        delete_by = nik;
    }


    let updated_by = delete_by,
        deleted = 1,
        created_date = '',
        created_by = '',
        updated_date = ''

    // Proses Delete Data
    getDataMasterTipeER(id, '', '1', (cek_result) => {

        let {
            TIPE_ER,
            DESKRIPSI
        } = cek_result[0]

        if (cek_result.err) {
            next(cek_result.err)
        }

        var er_type = '1';

        if (cek_result[0].id_tipe == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Tipe ER tidak ada</strong></div>');

            res.redirect('/admin/tipe_er')
        } else {
            insertDataMasterTipeER(id, TIPE_ER, DESKRIPSI, created_date, created_by, updated_date, updated_by, deleted, er_type, (delete_result) => {

                if (delete_result.err) {
                    next(delete_result.err)
                }

                if (delete_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Delete data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Delete data Gagal, Error : ' + `${delete_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/tipe_er')
            })
        }
    })
    // Proses Delete Data
})
// Proses Delete Data Tipe ER

// Halaman Master Checker
router.get('/master_checker', (req, res, next) => {
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session

    getDataMasterChecker('', '', (result) => {

        res.render('layout', {
            title: constant.title,
            nama: nama,
            content: '/admin/master_checker',
            title_page: 'CHECKER',
            body_class: 'no-skin',
            level: level,
            url: req.url,
            cost_control: cost_control,
            full_url: `${req.protocol}://${req.get('host')}/`,
            data: result,
            menu: general_function.cek_level(level),
            cost_control_menu: cost_control_menu
        })
    })


})
// Halaman Master Checker

// Proses Delete Data Master Checker
router.get('/delete_master_checker/:id', (req, res, next) => {
    var {
        id
    } = req.params;
    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        delete_by = nama;
    } else {
        delete_by = nik;
    }

    // Proses Delete Data
    getDataMasterChecker(id, '', (cek_result) => {

        let {
            nama_checker
        } = cek_result[0];

        let updated_by = delete_by,
            deleted = 1,
            created_date = '',
            created_by = '',
            updated_date = ''

        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_checker == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Master Checker tidak ada</strong></div>');

            res.redirect('/admin/master_checker')
        } else {
            insertDataMasterChecker(id, nama_checker, created_date, created_by, updated_date, updated_by, deleted, (delete_result) => {

                if (delete_result.err) {
                    next(delete_result.err)
                }

                if (delete_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Delete data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Delete data Gagal, Error : ' + `${delete_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_checker')
            })
        }
    })
    // Proses Delete Data
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
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        insert_by = nama;
    } else {
        insert_by = nik;
    }

    let created_date = '',
        created_by = insert_by,
        updated_date = '',
        updated_by = '',
        deleted = 0

    // Proses Insert Data
    getDataMasterChecker('', nama_checker, (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_checker != 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Checker sudah ada</strong></div>');

            res.redirect('/admin/master_checker')
        } else {
            insertDataMasterChecker('', nama_checker, created_date, created_by, updated_date, updated_by, deleted, (insert_result) => {

                if (insert_result.err) {
                    next(insert_result.err)
                }

                if (insert_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Input data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Input data Gagal, Error : ' + `${insert_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_checker')
            })
        }
    })
    // Proses Insert Data

})
// Proses Insert Data Master Checker

// Halaman Edit Master Checker
router.get('/edit_master_checker/:id/:nama_checker', (req, res, next) => {
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
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
        full_url: `${req.protocol}://${req.get('host')}/`,
        level: level,
        url: req.url,
        cost_control: cost_control,
        data: {
            'id': id,
            'nama_checker': nama_checker
        },
        menu: general_function.cek_level(level),
        cost_control_menu: cost_control_menu
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
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        edit_by = nama;
    } else {
        edit_by = nik;
    }

    nama_checker = general_function.capital_each_word(nama_checker)

    // Proses Update Data
    getDataMasterChecker(id_checker, '', (cek_result) => {

        let updated_by = edit_by,
            deleted = 0,
            created_date = '',
            created_by = '',
            updated_date = ''

        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_checker == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Checker tidak ada</strong></div>');

            res.redirect('/admin/master_checker')
        } else {
            insertDataMasterChecker(id_checker, nama_checker, created_date, created_by, updated_date, updated_by, deleted, (update_result) => {

                if (update_result.err) {
                    next(update_result.err)
                }

                if (update_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal, Error : ' + `${update_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_checker')
            })
        }
    })
    // Proses Update Data

})
// Proses Update Data Master Checker

// Halaman Master Validator
router.get('/master_validator', (req, res, next) => {
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session

    getDataMasterValidator('', '', (result) => {

        if (result.err) {
            next(result.err)
        }

        res.render('layout', {
            title: constant.title,
            nama: nama,
            content: '/admin/master_validator',
            title_page: 'VALIDATOR',
            body_class: 'no-skin',
            level: level,
            full_url: `${req.protocol}://${req.get('host')}/`,
            url: req.url,
            data: result,
            cost_control: cost_control,
            menu: general_function.cek_level(level),
            cost_control_menu: cost_control_menu
        })
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
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        insert_by = nama;
    } else {
        insert_by = nik;
    }

    let created_date = '',
        created_by = insert_by,
        updated_date = '',
        updated_by = '',
        deleted = 0

    // Proses Insert Data
    getDataMasterValidator('', nama_validator, (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_validator != 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Validator sudah ada</strong></div>');

            res.redirect('/admin/master_validator')
        } else {
            insertDataMasterValidator('', nama_validator, created_date, created_by, updated_date, updated_by, deleted, (insert_result) => {

                if (insert_result.err) {
                    next(insert_result.err)
                }

                if (insert_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Input data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Input data Gagal, Error : ' + `${insert_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_validator')
            })
        }
    })
    // Proses Insert Data

})
// Proses Insert Data Master Validator

// Proses Delete Data Master Validator
router.get('/delete_master_validator/:id', (req, res, next) => {
    var {
        id
    } = req.params;
    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        delete_by = nama;
    } else {
        delete_by = nik;
    }

    // Proses Update Data
    getDataMasterValidator(id, '', (cek_result) => {

        let {
            nama_validator
        } = cek_result[0]

        let updated_by = delete_by,
            deleted = 1,
            created_date = '',
            created_by = '',
            updated_date = ''

        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_validator == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Validator tidak ada</strong></div>');

            res.redirect('/admin/master_validator')
        } else {
            insertDataMasterValidator(id, nama_validator, created_date, created_by, updated_date, updated_by, deleted, (delete_result) => {

                if (delete_result.err) {
                    next(delete_result.err)
                }

                if (delete_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Delete data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Delete data Gagal, Error : ' + `${delete_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_validator')
            })
        }
    })
    // Proses Update Data
})
// Proses Delete Data Master Validator

// Halaman Edit Data Master Validator
router.get('/edit_master_validator/:id/:nama_validator', (req, res, next) => {
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
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
        full_url: `${req.protocol}://${req.get('host')}/`,
        level: level,
        url: req.url,
        cost_control: cost_control,
        data: {
            'id': id,
            'nama_validator': nama_validator
        },
        menu: general_function.cek_level(level),
        cost_control_menu: cost_control_menu
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
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        edit_by = nama;
    } else {
        edit_by = nik;
    }

    nama_validator = general_function.capital_each_word(nama_validator)

    // Proses Update Data
    getDataMasterValidator(id_validator, '', (cek_result) => {

        let updated_by = edit_by,
            deleted = 0,
            created_date = '',
            created_by = '',
            updated_date = ''

        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_validator == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Validator tidak ada</strong></div>');

            res.redirect('/admin/master_validator')
        } else {
            insertDataMasterValidator(id_validator, nama_validator, created_date, created_by, updated_date, updated_by, deleted, (update_result) => {

                if (update_result.err) {
                    next(update_result.err)
                }

                if (update_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Update data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Update data Gagal, Error : ' + `${update_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_validator')
            })
        }
    })
    // Proses Update Data
})
// Proses Update Data Master Validator

// Halaman Checker
router.get('/checker', (req, res, next) => {
    var soap = require('soap');
    var url = constant.url_feedback;
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session;

    getDataMasterChecker('', '', (result_checker) => {
        if (result_checker.err) {
            next(result_checker.err)
        }

        getDataMasterValidator('', '', (result_validator) => {
            if (result_validator.err) {
                next(result_validator.err)
            }

            getDataListChecker('', '', '', (result_list_checker) => {
                if (result_list_checker.err) {
                    next(result_list_checker.err)
                }

                getDataListBranch((result_branch) => {
                    if (result_branch.err) {
                        next(result_branch.err)
                    }

                    res.render('layout', {
                        title: constant.title,
                        nama: nama,
                        content: '/admin/checker',
                        title_page: 'CHECKER',
                        body_class: 'no-skin',
                        full_url: `${req.protocol}://${req.get('host')}/`,
                        level: level,
                        url: req.url,
                        cost_control: cost_control,
                        data_branch: result_branch,
                        data_checker: result_checker,
                        data_validator: result_validator,
                        data_list_checker: result_list_checker,
                        menu: general_function.cek_level(level),
                        cost_control_menu: cost_control_menu
                    })

                })
            })
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
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        delete_by = nama;
    } else {
        delete_by = nik;
    }

    // Proses Update Data
    getDataListChecker(id, '', '', (cek_result) => {

        let updated_by = delete_by,
            deleted = 1,
            created_date = '',
            created_by = '',
            updated_date = '',
            checker = cek_result[0].id_checker,
            validator1 = cek_result[0].id_validator1,
            validator2 = cek_result[0].id_validator2,
            kode_cabang = cek_result[0].id_cabang


        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_master_checker == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Kode Cabang tidak ada</strong></div>');

            res.redirect('/admin/checker')
        } else {
            insertDataListChecker(id, checker, validator1, validator2, kode_cabang, created_date, created_by, updated_date, updated_by, deleted, (delete_result) => {

                if (delete_result.err) {
                    next(delete_result.err)
                }

                if (delete_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Delete data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Delete data Gagal, Error : ' + `${delete_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/checker')
            })
        }
    })
    // Proses Update Data
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
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        insert_by = nama;
    } else {
        insert_by = nik;
    }

    // Proses Insert Data
    getDataListChecker('', kode_cabang, '', (cek_result) => {

        let updated_by = '',
            deleted = 0,
            created_date = '',
            created_by = insert_by,
            updated_date = ''

        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_master_checker != 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Kode Cabang sudah ada</strong></div>');

            res.redirect('/admin/checker')
        } else {
            insertDataListChecker('', checker, validator1, validator2, kode_cabang, created_date, created_by, updated_date, updated_by, deleted, (insert_result) => {

                if (insert_result.err) {
                    next(insert_result.err)
                }

                if (insert_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Insert data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Insert data Gagal, Error : ' + `${insert_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/checker')
            })
        }
    })
    // Proses Insert Data

})
// Proses Insert Data Checker

// Halaman Edit Checker
router.get('/edit_checker/:id', (req, res, next) => {
    var soap = require('soap');
    var url = constant.url_feedback;
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session
    var {
        id
    } = req.params

    getDataMasterChecker('', '', (result_checker) => {
        if (result_checker.err) {
            next(result_checker.err)
        }

        getDataMasterValidator('', '', (result_validator) => {
            if (result_validator.err) {
                next(result_validator.err)
            }

            getDataListChecker(id, '', '', (result_list_checker) => {
                if (result_list_checker.err) {
                    next(result_list_checker.err)
                }

                res.render('layout', {
                    title: constant.title,
                    nama: nama,
                    content: '/admin/edit_checker',
                    title_page: 'CHECKER',
                    body_class: 'no-skin',
                    level: level,
                    url: req.url,
                    cost_control: cost_control,
                    full_url: `${req.protocol}://${req.get('host')}/`,
                    data_checker: result_checker,
                    data_validator: result_validator,
                    data_list_checker: result_list_checker,
                    id_master_checker: id,
                    menu: general_function.cek_level(level),
                    cost_control_menu: cost_control_menu
                })


            })
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
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        edit_by = nama;
    } else {
        edit_by = nik;
    }

    // Proses Update Data
    getDataListChecker('', kode_cabang, '', (cek_result) => {

        let updated_by = edit_by,
            deleted = 0,
            created_date = '',
            created_by = '',
            updated_date = ''

        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_master_checker == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Kode Cabang tidak ada</strong></div>');

            res.redirect('/admin/checker')
        } else {
            insertDataListChecker(id_master_checker, checker, validator1, validator2, kode_cabang, created_date, created_by, updated_date, updated_by, deleted, (update_result) => {

                if (update_result.err) {
                    next(update_result.err)
                }

                if (update_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Update data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Update data Gagal, Error : ' + `${update_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/checker')
            })
        }
    })
    // Proses Update Data
})
// Proses Update Data Checker

// Halaman Departemen
router.get('/departemen', (req, res, next) => {
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session

    getDataMasterDepartemen('', '', (result) => {
        res.render('layout', {
            title: constant.title,
            nama: nama,
            content: '/admin/departemen',
            title_page: 'DEPARTEMEN',
            body_class: 'no-skin',
            level: level,
            url: req.url,
            cost_control: cost_control,
            full_url: `${req.protocol}://${req.get('host')}/`,
            data: result,
            menu: general_function.cek_level(level),
            cost_control_menu: cost_control_menu
        })
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

    // Proses Insert Data
    getDataMasterDepartemen('', nama_departemen, (cek_result) => {

        let updated_by = '',
            deleted = 0,
            created_date = '',
            created_by = nama,
            updated_date = ''

        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_departemen != 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Departemen sudah ada</strong></div>');

            res.redirect('/admin/departemen')
        } else {
            insertDataMasterDepartemen('', nama_departemen, created_date, created_by, updated_date, updated_by, deleted, (insert_result) => {

                if (insert_result.err) {
                    next(insert_result.err)
                }

                if (insert_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Insert data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Insert data Gagal, Error : ' + `${insert_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/departemen')
            })
        }
    })
    // Proses Insert Data

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


    // Proses Delete Data
    getDataMasterDepartemen(id, '', (cek_result) => {

        let updated_by = nama,
            deleted = 1,
            created_date = '',
            created_by = '',
            updated_date = ''

        let {
            Title
        } = cek_result[0];

        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_departemen == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Departemen tidak ada</strong></div>');

            res.redirect('/admin/departemen')
        } else {
            insertDataMasterDepartemen(id, Title, created_date, created_by, updated_date, updated_by, deleted, (delete_result) => {

                if (delete_result.err) {
                    next(delete_result.err)
                }

                if (delete_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Hapus data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Hapus data Gagal, Error : ' + `${delete_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/departemen')
            })
        }
    })
    // Proses Delete Data
})
// Proses Delete Data Departemen

// Halaman Edit Departemen
router.get('/edit_departemen/:id/:departemen', (req, res, next) => {
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
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
        full_url: `${req.protocol}://${req.get('host')}/`,
        level: level,
        url: req.url,
        cost_control: cost_control,
        data: {
            'id': id,
            'departemen': departemen
        },
        menu: general_function.cek_level(level),
        cost_control_menu: cost_control_menu
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

    // Proses Update Data
    getDataMasterDepartemen(id_departemen, '', (cek_result) => {

        let updated_by = nama,
            deleted = 0,
            created_date = '',
            created_by = '',
            updated_date = ''

        if (cek_result.err) {
            next(cek_result.err)
        }

        if (cek_result[0].id_departemen == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Departemen tidak ada</strong></div>');

            res.redirect('/admin/departemen')
        } else {
            insertDataMasterDepartemen(id_departemen, nama_departemen, created_date, created_by, updated_date, updated_by, deleted, (update_result) => {

                if (update_result.err) {
                    next(update_result.err)
                }

                if (update_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Hapus data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Hapus data Gagal, Error : ' + `${update_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/departemen')
            })
        }
    })
    // Proses Update Data
})
// Proses Update Data Departemen

// Halaman Master TAC
router.get('/master_tac', (req, res, next) => {
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session

    getDataMasterTipeER('', '', '2', (result) => {
        res.render('layout', {
            title: constant.title,
            nama: nama,
            content: '/admin/master_tac',
            title_page: 'MASTER TAC',
            body_class: 'no-skin',
            level: level,
            url: req.url,
            cost_control: cost_control,
            full_url: `${req.protocol}://${req.get('host')}/`,
            data: result,
            menu: general_function.cek_level(level),
            cost_control_menu: cost_control_menu
        })
    })

})

router.post('/master_tac', (req, res, next) => {
    let {
        nama_tac
    } = req.body;

    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        insert_by = nama;
    } else {
        insert_by = nik;
    }

    nama_tac = general_function.capital_each_word(nama_tac)

    // Proses Insert Data
    getDataMasterTipeER('', nama_tac, '2', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        let created_date = '',
            created_by = insert_by,
            updated_date = '',
            updated_by = '',
            deleted = 0,
            er_type = '2',
            deskripsi = 'Master TAC'

        if (cek_result[0].id_tipe != 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama TAC sudah ada</strong></div>');

            res.redirect('/admin/master_tac')
        } else {
            insertDataMasterTipeER('', nama_tac, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, (insert_result) => {

                if (insert_result.err) {
                    next(insert_result.err)
                }

                if (insert_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Input data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Input data Gagal, Error : ' + `${insert_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_tac')
            })
        }
    })
    // Proses Insert Data

})
// Halaman Master TAC

router.get('/edit_master_tac/:id/:nama_tac', (req, res, next) => {

    let {
        id,
        nama_tac,
        cost_control,
        cost_control_menu
    } = req.params

    var {
        level,
        nama
    } = req.session

    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/admin/edit_master_tac',
        title_page: 'MASTER TAC',
        body_class: 'no-skin',
        level: level,
        url: req.url,
        cost_control: cost_control,
        full_url: `${req.protocol}://${req.get('host')}/`,
        data: {
            'id': id,
            'nama': nama_tac
        },
        menu: general_function.cek_level(level),
        cost_control_menu: cost_control_menu
    })
})

router.post('/edit_master_tac', (req, res, next) => {

    let {
        id_tac,
        nama_tac
    } = req.body;

    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        edit_by = nama;
    } else {
        edit_by = nik;
    }

    nama_tac = general_function.capital_each_word(nama_tac)

    // Proses Update Data
    getDataMasterTipeER(id_tac, '', '2', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        let created_date = '',
            created_by = '',
            updated_date = '',
            updated_by = edit_by,
            deleted = 0,
            er_type = '2',
            deskripsi = 'Master TAC'

        if (cek_result[0].id_tipe == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama TAC tidak ada</strong></div>');

            res.redirect('/admin/master_tac')
        } else {

            insertDataMasterTipeER(id_tac, nama_tac, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, (update_result) => {

                if (update_result.err) {
                    next(update_result.err)
                }

                if (update_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal, Error : ' + `${update_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_tac')
            })
        }
    })
    // Proses Update Data
})

router.get('/delete_master_tac/:id', (req, res, next) => {

    let {
        id,
    } = req.params;

    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        delete_by = nama;
    } else {
        delete_by = nik;
    }

    // Proses Delete Data
    getDataMasterTipeER(id, '', '2', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        let updated_by = delete_by,
            deleted = 1,
            created_date = '',
            created_by = '',
            updated_date = '',
            nama_tac = cek_result[0].TIPE_ER,
            deskripsi = cek_result[0].DESKRIPSI,
            er_type = '2';

        if (cek_result[0].id_tipe == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama TAC tidak ada</strong></div>');

            res.redirect('/admin/master_tac')
        } else {

            insertDataMasterTipeER(id, nama_tac, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, (delete_result) => {

                if (delete_result.err) {
                    next(delete_result.err)
                }

                if (delete_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Hapus data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Hapus data Gagal, Error : ' + `${delete_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_tac')
            })
        }
    })
    // Proses Delete Data
})

// Halaman Master ER BT 
router.get('/master_erbt', (req, res, next) => {
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session

    getDataMasterTipeER('', '', '3', (result) => {
        res.render('layout', {
            title: constant.title,
            nama: nama,
            content: '/admin/master_erbt',
            title_page: 'MASTER ER BT',
            body_class: 'no-skin',
            level: level,
            url: req.url,
            cost_control: cost_control,
            full_url: `${req.protocol}://${req.get('host')}/`,
            data: result,
            menu: general_function.cek_level(level),
            cost_control_menu: cost_control_menu
        })
    })
})

router.post('/master_erbt', (req, res, next) => {
    let {
        nama_erbt
    } = req.body;

    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        insert_by = nama;
    } else {
        insert_by = nik;
    }

    nama_erbt = general_function.capital_each_word(nama_erbt)

    // Proses Insert Data
    getDataMasterTipeER('', nama_erbt, '3', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        let created_date = '',
            created_by = insert_by,
            updated_date = '',
            updated_by = '',
            deleted = 0,
            er_type = '3',
            deskripsi = 'Master ER BT'

        if (cek_result[0].id_tipe != 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama ER BT sudah ada</strong></div>');

            res.redirect('/admin/master_erbt')
        } else {
            insertDataMasterTipeER('', nama_erbt, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, (insert_result) => {

                if (insert_result.err) {
                    next(insert_result.err)
                }

                if (insert_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Input data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Input data Gagal, Error : ' + `${insert_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_erbt')
            })
        }
    })
    // Proses Insert Data

})

router.get('/edit_master_erbt/:id', (req, res, next) => {

    let {
        id
    } = req.params

    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session

    getDataMasterTipeER(id, '', '3', (result) => {
        res.render('layout', {
            title: constant.title,
            nama: nama,
            content: '/admin/edit_master_erbt',
            title_page: 'MASTER ER BT',
            body_class: 'no-skin',
            level: level,
            url: req.url,
            cost_control: cost_control,
            full_url: `${req.protocol}://${req.get('host')}/`,
            data: {
                'id': id,
                'nama': result[0].TIPE_ER
            },
            menu: general_function.cek_level(level),
            cost_control_menu: cost_control_menu
        })
    })


})

router.post('/edit_master_erbt', (req, res, next) => {

    let {
        id_erbt,
        nama_erbt
    } = req.body;

    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        edit_by = nama;
    } else {
        edit_by = nik;
    }

    nama_erbt = general_function.capital_each_word(nama_erbt)

    // Proses Update Data
    getDataMasterTipeER(id_erbt, '', '3', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        let created_date = '',
            created_by = '',
            updated_date = '',
            updated_by = edit_by,
            deleted = 0,
            er_type = '3',
            deskripsi = 'Master ER BT'

        if (cek_result[0].id_tipe == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama ER BT tidak ada</strong></div>');

            res.redirect('/admin/master_erbt')
        } else {

            insertDataMasterTipeER(id_erbt, nama_erbt, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, (update_result) => {

                if (update_result.err) {
                    next(update_result.err)
                }

                if (update_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal, Error : ' + `${update_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_erbt')
            })
        }
    })
    // Proses Update Data
})

router.get('/delete_master_erbt/:id', (req, res, next) => {

    let {
        id,
    } = req.params;

    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        delete_by = nama;
    } else {
        delete_by = nik;
    }

    // Proses Delete Data
    getDataMasterTipeER(id, '', '3', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        let updated_by = delete_by,
            deleted = 1,
            created_date = '',
            created_by = '',
            updated_date = '',
            nama_erbt = cek_result[0].TIPE_ER,
            deskripsi = cek_result[0].DESKRIPSI,
            er_type = '3';

        if (cek_result[0].id_tipe == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama ER BT tidak ada</strong></div>');

            res.redirect('/admin/master_erbt')
        } else {

            insertDataMasterTipeER(id, nama_erbt, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, (delete_result) => {

                if (delete_result.err) {
                    next(delete_result.err)
                }

                if (delete_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Hapus data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Hapus data Gagal, Error : ' + `${delete_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_erbt')
            })
        }
    })
    // Proses Delete Data
})
// Halaman Master ER BT

// Halaman Master Lampiran
router.get('/master_lampiran', (req, res, next) => {
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session

    getDataMasterTipeER('', '', '4', (result) => {
        res.render('layout', {
            title: constant.title,
            nama: nama,
            content: '/admin/master_lampiran',
            title_page: 'MASTER Lampiran',
            body_class: 'no-skin',
            level: level,
            cost_control: cost_control,
            full_url: `${req.protocol}://${req.get('host')}/`,
            url: req.url,
            data: result,
            menu: general_function.cek_level(level),
            cost_control_menu: cost_control_menu
        })
    })
})

router.post('/master_lampiran', (req, res, next) => {
    let {
        nama_lampiran
    } = req.body;

    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        insert_by = nama;
    } else {
        insert_by = nik;
    }

    nama_lampiran = general_function.capital_each_word(nama_lampiran)

    // Proses Insert Data
    getDataMasterTipeER('', nama_lampiran, '4', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        let created_date = '',
            created_by = insert_by,
            updated_date = '',
            updated_by = '',
            deleted = 0,
            er_type = '4',
            deskripsi = 'Master Lampiran'

        if (cek_result[0].id_tipe != 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Lampiran sudah ada</strong></div>');

            res.redirect('/admin/master_lampiran')
        } else {
            insertDataMasterTipeER('', nama_lampiran, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, (insert_result) => {

                if (insert_result.err) {
                    next(insert_result.err)
                }

                if (insert_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Input data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Input data Gagal, Error : ' + `${insert_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_lampiran')
            })
        }
    })
    // Proses Insert Data

})

router.get('/edit_master_lampiran/:id', (req, res, next) => {

    let {
        id
    } = req.params

    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session

    getDataMasterTipeER(id, '', '4', (result) => {
        res.render('layout', {
            title: constant.title,
            nama: nama,
            content: '/admin/edit_master_lampiran',
            title_page: 'MASTER LAMPIRAN',
            body_class: 'no-skin',
            level: level,
            url: req.url,
            cost_control: cost_control,
            full_url: `${req.protocol}://${req.get('host')}/`,
            data: {
                'id': id,
                'nama': result[0].TIPE_ER
            },
            menu: general_function.cek_level(level),
            cost_control_menu
        })
    })


})

router.post('/edit_master_lampiran', (req, res, next) => {

    let {
        id_lampiran,
        nama_lampiran
    } = req.body;

    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        edit_by = nama;
    } else {
        edit_by = nik;
    }

    nama_lampiran = general_function.capital_each_word(nama_lampiran)

    // Proses Update Data
    getDataMasterTipeER(id_lampiran, '', '4', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        let created_date = '',
            created_by = '',
            updated_date = '',
            updated_by = edit_by,
            deleted = 0,
            er_type = '4',
            deskripsi = 'Master Lampiran'

        if (cek_result[0].id_tipe == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Lampiran tidak ada</strong></div>');

            res.redirect('/admin/master_lampiran')
        } else {

            insertDataMasterTipeER(id_lampiran, nama_lampiran, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, (update_result) => {

                if (update_result.err) {
                    next(update_result.err)
                }

                if (update_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal, Error : ' + `${update_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_lampiran')
            })
        }
    })
    // Proses Update Data
})

router.get('/delete_master_lampiran/:id', (req, res, next) => {

    let {
        id,
    } = req.params;

    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        delete_by = nama;
    } else {
        delete_by = nik;
    }

    // Proses Delete Data
    getDataMasterTipeER(id, '', '4', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        let updated_by = delete_by,
            deleted = 1,
            created_date = '',
            created_by = '',
            updated_date = '',
            nama_lampiran = cek_result[0].TIPE_ER,
            deskripsi = cek_result[0].DESKRIPSI,
            er_type = '4';

        if (cek_result[0].id_tipe == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Lampiran tidak ada</strong></div>');

            res.redirect('/admin/master_lampiran')
        } else {

            insertDataMasterTipeER(id, nama_lampiran, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, (delete_result) => {

                if (delete_result.err) {
                    next(delete_result.err)
                }

                if (delete_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Hapus data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Hapus data Gagal, Error : ' + `${delete_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_lampiran')
            })
        }
    })
    // Proses Delete Data
})
// Halaman Master Lampiran

// Halaman Master Status
router.get('/master_status', (req, res, next) => {
    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session

    getDataMasterTipeER('', '', '5', (result) => {
        res.render('layout', {
            title: constant.title,
            nama: nama,
            content: '/admin/master_status',
            title_page: 'MASTER STATUS',
            body_class: 'no-skin',
            level: level,
            url: req.url,
            cost_control: cost_control,
            full_url: `${req.protocol}://${req.get('host')}/`,
            data: result,
            menu: general_function.cek_level(level),
            cost_control_menu: cost_control_menu
        })
    })
})

router.post('/master_status', (req, res, next) => {
    let {
        nama_status
    } = req.body;

    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        insert_by = nama;
    } else {
        insert_by = nik;
    }

    nama_status = general_function.capital_each_word(nama_status)

    // Proses Insert Data
    getDataMasterTipeER('', nama_status, '5', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        let created_date = '',
            created_by = insert_by,
            updated_date = '',
            updated_by = '',
            deleted = 0,
            er_type = '5',
            deskripsi = 'Master Status'

        if (cek_result[0].id_tipe != 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Status sudah ada</strong></div>');

            res.redirect('/admin/master_status')
        } else {
            insertDataMasterTipeER('', nama_status, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, (insert_result) => {

                if (insert_result.err) {
                    next(insert_result.err)
                }

                if (insert_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Input data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Input data Gagal, Error : ' + `${insert_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_status')
            })
        }
    })
    // Proses Insert Data

})

router.get('/edit_master_status/:id', (req, res, next) => {

    let {
        id
    } = req.params

    var {
        level,
        nama,
        cost_control,
        cost_control_menu
    } = req.session

    getDataMasterTipeER(id, '', '5', (result) => {
        res.render('layout', {
            title: constant.title,
            nama: nama,
            content: '/admin/edit_master_status',
            title_page: 'MASTER STATUS',
            body_class: 'no-skin',
            level: level,
            url: req.url,
            cost_control: cost_control,
            full_url: `${req.protocol}://${req.get('host')}/`,
            data: {
                'id': id,
                'nama': result[0].TIPE_ER
            },
            menu: general_function.cek_level(level),
            cost_control_menu: cost_control_menu
        })
    })


})

router.post('/edit_master_status', (req, res, next) => {

    let {
        id_status,
        nama_status
    } = req.body;

    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        edit_by = nama;
    } else {
        edit_by = nik;
    }

    nama_status = general_function.capital_each_word(nama_status)

    // Proses Update Data
    getDataMasterTipeER(id_status, '', '5', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        let created_date = '',
            created_by = '',
            updated_date = '',
            updated_by = edit_by,
            deleted = 0,
            er_type = '5',
            deskripsi = 'Master Status'

        if (cek_result[0].id_tipe == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Status tidak ada</strong></div>');

            res.redirect('/admin/master_status')
        } else {

            insertDataMasterTipeER(id_status, nama_status, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, (update_result) => {

                if (update_result.err) {
                    next(update_result.err)
                }

                if (update_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Edit data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Edit data Gagal, Error : ' + `${update_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_status')
            })
        }
    })
    // Proses Update Data
})

router.get('/delete_master_status/:id', (req, res, next) => {

    let {
        id,
    } = req.params;

    var {
        nama,
        nik,
        level
    } = req.session

    if (level == 'admin') {
        delete_by = nama;
    } else {
        delete_by = nik;
    }

    // Proses Delete Data
    getDataMasterTipeER(id, '', '5', (cek_result) => {

        if (cek_result.err) {
            next(cek_result.err)
        }

        let updated_by = delete_by,
            deleted = 1,
            created_date = '',
            created_by = '',
            updated_date = '',
            nama_status = cek_result[0].TIPE_ER,
            deskripsi = cek_result[0].DESKRIPSI,
            er_type = '5';

        if (cek_result[0].id_tipe == 'No Data') {
            req.flash('info', '<div class="alert alert-info text-center"><strong>Nama Status tidak ada</strong></div>');

            res.redirect('/admin/master_status')
        } else {

            insertDataMasterTipeER(id, nama_status, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, (delete_result) => {

                if (delete_result.err) {
                    next(delete_result.err)
                }

                if (delete_result.status == 'success') {
                    req.flash('info', '<div class="alert alert-success text-center"><strong>Hapus data Berhasil</strong></div>');
                } else {
                    req.flash('info', '<div class="alert alert-danger text-center"><strong>Hapus data Gagal, Error : ' + `${delete_result.err}` + '</strong></div>');
                }

                res.redirect('/admin/master_status')
            })
        }
    })
    // Proses Delete Data
})
// Halaman Master Status

// Halaman searching ER PR Admin
// Halaman Headquarter untuk Searching No ER PR
router.get('/headquarter', (req, res, next) => {
    var full_url = `${req.protocol}://${req.get('host')}/`;
    var {
        level,
        cost_control,
        cost_control_menu,
        nama,
        nik,
        departemen
    } = req.session;

    let id = '',
        nama_ws = '';

    getDataMasterChecker(id, nama_ws, (result_master_checker) => {
        // Error Handling WS
        if (result_master_checker.err) {
            next(result_master_checker.err)
        }
        getDataMasterValidator(id, nama_ws, (result_validator) => {
            // Error Handling WS
            if (result_validator.err) {
                next(result_validator.err)
            }
            getDataMasterTipeER(id, nama_ws, '2', (result_tac) => {
                // Master TAC
                // Error Handling WS
                if (result_tac.err) {
                    next(result_tac.err)
                }
                getDataMasterTipeER(id, nama_ws, '5', (result_status) => {
                    // Master Status
                    // Error Handling WS
                    if (result_status.err) {
                        next(result_status.err)
                    }
                    getDataMasterTipeER(id, nama_ws, '3', (result_erbt) => {
                        // Master ER BT
                        // Error Handling WS
                        if (result_erbt.err) {
                            next(result_erbt.err)
                        }
                        getDataMasterTipeER(id, nama_ws, '4', (result_lampiran) => {
                            // Master Lampiran
                            // Error Handling WS
                            if (result_lampiran.err) {
                                next(result_lampiran.err)
                            }
                            getDataMasterDepartemen(id, nama_ws, (result_departemen) => {
                                // Error Handling WS
                                if (result_departemen.err) {
                                    next(result_departemen.err)
                                }
                                getDataMasterTipeER(id, nama_ws, '1', (result_tipeer) => {
                                    // Type ER
                                    // Error Handling WS
                                    if (result_tipeer.err) {
                                        next(result_tipeer.err)
                                    }

                                    res.render('layout', {
                                        title: constant.title,
                                        nama: nama,
                                        nik: nik,
                                        content: '/user/headquarter',
                                        title_page: 'INDEX',
                                        body_class: 'no-skin',
                                        level: level,
                                        url: req.url,
                                        full_url: full_url,
                                        data_master_checker: result_master_checker,
                                        data_validator: result_validator,
                                        data_departemen: result_departemen,
                                        data_tipe_er: result_tipeer,
                                        data_tac: result_tac,
                                        data_status: result_status,
                                        data_erbt: result_erbt,
                                        data_lampiran: result_lampiran,
                                        menu: general_function.cek_level(level),
                                        cost_control: 'true',
                                        departemen: departemen,
                                        cost_control_menu: cost_control_menu
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })


})
// Halaman Headquarter untuk Searching No ER PR
// Halaman searching ER PR Admin

// Fungsi cek Kode_Cabang
router.get('/getBranchCode', (req, res, next) => {
    var {
        param
    } = req.query;



    getDataMasterAkses('', '', (result) => {

        var arr_nik = [];
        var arr_kode_cabang = [];
        for (var val of result) {
            var nik = val.nik
            var id = val.id
            var off_code = val.office_code

            if(off_code=='' || off_code==null) {
                arr_nik.push(nik)
            }
            

        }
        console.log(arr_nik.length)
        var i = 1;
        arr_nik.forEach(nik => {
            var j = i++
            getEmployeeData(nik, (result) => {
                var {
                    NO_KARYAWAN,
                    KODE_CABANG,
                    NAMA
                } = result
                getDataMasterAkses('', NO_KARYAWAN, (result2) => {
                    var {
                        nama
                    } = req.session

                    let updated_by = nama;

                    let {
                        id_akses,
                        active,
                        is_cost_control,
                        office_code,
                        office_name,
                        office_addr,
                        deleted,
                        created_date,
                        created_by,
                        updated_date
                    } = result2[0]

                   // if (checkNULL(office_code) == '' || office_code == null) {
                        console.log(j+" : "+id_akses+" : "+NO_KARYAWAN+" : "+NAMA+" : "+KODE_CABANG)
                        insertDataMasterAkses(id_akses, NO_KARYAWAN, NAMA, active, deleted, created_date, created_by, updated_date, updated_by, is_cost_control, KODE_CABANG, office_name, office_addr, (update_result) => {

                            // Error Handling WS
                            if (update_result.err) {
                                next(update_result.err)
                            }

                            

                        })
                    //}
                })
            })
        })

        res.send('OK')
        return

    })
})
// Fungsi cek Kode_Cabang

// Web Service Get Employee
function getEmployeeData(nik, callback) {
    const url = constant.url_ws_employee;

    let args = {
        docGetCheckingNikRequest: {
            NO_KARYAWAN: checkNULL(nik)
        }

    }

    soap.createClientAsync(url).then((client) => {

            client.getEmployeeData(args, function (err, result, rawResponse, soapHeader, rawRequest) {
                //console.log({'id': id, 'nik': nik})
                //console.log(rawResponse)
                if (!result) {
                    data = [{
                        'NO_KARYAWAN': 'No Data',
                        'NAMA': 'No Data',
                        'KODE_CABANG': 'No Data',
                        'CABANG': 'No Data'
                    }]

                } else {
                    data = result.docGetCheckingNikResponse;

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
// Web Service Get Employee

// Web Service Hak Akses
function getDataMasterAkses(id, nik, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id),
        nik: checkNULL(nik),

    }

    soap.createClientAsync(url).then((client) => {

            client.fsGetMasterAkses(args, function (err, result, rawResponse, soapHeader, rawRequest) {
                //console.log({'id': id, 'nik': nik})
                //console.log(rawResponse)
                if (!result || result.nik === null || result.responsearrayDataHakAkses === null || !result.responsearrayDataHakAkses) {
                    data = [{
                        'id_akses': 'No Data',
                        'nik': 'No Data',
                        'nama': 'No Data',
                        'created_date': 'No Data',
                        'created_by': 'No Data',
                        'updated_date': 'No Data',
                        'updated_by': 'No Data',
                        'deleted': 'No Data',
                        'active': 'No Data',
                        'is_cost_control': 'No Data',
                        'office_code': 'No Data',
                        'office_name': 'No Data',
                        'office_addr': 'No Data',
                    }]

                } else {
                    data = result.responsearrayDataHakAkses;

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

function insertDataMasterAkses(id, nik, nama, active, deleted, created_date, created_by, updated_date, updated_by, is_cost_control, office_code, office_name, office_addr, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id),
        nik: checkNULL(nik),
        nama: checkNULL(nama),
        active: active,
        deleted: deleted,
        created_date: checkNULL(created_date),
        created_by: checkNULL(created_by),
        update_date: checkNULL(updated_date),
        updated_by: checkNULL(updated_by),
        iscostcontrol: checkNULL(is_cost_control),
        officecode: checkNULL(office_code),
        officename: checkNULL(office_name),
        officeaddr: checkNULL(office_addr),
    }

    soap.createClientAsync(url).then((client) => {

            client.fsInsertUpdateHakAkses(args, function (err, result, rawResponse, soapHeader, rawRequest) {
                //console.log(result)
                if (result.Untitled === null) {
                    data = {
                        'status': 'success',
                        'err': ''
                    }
                } else {
                    data = {
                        'status': 'failed',
                        'err': result.Untitled.errormsg
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
// Web Service Hak Akses

// Web Service TIPE ER
function getDataMasterTipeER(id, tipe_er, er_type, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id),
        tipe_er: checkNULL(tipe_er),
        ertype: checkNULL(er_type),

    }

    soap.createClientAsync(url).then((client) => {

            client.fsGetViewTipeER(args, function (err, result, rawResponse, soapHeader, rawRequest) {

                if (!result || result === null) {

                    data = [{
                        'id_tipe': 'No Data',
                        'TIPE_ER': 'No Data',
                        'DESKRIPSI': 'No Data',
                        'created_date': 'No Data',
                        'created_by': 'No Data',
                        'updated_date': 'No Data',
                        'updated_by': 'No Data',
                        'deleted': 'No Data',
                        'er_type': 'No Data'
                    }]

                } else {

                    data = result.responseErType;

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

function insertDataMasterTipeER(id, tipe_er, deskripsi, created_date, created_by, updated_date, updated_by, deleted, er_type, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id),
        tipe_er: checkNULL(tipe_er),
        deskripsi: checkNULL(deskripsi),
        created_date: checkNULL(created_date),
        created_by: checkNULL(created_by),
        update_date: checkNULL(updated_date),
        updated_by: checkNULL(updated_by),
        deleted: deleted,
        ertype: er_type

    }

    soap.createClientAsync(url).then((client) => {

            client.fsInsertUpdateTipeER(args, function (err, result, rawResponse, soapHeader, rawRequest) {

                if (result.responseInsertUpdateTipeER === null) {
                    data = {
                        'status': 'success',
                        'err': ''
                    }
                } else {
                    data = {
                        'status': 'failed',
                        'err': result.responseInsertUpdateTipeER.errormsg
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
// Web Service TIPE ER

// Web Service Master Checker
function getDataMasterChecker(id, nama, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id),
        nama: checkNULL(nama),

    }

    soap.createClientAsync(url).then((client) => {

            client.fsGetListDataMasterChecker(args, function (err, result, rawResponse, soapHeader, rawRequest) {

                if (!result || result === null) {
                    data = [{
                        'id_checker': 'No Data',
                        'nama_checker': 'No Data',
                        'created_date': 'No Data',
                        'created_by': 'No Data',
                        'updated_date': 'No Data',
                        'updated_by': 'No Data',
                        'deleted': 'No Data',
                    }]

                } else {
                    data = result.arrayResponse;

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

function insertDataMasterChecker(id, nama_checker, created_date, created_by, updated_date, updated_by, deleted, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id),
        nama_checker: checkNULL(nama_checker),
        created_date: checkNULL(created_date),
        created_by: checkNULL(created_by),
        update_date: checkNULL(updated_date),
        updated_by: checkNULL(updated_by),
        deleted: deleted

    }

    soap.createClientAsync(url).then((client) => {

            client.fsInsertUpdateMasterChecker(args, function (err, result, rawResponse, soapHeader, rawRequest) {

                if (result.responseInsertUpdateMasterChecker === null) {
                    data = {
                        'status': 'success',
                        'err': ''
                    }
                } else {
                    data = {
                        'status': 'failed',
                        'err': result.responseInsertUpdateMasterChecker.errormsg
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
// Web Service Master Checker

// Web Service Master Validator
function getDataMasterValidator(id, nama, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id),
        nama: checkNULL(nama),

    }

    soap.createClientAsync(url).then((client) => {

            client.fsGetViewMasterValidator(args, function (err, result, rawResponse, soapHeader, rawRequest) {

                if (!result || result === null) {
                    data = [{
                        'id_validator': 'No Data',
                        'nama_validator': 'No Data',
                        'created_date': 'No Data',
                        'created_by': 'No Data',
                        'updated_date': 'No Data',
                        'updated_by': 'No Data',
                        'deleted': 'No Data',
                    }]

                } else {
                    data = result.responseArrayMasterValidator;

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

function insertDataMasterValidator(id, nama_validator, created_date, created_by, updated_date, updated_by, deleted, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id),
        nama_validator: checkNULL(nama_validator),
        created_date: checkNULL(created_date),
        created_by: checkNULL(created_by),
        update_date: checkNULL(updated_date),
        updated_by: checkNULL(updated_by),
        deleted: deleted

    }

    soap.createClientAsync(url).then((client) => {

            client.fsInsertUpdateMasterValidator(args, function (err, result, rawResponse, soapHeader, rawRequest) {

                if (result.responseInsertUpdateValidator.validations == '1') {
                    data = {
                        'status': 'success',
                        'err': ''
                    }
                } else {
                    data = {
                        'status': 'failed',
                        'err': result.responseInsertUpdateValidator.errormsg
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
// Web Service Master Checker

// Web Service List Checker
function getDataListChecker(id_master_checker, id_cabang, id_checker, callback) {
    const url = constant.url_ws;

    let args = {

        id_master_checker: checkNULL(id_master_checker),
        id_cabang: checkNULL(id_cabang),
        id_checker: checkNULL(id_checker)

    }

    soap.createClientAsync(url).then((client) => {

            client.fsGetListDataChecker(args, function (err, result, rawResponse, soapHeader, rawRequest) {

                if (!result || result === null || result.id_master_checker === null) {

                    data = [{
                        'id_master_checker': 'No Data',
                        'id_cabang': 'No Data',
                        'id_checker': 'No Data',
                        'id_validator1': 'No Data',
                        'id_validator2': 'No Data',
                        'nama_checker': 'No Data',
                        'nama_validator1': 'No Data',
                        'nama_validator2': 'No Data',
                        'created_date': 'No Data',
                        'created_by': 'No Data',
                        'updated_date': 'No Data',
                        'updated_by': 'No Data',
                        'deleted': 'No Data'
                    }]

                } else {

                    data = result.responseLIstChecker;

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

function insertDataListChecker(id_master_checker, id_checker, id_validator1, id_validator2, id_cabang, created_date, created_by, updated_date, updated_by, deleted, callback) {
    const url = constant.url_ws;

    let args = {

        id_master_checker: checkNULL(id_master_checker),
        id_checker: checkNULL(id_checker),
        id_validator1: checkNULL(id_validator1),
        id_validator2: checkNULL(id_validator2),
        id_cabang: checkNULL(id_cabang),
        created_date: checkNULL(created_date),
        created_by: checkNULL(created_by),
        update_date: checkNULL(updated_date),
        updated_by: checkNULL(updated_by),
        deleted: deleted

    }

    soap.createClientAsync(url).then((client) => {

            client.fsInsertUpdateListChecker(args, function (err, result, rawResponse, soapHeader, rawRequest) {

                if (result.requestInsertUpdateListChecker === null) {
                    data = {
                        'status': 'success',
                        'err': ''
                    }
                } else {
                    data = {
                        'status': 'failed',
                        'err': result.requestInsertUpdateListChecker.errormsg
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
// Web Service List Checker

function getDataListBranch(callback) {

    var url = constant.url_ws;

    soap.createClientAsync(url).then((client) => {

            client.fsGetRefOffice('', function (err, result, rawResponse, soapHeader, rawRequest) {

                if (!result || result === null) {
                    data = [{
                        'OFFICE_CODE': 'No Data',
                        'OFFICE_NAME': 'No Data',
                        'OFFICE_ADDR': 'No Data'
                    }]

                } else {
                    data = result.responseListOffice

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

// Web Service List Branch

// Web Service Master Departemen
function getDataMasterDepartemen(id, nama, callback) {
    const url = constant.url_dep;

    let args = {

        docGetDepartmentRequest: {
            CABANG: "<i>NULL</i>"
        }

    }

    let option = {
        escapeXML: false
    }

    soap.createClientAsync(url, option).then((client) => {

            client.getDepartment(args, function (err, result, rawResponse, soapHeader, rawRequest) {


                if (!result) {
                   data = [ {  DEPARTMENT: 'Something went wrong',
                                TIPE_DEPARTEMEN: 'Something went wrong',
                                CABANG: 'Something went wrong' 
                            }]

                } else {
                    data = result.docGetListDepartmentResponse.arrayList;

                }
                //console.log(data)
                callback(data)

            })
        })
        .catch(err => {
            callback({
                'err': err
            });
        })
}

function insertDataMasterDepartemen(id, nama_departemen, created_date, created_by, updated_date, updated_by, deleted, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id),
        nama_departemen: checkNULL(nama_departemen),
        created_date: checkNULL(created_date),
        created_by: checkNULL(created_by),
        update_date: checkNULL(updated_date),
        updated_by: checkNULL(updated_by),
        deleted: deleted

    }

    soap.createClientAsync(url).then((client) => {

            client.fsInsertUpdateMasterDepartemen(args, function (err, result, rawResponse, soapHeader, rawRequest) {
                //console.log(result)
                if (result === null) {
                    data = {
                        'status': 'success',
                        'err': ''
                    }
                } else {
                    data = {
                        'status': 'failed',
                        'err': result.fsInsertUpdateMasterDepartemenResponse.errormsg
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
// Web Service Master Departemen

// Web Service Master TAC
function getDataMasterTAC(id, nama, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id),
        nama: checkNULL(nama)

    }

    soap.createClientAsync(url).then((client) => {

            client.fsGetDataMasterTAC(args, function (err, result, rawResponse, soapHeader, rawRequest) {

                if (!result || result === null) {

                    data = [{
                        'id_tipe': 'No Data',
                        'TIPE_ER': 'No Data',
                        'DESKRIPSI': 'No Data',
                        'created_date': 'No Data',
                        'created_by': 'No Data',
                        'updated_date': 'No Data',
                        'updated_by': 'No Data',
                        'deleted': 'No Data',
                        'er_type': 'No Data'
                    }]

                } else {

                    data = result.responseArrayGetTac;

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

function insertDataMasterTAC(id_tac, nama_tac, created_date, created_by, updated_date, updated_by, deleted, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id_tac),
        tipe_er: checkNULL(nama_tac),
        created_date: checkNULL(created_date),
        created_by: checkNULL(created_by),
        update_date: checkNULL(updated_date),
        updated_by: checkNULL(updated_by),
        deleted: deleted

    }

    soap.createClientAsync(url).then((client) => {

            client.fsInsertUpdateMasterTAC(args, function (err, result, rawResponse, soapHeader, rawRequest) {

                if (result.responseInsertUpdateMasterTAC === null) {
                    data = {
                        'status': 'success',
                        'err': ''
                    }
                } else {
                    data = {
                        'status': 'failed',
                        'err': result.responseInsertUpdateMasterTAC.errormsg
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
// Web Service Master TAC

function checkNULLStrip(value) {
    if (!value || value == '' || value == null || value === undefined) return '-'
    else return value
}

function checkNULL(value) {
    if (!value || value == '' || value == null || value === undefined) return ''
    else return value
}

function split_branch(value) {
    var return_arr = value.split(':');
    var return_val = {
        'office_code': return_arr[0],
        'office_name': return_arr[1],
        'office_addr': return_arr[2]
    }

    return return_val;
}

module.exports = router;