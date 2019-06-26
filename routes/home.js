var express = require('express');
var router = express.Router();
var constant = require('../config/constants');
var general_function = require('../config/function');
var soap = require('soap');

// Cek Session apakah ada atau tidak, kalo tidak oper ke Halaman Login
var check_user_session = require('../middleware/check_user_session');

router.all('*', check_user_session, (req, res, next) => {
    next()
})
// Cek Session apakah ada atau tidak, kalo tidak oper ke Halaman Login

// Halaman Index
router.get('/', function (req, res, next) {
    //res.send(req.session);

    var {
        level,
        cost_control,
        cost_control_menu,
        nama
    } = req.session

    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/user/home',
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
// Halaman Index

// Halaman Profile
router.get('/profil', (req, res, next) => {

    let NO_KARYAWAN = req.session.nik;
    let {
        level,
        cost_control,
        nama,
        login_time,
        departemen,
        nik,
        cost_control_menu
    } = req.session;

    //result['login_time'] = login_time; //fungsi nya kyk array push, memasukkan value ke dalam array associative
    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/user/profile',
        title_page: 'PROFILE',
        body_class: 'no-skin',
        data_employee: {
            'no_karyawan': nik,
            'nama': nama,
            'cabang': departemen,
            'level': level,
            'login_time': login_time
        },
        level: level,
        url: req.url,
        full_url: `${req.protocol}://${req.get('host')}/`,
        menu: general_function.cek_level(level),
        cost_control: cost_control,
        cost_control_menu: cost_control_menu
    })


})
// Halaman Profile

// Halaman Headquarter untuk Searching No ER PR
router.get('/headquarter', (req, res, next) => {
    var full_url = `${req.protocol}://${req.get('host')}/`;
    var {
        level,
        cost_control,
        nama,
        nik,
        departemen,
        cost_control_menu
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
                                        cost_control: cost_control,
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

// Halaman Branch untuk Searching No ER PR
router.get('/branch', (req, res, next) => {
    var full_url = `${req.protocol}://${req.get('host')}/`;
    var {
        level,
        cost_control,
        nama,
        nik,
        departemen,
        cost_control_menu
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
                                        content: '/user/branch',
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
                                        cost_control: cost_control,
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
// Halaman Branch untuk Searching No ER PR

// Halaman Report
router.get('/report', (req, res, next) => {
    var {
        level,
        cost_control,
        cost_control_menu,
        nama,
        nik,
        departemen
    } = req.session;

    res.render('layout', {
        title: constant.title,
        nama: nama,
        content: '/user/report',
        title_page: 'REPORT',
        body_class: 'no-skin',
        full_url: `${req.protocol}://${req.get('host')}/`,
        level: level,
        url: req.url,
        menu: general_function.cek_level(level),
        cost_control: cost_control,
        cost_control_menu: cost_control_menu
    })

})

router.post('/report', (req, res, next) => {
    var {
        level,
        cost_control,
        cost_control_menu,
        nama,
        nik,
        departemen
    } = req.session;

    let {
        tgl_awal,
        tgl_akhir
    } = req.body;

    fsGetDataHQ(tgl_awal, tgl_akhir, (result) => {

        // error handling WS
        if (result.err) {
            next(result.err)
        }

        res.render('layout', {
            title: constant.title,
            nama: nama,
            content: '/user/report_post',
            title_page: 'REPORT ('+'Tanggal : '+tgl_awal+' Sampai : '+tgl_akhir+")",
            body_class: 'no-skin',
            full_url: `${req.protocol}://${req.get('host')}/`,
            level: level,
            url: req.url,
            menu: general_function.cek_level(level),
            cost_control: cost_control,
            tgl_awal: tgl_awal,
            tgl_akhir: tgl_akhir,
            data_report: result,
            cost_control_menu: cost_control_menu
        })
    })

})
// Halaman Report

function fsGetDataHQ(tgl_awal, tgl_akhir, callback) {
    const url = constant.url_ws;

    let args = {
        requestinsertgerdetail: {
            INSERT_DATE: tgl_awal,
            INSERT_DATE2: tgl_akhir
        }
    }
    soap.createClientAsync(url).then((client) => {

            client.fsGetDataHQ_NEW(args, function (err, result, rawResponse, soapHeader, rawRequest) {
                
                let callback_data;

                if (result!= null) {
                    callback_data = result.arrayResponseHQ;
                } else {
                    callback_data = {
                        'PR_NUMBER': '',
                        'ER_NUMBER': '',
                        'VALIDATOR': '',
                        'VALIDATOR2': '',
                        'CHECKER': '',
                        'KODECABANG': '',
                        'DEPARTEMENT': '',
                        'TIPE_ER': '',
                        'PERIODE': '',
                        'TANGGAL_INCOMING': '',
                        'TANGGAL_PROSES_CHECKER': '',
                        'STATUS': '',
                        'REMARKS': '',
                        'TANGGAL_INCOMING_FINANCE': '',
                        'ACTIVE': '',
                        'INSERT_DATE': '',
                        'TYPE_PR_ER_NUMBER': '',
                        'APPROVER_DATE': '',
                        'NAME_OF_APPROVERD': '',
                        'SLA_PR': '',
                        'SLA_PO': '',
                        'SLA_ER_DATE': '',
                        'SLA_KIRIM': '',
                        'SLA_CABANG': '',
                        'ACCT': '',
                        'SLA_FIN': '',
                        'SLA_HQ': '',
                        'INVOICE_NUM': ''
                    }
                }

                callback(callback_data)
            })
        })

        // Error Handling WS
        .catch(err => {
            callback({
                'err': err
            })
        })
}

function adFindUser(nik, callback) {

    ad.findUser(nik, function (err, user) {

        if (err) {
            callback(err)
            return;
        }

        if (!user) {
            callback('User: ' + nik + ' not found.');
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
                    var data = {
                        'no_karyawan': 'Data Tidak Ditemukan',
                        'nama': 'Data Tidak Ditemukan',
                        'cabang': 'Data Tidak Ditemukan',
                        'divisi': 'Data Tidak Ditemukan',
                        'departemen': 'Data Tidak Ditemukan',
                        'job': 'Data Tidak Ditemukan',
                        'posisi': 'Data Tidak Ditemukan'
                    }

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
        // Error Handling WS
        .catch(err => {
            callback({
                'err': err
            })
        })

}

function getDataChecker(id_master_checker, id_cabang, id_checker, callback) {
    const url = constant.url_ws;

    let args = {

        id_master_checker: checkNULL(id_master_checker),
        id_cabang: checkNULL(id_cabang),
        id_checker: checkNULL(id_checker)

    }

    soap.createClientAsync(url).then((client) => {

            client.fsGetListDataChecker(args, function (err, result, rawResponse, soapHeader, rawRequest) {


                if (!result) {
                    callback('Data tidak Ditemukan')

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

function getDataMasterChecker(id, nama, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id),
        nama: checkNULL(nama),

    }

    soap.createClientAsync(url).then((client) => {

            client.fsGetListDataMasterChecker(args, function (err, result, rawResponse, soapHeader, rawRequest) {


                if (!result) {
                    callback('Data tidak Ditemukan')

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

function getDataMasterValidator(id, nama, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id),
        nama: checkNULL(nama),

    }

    soap.createClientAsync(url).then((client) => {

            client.fsGetViewMasterValidator(args, function (err, result, rawResponse, soapHeader, rawRequest) {


                if (!result) {
                    callback('Data tidak Ditemukan')

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

function getDataMasterTipeER(id, tipe_er, er_type, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id),
        tipe_er: checkNULL(tipe_er),
        ertype: checkNULL(er_type)
    }

    soap.createClientAsync(url).then((client) => {

            client.fsGetViewTipeER(args, function (err, result, rawResponse, soapHeader, rawRequest) {


                if (!result) {
                    callback('Data tidak Ditemukan')

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

function getDataMasterTAC(id, nama, callback) {
    const url = constant.url_ws;

    let args = {

        id: checkNULL(id),
        nama: checkNULL(nama),

    }

    soap.createClientAsync(url).then((client) => {

            client.fsGetDataMasterTAC(args, function (err, result, rawResponse, soapHeader, rawRequest) {


                if (!result) {
                    callback('Data tidak Ditemukan')

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
                // console.log(result)
                 //result = '';

                if (!result) {
                    //callback('Data tidak Ditemukan')
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

function checkNULL(value) {
    if (!value || value == '' || value == null || value === undefined) return ''
    else return value

}

module.exports = router