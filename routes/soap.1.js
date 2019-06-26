var express = require('express');
var router = express.Router();
var constant = require('../config/constants')
var soap = require('soap');
var ActiveDirectory = require('activedirectory');
var config = {
  url: 'ldap://ldap.bussan.co.id',
  baseDN: 'DC=bussan,DC=co,DC=id',
  username: 'CN=eyasrvc,OU=Services,OU=Information Technology,OU=Headquarter,DC=bussan,DC=co,DC=id',
  password: 'Bussan100'
}

//var url = constant.url_ws;

// Cek Session apakah ada atau tidak, kalo tidak oper ke Halaman Login
var check_user_session = require('../middleware/check_user_session');

router.all('*', check_user_session, (req, res, next) => {
  next()
})
// Cek Session apakah ada atau tidak, kalo tidak oper ke Halaman Login


/* How to Get Data from SOAP / WSDL*/
router.post('/getDataER', (req, res, next) => {
  let {
    txt_noerpr,
    tipe_ws,
    location
  } = req.body;

  let jumlah_paid_amount = 0;

  if (tipe_ws == 'MB') { // for multibranch
    fsGetDataERMultibranch(txt_noerpr, (result) => {

      var {
        ER_NUMBER,
        BENEFICIARY,
        ACCOUNT_NUMBER,
        BANK_NAME,
        WHT_TAX_CODE,
        AMOUNT_PAID
      } = result;

      fsGetDataPRSharepointHQ_NEW(txt_noerpr, (result_hq) => {
        var {
          KODECABANG,
          PERIODE,
          TANGGAL_INCOMING,
          TANGGAL_PROSES_CHECKER,
          TANGGAL_INCOMING_FINANCE,
          APPROVER_DATE,
          CHECKER,
          VALIDATOR,
          VALIDATOR2,
          TIPE_ER,
          STATUS,
          REMARKS,
          TYPE_PR_ER_NUMBER,
          DEPARTEMENT,
          ER_BT,
          LAMPIRAN,
          TAC
        } = result_hq

        var button;
        var prnumber_hq = result_hq.PR_NUMBER;
        var ernumber_hq = result_hq.ER_NUMBER;

        if (location == 'HQ') {

          if (prnumber_hq != '' || ernumber_hq != '') {
            button = 'update';
          } else {
            button = 'save';
          }

        } else {

          if (prnumber_hq != '' || ernumber_hq != '') {
            button = 'hide';
          } else {
            button = 'save';
          }

        }

        fsGetDataOrafin(txt_noerpr, (result_ora) => {
          var pr_date_ora = result_ora.rp_date,
            er_date_ora = result_ora.ER_DATE,
            po_date_ora = result_ora.PO_DATE,
            acc_date_ora = result_ora.ACCOUNTING_DATE,
            app_date_ora = result_ora.PR_APPROVER_DATE,
            pay_date_ora = result_ora.PAYMENT_DATE,
            inv_ora = result_ora.INVOICE_NUM,
            pr_number_ora = result_ora.PR_NUMBER,
            error_ora = result_ora.ERROR,
            kode_cabang_ora = result_ora.BRANCHID
          var kode, checker, callback_data, validator1, validator2;
          if (ER_NUMBER != '') {
            kode = convertBranch(kode_cabang_ora);

            if (kode == '' || kode === undefined) {
              kode = '010';
            }

            jumlah_paid_amount = (AMOUNT_PAID - WHT_TAX_CODE)

            getDataBranch('', kode, '', (result_branch) => {

              var checker_branch = result_branch.CHECKER,
                validator1_branch = result_branch.VALIDATOR1,
                validator2_branch = result_branch.VALIDATOR2,
                id_checker = result_branch.id_checker,
                id_validator1 = result_branch.id_validator1,
                id_validator2 = result_branch.id_validator2,
                error_branch = result_branch.error

              if (!isNaN(CHECKER)) {
                checker = checker_branch
              } else {
                checker = CHECKER
              }

              if (!isNaN(VALIDATOR)) {
                validator1 = validator1_branch
              } else {
                validator1 = VALIDATOR
              }

              if (!isNaN(VALIDATOR2)) {
                validator2 = validator2_branch
              } else {
                validator2 = VALIDATOR2
              }

              callback_data = {
                'txt_checker': checker,
                'txt_tipeer': TYPE_PR_ER_NUMBER,
                'txt_tipeerpr': TYPE_PR_ER_NUMBER,
                'txt_validator1': validator1,
                'txt_validator2': validator2,
                'txt_periode': convertDate(PERIODE),
                'txt_ti': convertDate(TANGGAL_INCOMING),
                'txt_tpc': convertDate(TANGGAL_PROSES_CHECKER),
                'txt_tif': convertDate(TANGGAL_INCOMING_FINANCE),
                'txt_status': STATUS,
                'txt_remarks': REMARKS,
                'txt_dep': DEPARTEMENT,
                'txt_branchid': kode,
                'txt_prnumber': pr_number_ora,
                'txt_appdate': convertDate(app_date_ora),
                'txt_inv': inv_ora,
                'txt_nopr': pr_number_ora,
                'status': 'success',
                'txt_noer': ER_NUMBER,
                'txt_beneficiarymb': BENEFICIARY,
                'txt_accountnumber': ACCOUNT_NUMBER,
                'txt_bankname': BANK_NAME,
                'txt_taxcode': WHT_TAX_CODE,
                'txt_amountpaid': jumlah_paid_amount,
                'button': button,
                'tipe': 'multibranch',
                'location': location,
                'txt_prdate': convertDate(pr_date_ora),
                'txt_podate': convertDate(po_date_ora),
                'txt_erdate': convertDate(er_date_ora),
                'txt_accdate': convertDate(acc_date_ora),
                'txt_tglcair': convertDate(pay_date_ora),
                'ERROR': error_ora,
                'id_checker': id_checker,
                'id_validator1': id_validator1,
                'id_validator2': id_validator2,
                'txt_er_bt': ER_BT,
                'txt_tac': TAC,
                'txt_lampiran': LAMPIRAN,
                'error_branch': error_branch
              }

              res.status(200).send(callback_data)

            })


          } else {
            callback_data = {
              'status': 'failed',
              'button': 'hide',
              'tipe': 'multibranch',
              'ERROR': error_ora
            }

            res.status(200).send(callback_data)
          }

        })
      })
    })
  } else { // for er single and business trip
    fsGetDataOrafin(txt_noerpr, (result) => {

      var {
        PR_NUMBER,
        ER_NUMBER,
        pr_date,
        PR_APPROVED_DATE,
        PO_DATE,
        ER_DATE,
        DESCRIPTION_ER,
        BENEFICIARY,
        ACCOUNT_NUMBER,
        BANK_NAME,
        INVOICE_NUM,
        PAID_AMOUNT,
        ACCOUNTING_DATE,
        PAYMENT_DATE,
        PAY_GROUP,
        BRANCHID,
        NOTE,
        WHTCODE,
        ERROR
      } = result;

      fsGetDataPRSharepointHQ_NEW(txt_noerpr, (result_hq) => {
        var {
          KODECABANG,
          PERIODE,
          TANGGAL_INCOMING,
          TANGGAL_PROSES_CHECKER,
          TANGGAL_INCOMING_FINANCE,
          APPROVER_DATE,
          CHECKER,
          VALIDATOR,
          VALIDATOR2,
          TIPE_ER,
          STATUS,
          REMARKS,
          TYPE_PR_ER_NUMBER,
          DEPARTEMENT,
          ER_BT,
          LAMPIRAN,
          TAC
        } = result_hq

        var prnumber_hq = result_hq.PR_NUMBER;
        var ernumber_hq = result_hq.ER_NUMBER;

        jumlah_paid_amount = 0;

        var button;

        if (location == 'HQ') {

          if (prnumber_hq != '' || ernumber_hq != '') {
            button = 'update';
          } else {
            button = 'save';
          }

        } else {

          if (prnumber_hq != '' || ernumber_hq != '') {
            button = 'hide';
          } else {
            button = 'save';
          }

        }

        var kode, checker, callback_data, validator1, validator2;

        if (ER_NUMBER == '' || !ER_NUMBER) {
          callback_data = {
            'status': 'failed',
            'button': 'hide',
            'tipe': 'biasa',
            'ERROR': ERROR
          }

          res.status(200).send(callback_data)
        } else {
          kode = convertBranch(BRANCHID);
          jumlah_paid_amount = PAID_AMOUNT;

          getDataBranch('', kode, '', (result_branch) => {
            
            var checker_branch = result_branch.CHECKER,
              validator1_branch = result_branch.VALIDATOR1,
              validator2_branch = result_branch.VALIDATOR2,
              id_checker = result_branch.id_checker,
              id_validator1 = result_branch.id_validator1,
              id_validator2 = result_branch.id_validator2

            if (!isNaN(CHECKER)) {
              checker = checker_branch
            } else {
              checker = CHECKER
            }

            if (!isNaN(VALIDATOR)) {
              validator1 = validator1_branch
            } else {
              validator1 = VALIDATOR
            }

            if (!isNaN(VALIDATOR2)) {
              validator2 = validator2_branch
            } else {
              validator2 = VALIDATOR2
            }

            callback_data = {
              'status': 'success',
              'txt_noerpr': PR_NUMBER,
              'txt_nopr': PR_NUMBER,
              'txt_noer': ER_NUMBER,
              'txt_prdate': convertDate(pr_date),
              'txt_appdate': convertDate(PR_APPROVED_DATE),
              'txt_podate': convertDate(PO_DATE),
              'txt_erdate': convertDate(ER_DATE),
              'txt_beneficiary': BENEFICIARY,
              'txt_accnumber': ACCOUNT_NUMBER,
              'txt_amount': jumlah_paid_amount,
              'txt_accdate': convertDate(ACCOUNTING_DATE),
              'txt_tglcair': convertDate(PAYMENT_DATE),
              'txt_paygroup': PAY_GROUP,
              'txt_branchid': BRANCHID,
              'txt_kegiatan': DESCRIPTION_ER,
              'data1': PR_NUMBER,
              'txt_validator1': validator1,
              'txt_validator2': validator2,
              'txt_checker': checker,
              'txt_tipeer': TIPE_ER,
              'txt_periode': convertDate(PERIODE),
              'txt_ti': convertDate(TANGGAL_INCOMING),
              'txt_tpc': convertDate(TANGGAL_PROSES_CHECKER),
              'txt_status': STATUS,
              'txt_remarks': REMARKS,
              'txt_tif': convertDate(TANGGAL_INCOMING_FINANCE),
              'txt_tipeerpr': TYPE_PR_ER_NUMBER,
              'txt_dep': DEPARTEMENT,
              'txt_inv': INVOICE_NUM,
              'txt_note': NOTE,
              'txt_tax': WHTCODE,
              'button': button,
              'txt_amountpaid': jumlah_paid_amount,
              'tipe': 'biasa',
              'tipe_ws': tipe_ws,
              'ERROR': ERROR,
              'id_checker': id_checker,
              'id_validator1': id_validator1,
              'id_validator2': id_validator2,
              'txt_er_bt': ER_BT,
              'txt_tac': TAC,
              'txt_lampiran': LAMPIRAN
            }

            res.status(200).send(callback_data);

          })
        }

      })


    })
  }
})

router.post('/update_hq', (req, res, next) => {
  let mb;
  let {
    txt_tipeermb,
    tipe_ws,
    txt_tipeerpr,
    txt_nopr,
    txt_noer,
    id_validator1,
    id_validator2,
    id_checker,
    txt_branchid,
    kode_cabang,
    txt_dep,
    txt_periode,
    txt_ti,
    txt_tpc,
    txt_status,
    txt_remarks,
    txt_tif,
    txt_appdate,
    txt_erdate,
    txt_prdate,
    txt_accdate,
    txt_tglcair,
    txt_nameapp,
    txt_inv,
    txt_slapr,
    txt_slapo,
    txt_slaerdate,
    txt_slafin,
    txt_er_bt,
    txt_lampiran,
    txt_tac,

    // for multibranch

    txt_noermb,
    txt_noprmb,
    txt_checkermb,
    txt_validator1mb,
    txt_validator2mb,
    txt_periodemb,
    txt_tpcmb,
    txt_statusmb,
    txt_depmb,
    txt_timb,
    txt_tifmb,
    txt_remarksmb,
    txt_appdatemb,
    txt_invmb,
    htxt_branchidmb,
    txt_tipeerprmb,
    htxt_erdatemb,
    htxt_prdatemb,
    htxt_accdatemb,
    htxt_tglcairmb,
    txt_nameappmb,
    txt_slaprmb,
    txt_slapomb,
    txt_slaerdatemb,
    txt_slakirimmb,
    txt_slacabangmb,
    txt_acctmb,
    txt_slafinmb,
    txt_slahqmb
  } = req.body;


  if (txt_tipeermb == 'MultiBranch' || txt_tipeerpr == 'MultiBranch') mb = 'mb'
  else mb = ''

  if (tipe_ws == 'MB') TIPE_ER = 'MultiBranch'
  else if (tipe_ws == 'BT') TIPE_ER = 'Business Trip';
  else if (tipe_ws == 'ER') TIPE_ER = 'Expense Request';

  let sla_kirim = sla(convertDate(txt_ti), convertDate(txt_erdate));
  let sla_cabang = sla(convertDate(txt_ti), convertDate(txt_prdate));
  let acct = sla(convertDate(txt_accdate), convertDate(txt_tpc));
  let sla_hq = sla(convertDate(txt_tglcair), convertDate(txt_ti));

  let sla_kirimmb = sla(convertDate(txt_timb), convertDate(htxt_erdatemb));
  let sla_cabangmb = sla(convertDate(txt_timb), convertDate(htxt_prdatemb));
  let acctmb = sla(convertDate(htxt_accdatemb), convertDate(txt_tpcmb));
  let sla_hqmb = sla(convertDate(htxt_tglcairmb), convertDate(txt_timb));

  if (mb == '') { // update er single dan business trip
    fsUpdateDataPRSharepointHQ_NEW(
      txt_nopr,
      txt_noer,
      id_validator1,
      id_validator2,
      id_checker,
      txt_branchid,
      txt_dep,
      TIPE_ER,
      txt_periode,
      txt_ti,
      txt_tpc,
      txt_status,
      txt_remarks,
      txt_tif,
      txt_tipeerpr,
      txt_appdate,
      txt_nameapp,
      txt_slapr,
      txt_slapo,
      txt_slaerdate,
      txt_slafin,
      sla_kirim,
      sla_cabang,
      acct,
      sla_hq,
      txt_er_bt,
      txt_lampiran,
      txt_tac, (result) => {
        if (!result) {
          fsUpdateDataPRSharepoint_NEW(
            txt_nopr,
            txt_noer,
            id_validator1,
            id_validator2,
            id_checker,
            txt_branchid,
            txt_dep,
            TIPE_ER,
            txt_periode,
            txt_ti,
            txt_tpc,
            txt_status,
            txt_remarks,
            txt_tif,
            txt_slapr,
            txt_slapo,
            txt_slaerdate,
            txt_slafin,
            sla_kirim,
            sla_cabang,
            acct,
            sla_hq,
            txt_er_bt,
            txt_lampiran,
            txt_tac, (result_branch) => {

            })

          res.status(200).send('OK')
        } else {
          res.status(200).send(result)
        }

      })
  } else { // update multibranch
    txt_er_bt = '-';
    txt_lampiran = '-';
    txt_tac = '-';
    fsUpdateDataPRSharepointHQ_NEW(
      txt_noprmb,
      txt_noermb,
      id_validator1,
      id_validator2,
      id_checker,
      htxt_branchidmb,
      txt_depmb,
      TIPE_ER,
      txt_periodemb,
      txt_timb,
      txt_tpcmb,
      txt_statusmb,
      txt_remarksmb,
      txt_tifmb,
      txt_tipeerprmb,
      txt_appdatemb,
      txt_nameappmb,
      txt_slaprmb,
      txt_slapomb,
      txt_slaerdatemb,
      txt_slafinmb,
      sla_kirimmb,
      sla_cabangmb,
      acctmb,
      sla_hqmb,
      txt_er_bt,
      txt_lampiran,
      txt_tac, (result) => {
        if (!result) {
          fsUpdateDataPRSharepoint_NEW(
            txt_noprmb,
            txt_noermb,
            id_validator1,
            id_validator2,
            id_checker,
            htxt_branchidmb,
            txt_depmb,
            TIPE_ER,
            txt_periodemb,
            txt_timb,
            txt_tpcmb,
            txt_statusmb,
            txt_remarksmb,
            txt_tifmb,
            txt_slaprmb,
            txt_slapomb,
            txt_slaerdatemb,
            txt_slafinmb,
            sla_kirimmb,
            sla_cabangmb,
            acctmb,
            sla_hqmb,
            txt_er_bt,
            txt_lampiran,
            txt_tac, (result_branch) => {

            })

          res.status(200).send('OK')
        } else {
          res.status(200).send(result)
        }

      })
  }



})

router.post('/save_hq', (req, res, next) => {
  let mb;
  let {
    txt_tipeermb,
    tipe_ws,
    txt_tipeerpr,
    txt_nopr,
    txt_noer,
    id_validator1,
    id_validator2,
    id_checker,
    txt_branchid,
    kode_cabang,
    txt_dep,
    txt_periode,
    txt_ti,
    txt_tpc,
    txt_status,
    txt_remarks,
    txt_tif,
    txt_appdate,
    txt_erdate,
    txt_prdate,
    txt_accdate,
    txt_tglcair,
    txt_nameapp,
    txt_inv,
    txt_slapr,
    txt_slapo,
    txt_slaerdate,
    txt_slafin,
    txt_er_bt,
    txt_lampiran,
    txt_tac,

    // for multibranch

    txt_noermb,
    txt_noprmb,
    txt_checkermb,
    txt_validator1mb,
    txt_validator2mb,
    txt_periodemb,
    txt_tpcmb,
    txt_statusmb,
    txt_depmb,
    txt_timb,
    txt_tifmb,
    txt_remarksmb,
    txt_appdatemb,
    txt_invmb,
    htxt_branchidmb,
    txt_tipeerprmb,
    htxt_erdatemb,
    htxt_prdatemb,
    htxt_accdatemb,
    htxt_tglcairmb,
    txt_nameappmb,
    txt_slaprmb,
    txt_slapomb,
    txt_slaerdatemb,
    txt_slakirimmb,
    txt_slacabangmb,
    txt_acctmb,
    txt_slafinmb,
    txt_slahqmb,
    txt_tacmb
  } = req.body;


  if (txt_tipeermb == 'MultiBranch' || txt_tipeerpr == 'MultiBranch') mb = 'mb'
  else mb = ''

  if (tipe_ws == 'MB') TIPE_ER = 'MultiBranch'
  else if (tipe_ws == 'BT') TIPE_ER = 'Business Trip';
  else if (tipe_ws == 'ER') TIPE_ER = 'Expense Request';

  let sla_kirim = sla(convertDate(txt_ti), convertDate(txt_erdate));
  let sla_cabang = sla(convertDate(txt_ti), convertDate(txt_prdate));
  let acct = sla(convertDate(txt_accdate), convertDate(txt_tpc));
  let sla_hq = sla(convertDate(txt_tglcair), convertDate(txt_ti));

  let sla_kirimmb = sla(convertDate(txt_timb), convertDate(htxt_erdatemb));
  let sla_cabangmb = sla(convertDate(txt_timb), convertDate(htxt_prdatemb));
  let acctmb = sla(convertDate(htxt_accdatemb), convertDate(txt_tpcmb));
  let sla_hqmb = sla(convertDate(htxt_tglcairmb), convertDate(txt_timb));

  if (txt_nopr + mb == '' || txt_nopr + mb == null &&
    txt_noer + mb == '' || txt_noer + mb == null) {
    res.status(200).send('PR dan ER Number Tidak Boleh Kosong');
  } else {

    if (mb == '') { //insert er single dan business trip
      fsSaveDataPRSharepointHQ_NEW(
        txt_nopr,
        txt_noer,
        id_validator1,
        id_validator2,
        id_checker,
        kode_cabang,
        txt_dep,
        TIPE_ER,
        txt_periode,
        txt_ti,
        txt_tpc,
        txt_status,
        txt_remarks,
        txt_tif,
        txt_tipeerpr,
        txt_appdate,
        txt_nameapp,
        txt_slapr,
        txt_slapo,
        txt_slaerdate,
        txt_slafin,
        txt_inv,
        sla_kirim,
        sla_cabang,
        acct,
        sla_hq,
        txt_er_bt,
        txt_lampiran,
        txt_tac,
        (result) => {

          if (!result) {

            fsSaveDataPRSharepoint_NEW(
              txt_nopr,
              txt_noer,
              id_validator1,
              id_validator2,
              id_checker,
              kode_cabang,
              txt_dep,
              TIPE_ER,
              txt_periode,
              txt_ti,
              txt_tpc,
              txt_status,
              txt_remarks,
              txt_tif,
              txt_slapr,
              txt_slapo,
              txt_slaerdate,
              txt_slafin,
              txt_inv,
              sla_kirim,
              sla_cabang,
              acct,
              sla_hq,
              txt_er_bt,
              txt_lampiran,
              txt_tac, (result_branch) => {

              })

            res.status(200).send('OK')
          } else {
            res.status(200).send(result)
          }
          // if(result.error.ERROR===undefined) res.status(200).send('OK')
          // else res.status(200).send(result)

        })
    } else { //insert multibranch
      txt_er_bt = '-';
      txt_lampiran = '-';
      txt_tac = '-';
      fsSaveDataPRSharepointHQ_NEW(
        txt_noprmb,
        txt_noermb,
        id_validator1,
        id_validator2,
        id_checker,
        htxt_branchidmb,
        txt_depmb,
        TIPE_ER,
        txt_periodemb,
        txt_timb,
        txt_tpcmb,
        txt_statusmb,
        txt_remarksmb,
        txt_tifmb,
        txt_tipeerprmb,
        txt_appdatemb,
        txt_nameappmb,
        txt_slaprmb,
        txt_slapomb,
        txt_slaerdatemb,
        txt_slafinmb,
        txt_invmb,
        sla_kirimmb,
        sla_cabangmb,
        acctmb,
        sla_hqmb,
        txt_er_bt,
        txt_lampiran,
        txt_tacmb,
        (result) => {

          if (!result) {

            fsSaveDataPRSharepoint_NEW(
              txt_noprmb,
              txt_noermb,
              id_validator1,
              id_validator2,
              id_checker,
              htxt_branchidmb,
              txt_depmb,
              TIPE_ER,
              txt_periodemb,
              txt_timb,
              txt_tpcmb,
              txt_statusmb,
              txt_remarksmb,
              txt_tifmb,
              txt_slaprmb,
              txt_slapomb,
              txt_slaerdatemb,
              txt_slafinmb,
              txt_invmb,
              sla_kirimmb,
              sla_cabangmb,
              acctmb,
              sla_hqmb,
              txt_er_bt,
              txt_lampiran,
              txt_tacmb, (result_branch) => {

              })

            res.status(200).send('OK')
          } else {
            res.status(200).send(result)
          }
          // if(result.error.ERROR===undefined) res.status(200).send('OK')
          // else res.status(200).send(result)

        })
    }


  }

})

// ini buat yang pake ajax
router.post('/getChecker', async (req, res, next) => {

  let {
    search
  } = req.body;

  getDataBranch('', '', search, (result) => {
   
    res.status(200).send(result);
  })


})

function getDataBranch(id_master_checker, id_cabang, id_checker, callback) {

  const url = constant.url_ws;

  let args1 = {
    
    id_master_checker: id_master_checker,
    id_cabang: id_cabang,
    id_checker: id_checker,
    
  }
  soap.createClientAsync(url).then((client) => {

    client.fsGetListDataChecker(args1, function (err, result, rawResponse, soapHeader, rawRequest) {

      let hasil = result.responseLIstChecker[0];

      if(!hasil) {
        let data = {
          'CHECKER': "Tidak Ditemukan",
          "VALIDATOR1": "Tidak Ditemukan",
          "VALIDATOR2": "Tidak Ditemukan",
          "id_checker": "Tidak Ditemukan",
          "id_validator1": "Tidak Ditemukan",
          "id_validator2": "Tidak Ditemukan"
        }
        callback(data)
      } else {
        let data = {
          'CHECKER': hasil.id_checker,
          "VALIDATOR1": hasil.nama_validator1,
          "VALIDATOR2": hasil.nama_validator2,
          "id_checker": hasil.id_checker,
          "id_validator1": hasil.id_validator1,
          "id_validator2": hasil.id_validator2
        }
        callback(data);
      }

      
    })
  })



  // CheckerModel.findOne({
  //     where: {
  //       id_cabang: `${kode}`
  //     }
  //   })
  //   .then(result => {
  //     if (!result) {
  //       let data = {
  //         'CHECKER': "Tidak Ditemukan",
  //         "VALIDATOR1": "Tidak Ditemukan",
  //         "VALIDATOR2": "Tidak Ditemukan",
  //         "id_checker": "Tidak Ditemukan",
  //         "id_validator1": "Tidak Ditemukan",
  //         "id_validator2": "Tidak Ditemukan"
  //       }
  //       callback(data);
  //     } else {
  //       var query = ` select top 1 id_master_checker, id_cabang, id_checker, id_validator1, 
  //                     id_validator2, nama_checker, nama_validator1, nama_validator2 
  //                     from view_list_checker where id_checker = '${result.id_checker}' and deleted='0' order by id_checker ASC`;


  //       sequelize.query(query, {
  //           type: sequelize.QueryTypes.SELECT
  //         })
  //         .then(response => {
  //           let data = {
  //             'CHECKER': result.id_checker,
  //             "VALIDATOR1": response[0].nama_validator1,
  //             "VALIDATOR2": response[0].nama_validator2,
  //             "id_checker": result.id_checker,
  //             "id_validator1": result.id_validator1,
  //             "id_validator2": result.id_validator2
  //           }
  //           callback(data);
  //         })
  //         .catch(err => {
  //           let data = {
  //             'CHECKER': "Terjadi ERROR",
  //             "VALIDATOR1": "Terjadi ERROR",
  //             "VALIDATOR2": "Terjadi ERROR",
  //             "id_checker": "Terjadi ERROR",
  //             "id_validator1": "Terjadi ERROR",
  //             "id_validator2": "Terjadi ERROR"
  //           }
  //           callback(data);
  //         })



  //     }
  //   })
}

router.post('/getName', (req, res, next) => {
  
  var ad = new ActiveDirectory(config);

  let {nik} = req.body;

  ad.findUser(nik, async function (err, user) {
      if (user === undefined || user === "undefined") {
        res.status(200).send({'givenName': '', 'sn': '', 'fullName': ''});
      } else {

          if (user.givenName == user.sn) {
              var nama_employee = user.givenName
          } else {
              var nama_employee = user.givenName + ' ' + user.sn;
          }

          res.status(200).send({'givenName': user.givenName, 'sn': user.sn, 'fullName': nama_employee});

      }
  });
})


function sla(date1, date2) {
  var selisih;
  if (!date1 || !date2 || date1 == '' || date2 == '') {
    selisih = '-';
    return selisih;
  }
  var date1 = new Date(date1);
  var date2 = new Date(date2);

  var timeDiff = Math.abs(date1.getTime() - date2.getTime());
  selisih = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return selisih;
}

function getDataMasterAkses(periode, callback) {
  const url = constant.url_enhance;

  let args1 = {
    docGetViewMasterAksesDataAllRequest: {
      PERIODE: periode
    }
  }
  soap.createClientAsync(url).then((client) => {

    client.WSGetViewMasterAksesDataAll(args1, function (err, result, rawResponse, soapHeader, rawRequest) {

      let hasil1 = result.docGetViewDataMasterAksesAllResponse;
      callback(hasil1)
    })
  })

}

function fsGetDataOrafin(param, callback) {
  const url = constant.url_ws;

  let args = {
    RequestERPR: {
      ERPR_NUMBER: param
    }
  }
  soap.createClientAsync(url).then((client) => {

    client.fsGetDataOrafin(args, function (err, result, rawResponse, soapHeader, rawRequest) {

      let callback_data;

      if (err) {
        callback_data = {
          'PR_NUMBER': '',
          'ER_NUMBER': '',
          'pr_date': '',
          'PR_APPROVED_DATE': '',
          'PO_DATE': '',
          'ER_DATE': '',
          'DESCRIPTION_ER': '',
          'BENEFICIARY': '',
          'ACCOUNT_NUMBER': '',
          'BANK_NAME': '',
          'INVOICE_NUM': '',
          'PAID_AMOUNT': '',
          'ACCOUNTING_DATE': '',
          'PAYMENT_DATE': '',
          'PAY_GROUP': '',
          'BRANCHID': '',
          'NOTE': '',
          'WHTCODE': '',
          'ERROR': err
        }
      }

      if (result) {
        callback_data = result.ResponeERPR.respone[0];
      } else {
        callback_data = {
          'PR_NUMBER': '',
          'ER_NUMBER': '',
          'pr_date': '',
          'PR_APPROVED_DATE': '',
          'PO_DATE': '',
          'ER_DATE': '',
          'DESCRIPTION_ER': '',
          'BENEFICIARY': '',
          'ACCOUNT_NUMBER': '',
          'BANK_NAME': '',
          'INVOICE_NUM': '',
          'PAID_AMOUNT': '',
          'ACCOUNTING_DATE': '',
          'PAYMENT_DATE': '',
          'PAY_GROUP': '',
          'BRANCHID': '',
          'NOTE': '',
          'WHTCODE': '',
          'ERROR': ''
        }
      }

      callback(callback_data)
    })
  })
}

function fsGetDataPRSharepointHQ(param, callback) {
  const url = constant.url_ws;

  let args = {
    GET: {
      ERPR_NUMBER: param
    }
  }
  soap.createClientAsync(url).then((client) => {

    client.fsGetDataPRSharepointHQ(args, function (err, result, rawResponse, soapHeader, rawRequest) {

      let callback_data;

      if (err) {
        callback_data = {
          'ID': '',
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
          'TYPE_PR_ER_NUMBER': '',
          'APPROVER_DATE': '',
          'NAME_OF_APPROVERD': '',
          'SLA_PR': '',
          'SLA_PO': '',
          'SLA_ER_DATE': '',
          'SLA_KIRIM': '',
          'SLA_CABANG': '',
          'ACCT': '',
          'SLA_HQ': '',
          'INVOICENO': ''
        }
      }

      if (result) {
        callback_data = result.DRL_x0020_respone_x0020_GetHQ[0];
      } else {
        callback_data = {
          'ID': '',
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
          'TYPE_PR_ER_NUMBER': '',
          'APPROVER_DATE': '',
          'NAME_OF_APPROVERD': '',
          'SLA_PR': '',
          'SLA_PO': '',
          'SLA_ER_DATE': '',
          'SLA_KIRIM': '',
          'SLA_CABANG': '',
          'ACCT': '',
          'SLA_HQ': '',
          'INVOICENO': ''
        }
      }

      callback(callback_data)
    })
  })
}

function fsGetDataPRSharepointHQ_NEW(param, callback) {
  const url = constant.url_ws;

  let args = {
    request: {
      ERPR_NUMBER: param
    }
  }
  soap.createClientAsync(url).then((client) => {

    client.fsGetDataPRSharepointHQ_NEW(args, function (err, result, rawResponse, soapHeader, rawRequest) {

      let callback_data;

      if (err) {
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
          'TYPE_PR_ER_NUMBER': '',
          'APPROVER_DATE': '',
          'NAME_OF_APPROVERD': '',
          'SLA_PR': '',
          'SLA_PO': '',
          'SLA_ER_DATE': '',
          'SLA_KIRIM': '',
          'SLA_CABANG': '',
          'ACCT': '',
          'SLA_HQ': '',
          'INVOICENO': '',
          'ER_BT': '',
          'LAMPIRAN': '',
          'TAC': ''
        }
      }

      if (result) {
        callback_data = result.responseRequestPRHQ;
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
          'TYPE_PR_ER_NUMBER': '',
          'APPROVER_DATE': '',
          'NAME_OF_APPROVERD': '',
          'SLA_PR': '',
          'SLA_PO': '',
          'SLA_ER_DATE': '',
          'SLA_KIRIM': '',
          'SLA_CABANG': '',
          'ACCT': '',
          'SLA_HQ': '',
          'INVOICENO': '',
          'ER_BT': '',
          'LAMPIRAN': '',
          'TAC': ''
        }
      }
      callback(callback_data)
    })
  })
}

function fsGetDataERMultibranch(param, callback) {
  const url = constant.url_ws;

  let args = {
    requestERMultibranch: {
      batch_name: param
    }
  }
  soap.createClientAsync(url).then((client) => {

    client.fsGetDataERMultibranch(args, function (err, result, rawResponse, soapHeader, rawRequest) {

      let callback_data;

      if (err) {
        callback_data = {
          'ER_NUMBER': '',
          'BENEFICIARY': '',
          'ACCOUNT_NUMBER': '',
          'BANK_NAME': '',
          'WHT_TAX_CODE': '',
          'AMOUNT_PAID': ''
        }
      }

      if (result) {
        callback_data = result.ResponseERMultibranch.ArrayData[0];
      } else {
        callback_data = {
          'ER_NUMBER': '',
          'BENEFICIARY': '',
          'ACCOUNT_NUMBER': '',
          'BANK_NAME': '',
          'WHT_TAX_CODE': '',
          'AMOUNT_PAID': ''
        }
      }

      callback(callback_data)
    })
  })
}

function fsSaveDataPRSharepointHQ(
  txt_nopr,
  txt_noer,
  txt_validator1,
  txt_validator2,
  txt_checker,
  kode_cabang,
  txt_dep,
  TIPE_ER,
  txt_periode,
  txt_ti,
  txt_tpc,
  txt_status,
  txt_remarks,
  txt_tif,
  txt_tipeerpr,
  txt_appdate,
  txt_nameapp,
  txt_slapr,
  txt_slapo,
  txt_slaerdate,
  txt_slafin,
  txt_inv,
  sla_kirim,
  sla_cabang,
  acct,
  sla_hq, callback) {
  const url = constant.url_ws;

  let args = {
    requestData: {
      PR_NUMBER: txt_nopr,
      ER_NUMBER: txt_noer,
      VALIDATOR: txt_validator1,
      VALIDATOR2: txt_validator2,
      CHECKER: txt_checker,
      KODECABANG: kode_cabang,
      DEPARTEMENT: txt_dep,
      TIPE_ER: TIPE_ER,
      PERIODE: txt_periode,
      TANGGAL_INCOMING: txt_ti,
      TANGGAL_PROSES_CHECKER: txt_tpc,
      STATUS: txt_status,
      REMARKS: txt_remarks,
      TANGGAL_INCOMING_FINANCE: txt_tif,
      TYPE_PR_ER_NUMBER: txt_tipeerpr,
      APPROVER_DATE: txt_appdate,
      NAME_OF_APPROVERD: txt_nameapp,
      SLA_PR: CheckIsNaN(txt_slapr),
      SLA_PO: CheckIsNaN(txt_slapo),
      SLA_ER_DATE: CheckIsNaN(txt_slaerdate),
      SLA_KIRIM: CheckIsNaN(sla_kirim),
      SLA_CABANG: CheckIsNaN(sla_cabang),
      ACCT: CheckIsNaN(acct),
      SLA_FIN: CheckIsNaN(txt_slafin),
      SLA_HQ: CheckIsNaN(sla_hq),
      INVOICENO: txt_inv
    }
  }
  soap.createClientAsync(url).then((client) => {

    client.fsSaveDataPRSharepointHQ(args, function (err, result, rawResponse, soapHeader, rawRequest) {

      callback(result)
    })
  })
}

function fsSaveDataPRSharepointHQ_NEW(
  txt_nopr,
  txt_noer,
  id_validator1,
  id_validator2,
  id_checker,
  kode_cabang,
  txt_dep,
  TIPE_ER,
  txt_periode,
  txt_ti,
  txt_tpc,
  txt_status,
  txt_remarks,
  txt_tif,
  txt_tipeerpr,
  txt_appdate,
  txt_nameapp,
  txt_slapr,
  txt_slapo,
  txt_slaerdate,
  txt_slafin,
  txt_inv,
  sla_kirim,
  sla_cabang,
  acct,
  sla_hq,
  txt_er_bt,
  txt_lampiran,
  txt_tac, callback) {
  const url = constant.url_ws;

  let args = {
    requestData: {
      PR_NUMBER: txt_nopr,
      ER_NUMBER: txt_noer,
      VALIDATOR: id_validator1,
      VALIDATOR2: id_validator2,
      CHECKER: id_checker,
      KODECABANG: kode_cabang,
      DEPARTEMENT: txt_dep,
      TIPE_ER: TIPE_ER,
      PERIODE: txt_periode,
      TANGGAL_INCOMING: txt_ti,
      TANGGAL_PROSES_CHECKER: txt_tpc,
      STATUS: txt_status,
      REMARKS: txt_remarks,
      TANGGAL_INCOMING_FINANCE: txt_tif,
      TYPE_PR_ER_NUMBER: txt_tipeerpr,
      APPROVER_DATE: txt_appdate,
      NAME_OF_APPROVERD: txt_nameapp,
      SLA_PR: CheckIsNaN(txt_slapr),
      SLA_PO: CheckIsNaN(txt_slapo),
      SLA_ER_DATE: CheckIsNaN(txt_slaerdate),
      SLA_KIRIM: CheckIsNaN(sla_kirim),
      SLA_CABANG: CheckIsNaN(sla_cabang),
      ACCT: CheckIsNaN(acct),
      SLA_FIN: CheckIsNaN(txt_slafin),
      SLA_HQ: CheckIsNaN(sla_hq),
      INVOICENO: txt_inv,
      ER_BT: txt_er_bt,
      LAMPIRAN: txt_lampiran,
      TAC: txt_tac,
      ACTIVE: '1'
    }
  }
  soap.createClientAsync(url).then((client) => {

    client.fsSaveDataPRSharepointHQ_NEW(args, function (err, result, rawResponse, soapHeader, rawRequest) {

      callback(result)
    })
  })
}

function fsSaveDataPRSharepoint(
  txt_nopr,
  txt_noer,
  txt_validator1,
  txt_validator2,
  txt_checker,
  kode_cabang,
  txt_dep,
  TIPE_ER,
  txt_periode,
  txt_ti,
  txt_tpc,
  txt_status,
  txt_remarks,
  txt_tif,
  txt_slapr,
  txt_slapo,
  txt_slaerdate,
  txt_slafin,
  txt_inv,
  sla_kirim,
  sla_cabang,
  acct,
  sla_hq, callback) {
  const url = constant.url_ws;

  let args = {
    Untitled: {
      PR_NUMBER: txt_nopr,
      ER_NUMBER: txt_noer,
      VALIDATOR: txt_validator1,
      VALIDATOR2: txt_validator2,
      CHECKER: txt_checker,
      KODECABANG: kode_cabang,
      DEPARTEMENT: txt_dep,
      TIPE_ER: TIPE_ER,
      PERIODE: txt_periode,
      TANGGAL_INCOMING: txt_ti,
      TANGGAL_PROSES_CHECKER: txt_tpc,
      STATUS: txt_status,
      REMARKS: txt_remarks,
      TANGGAL_INCOMING_FINANCE: txt_tif,
      SLA_PR: txt_slapr,
      SLA_PO: txt_slapo,
      SLA_ER_DATE: CheckIsNaN(txt_slaerdate),
      SLA_KIRIM: CheckIsNaN(sla_kirim),
      SLA_CABANG: CheckIsNaN(sla_cabang),
      ACCT: CheckIsNaN(acct),
      SLA_FIN: CheckIsNaN(txt_slafin),
      SLA_HQ: CheckIsNaN(sla_hq),
      INVOICENO: txt_inv
    }
  }
  soap.createClientAsync(url).then((client) => {

    client.fsSaveDataPRSharepoint(args, function (err, result, rawResponse, soapHeader, rawRequest) {

      callback(result)
    })
  })
}

function fsSaveDataPRSharepoint_NEW(
  txt_nopr,
  txt_noer,
  id_validator1,
  id_validator2,
  id_checker,
  kode_cabang,
  txt_dep,
  TIPE_ER,
  txt_periode,
  txt_ti,
  txt_tpc,
  txt_status,
  txt_remarks,
  txt_tif,
  txt_slapr,
  txt_slapo,
  txt_slaerdate,
  txt_slafin,
  txt_inv,
  sla_kirim,
  sla_cabang,
  acct,
  sla_hq,
  txt_er_bt,
  txt_lampiran,
  txt_tac, callback) {
  const url = constant.url_ws;

  let args = {
    requestData: {
      PR_NUMBER: txt_nopr,
      ER_NUMBER: txt_noer,
      VALIDATOR: id_validator1,
      VALIDATOR2: id_validator2,
      CHECKER: id_checker,
      KODECABANG: kode_cabang,
      DEPARTEMENT: txt_dep,
      TIPE_ER: TIPE_ER,
      PERIODE: txt_periode,
      TANGGAL_INCOMING: txt_ti,
      TANGGAL_PROSES_CHECKER: txt_tpc,
      STATUS: txt_status,
      REMARKS: txt_remarks,
      TANGGAL_INCOMING_FINANCE: txt_tif,
      SLA_PR: txt_slapr,
      SLA_PO: txt_slapo,
      SLA_ER_DATE: CheckIsNaN(txt_slaerdate),
      SLA_KIRIM: CheckIsNaN(sla_kirim),
      SLA_CABANG: CheckIsNaN(sla_cabang),
      ACCT: CheckIsNaN(acct),
      SLA_FIN: CheckIsNaN(txt_slafin),
      SLA_HQ: CheckIsNaN(sla_hq),
      INVOICENO: txt_inv,
      ER_BT: txt_er_bt,
      LAMPIRAN: txt_lampiran,
      TAC: txt_tac,
      ACTIVE: '1'
    }
  }
  soap.createClientAsync(url).then((client) => {

    client.fsSaveDataPRSharepoint_NEW(args, function (err, result, rawResponse, soapHeader, rawRequest) {

      callback(result)
    })
  })
}

function fsUpdateDataPRSharepointHQ(
  txt_nopr,
  txt_noer,
  txt_validator1,
  txt_validator2,
  txt_checker,
  txt_branchid,
  txt_dep,
  TIPE_ER,
  txt_periode,
  txt_ti,
  txt_tpc,
  txt_status,
  txt_remarks,
  txt_tif,
  txt_tipeerpr,
  txt_appdate,
  txt_nameapp,
  txt_slapr,
  txt_slapo,
  txt_slaerdate,
  txt_slafin,
  sla_kirim,
  sla_cabang,
  acct,
  sla_hq, callback) {
  const url = constant.url_ws;

  let erpr_number;

  if (txt_nopr != '') {
    erpr_number = txt_nopr
  } else {
    erpr_number = txt_noer
  }

  let args = {
    UpdateSharepointDataRequest: {
      ERPR_NUMBER: erpr_number,
      VALIDATOR: txt_validator1,
      VALIDATOR2: txt_validator2,
      CHECKER: txt_checker,
      KODECABANG: txt_branchid,
      DEPARTEMENT: txt_dep,
      TIPE_ER: TIPE_ER,
      PERIODE: txt_periode,
      TANGGAL_INCOMING: txt_ti,
      TANGGAL_PROSES_CHECKER: txt_tpc,
      STATUS: txt_status,
      REMARKS: txt_remarks,
      TANGGAL_INCOMING_FINANCE: txt_tif,
      TYPE_PR_ER_NUMBER: txt_tipeerpr,
      APPROVER_DATE: txt_appdate,
      NAME_OF_APPROVERD: txt_nameapp,
      SLA_PR: CheckIsNaN(txt_slapr),
      SLA_PO: CheckIsNaN(txt_slapo),
      SLA_ER_DATE: CheckIsNaN(txt_slaerdate),
      SLA_KIRIM: CheckIsNaN(sla_kirim),
      SLA_CABANG: CheckIsNaN(sla_cabang),
      ACCT: CheckIsNaN(acct),
      SLA_FIN: CheckIsNaN(txt_slafin),
      SLA_HQ: CheckIsNaN(sla_hq)
    }
  }
  soap.createClientAsync(url).then((client) => {

    client.fsUpdateDataPRSharepointHQ(args, function (err, result, rawResponse, soapHeader, rawRequest) {

      callback(result)
    })
  })
}

function fsUpdateDataPRSharepointHQ_NEW(
  txt_nopr,
  txt_noer,
  id_validator1,
  id_validator2,
  id_checker,
  txt_branchid,
  txt_dep,
  TIPE_ER,
  txt_periode,
  txt_ti,
  txt_tpc,
  txt_status,
  txt_remarks,
  txt_tif,
  txt_tipeerpr,
  txt_appdate,
  txt_nameapp,
  txt_slapr,
  txt_slapo,
  txt_slaerdate,
  txt_slafin,
  sla_kirim,
  sla_cabang,
  acct,
  sla_hq,
  txt_er_bt,
  txt_lampiran,
  txt_tac, callback) {
  const url = constant.url_ws;

  let erpr_number;

  if (txt_nopr != '') {
    erpr_number = txt_nopr
  } else {
    erpr_number = txt_noer
  }

  let args = {
    
      ERPR_NUMBER: erpr_number,
      VALIDATOR: id_validator1,
      VALIDATOR2: id_validator2,
      CHECKER: id_checker,
      KODECABANG: txt_branchid,
      DEPARTEMENT: txt_dep,
      TIPE_ER: TIPE_ER,
      PERIODE: txt_periode,
      TANGGAL_INCOMING: txt_ti,
      TANGGAL_PROSES_CHECKER: txt_tpc,
      STATUS: txt_status,
      REMARKS: txt_remarks,
      TANGGAL_INCOMING_FINANCE: txt_tif,
      TYPE_PR_ER_NUMBER: txt_tipeerpr,
      APPROVER_DATE: txt_appdate,
      NAME_OF_APPROVERD: txt_nameapp,
      SLA_PR: CheckIsNaN(txt_slapr),
      SLA_PO: CheckIsNaN(txt_slapo),
      SLA_ER_DATE: CheckIsNaN(txt_slaerdate),
      SLA_KIRIM: CheckIsNaN(sla_kirim),
      SLA_CABANG: CheckIsNaN(sla_cabang),
      ACCT: CheckIsNaN(acct),
      SLA_FIN: CheckIsNaN(txt_slafin),
      SLA_HQ: CheckIsNaN(sla_hq),
      ER_BT: txt_er_bt,
      LAMPIRAN: txt_lampiran,
      TAC: txt_tac
    
  }
  soap.createClientAsync(url).then((client) => {

    client.fsUpdateDataPRSharepointHQ_NEW(args, function (err, result, rawResponse, soapHeader, rawRequest) {
  
      callback(result)
    })
  })
}

function fsUpdateDataPRSharepoint(
  txt_nopr,
  txt_noer,
  txt_validator1,
  txt_validator2,
  txt_checker,
  txt_branchid,
  txt_dep,
  TIPE_ER,
  txt_periode,
  txt_ti,
  txt_tpc,
  txt_status,
  txt_remarks,
  txt_tif,
  txt_slapr,
  txt_slapo,
  txt_slaerdate,
  txt_slafin,
  sla_kirim,
  sla_cabang,
  acct,
  sla_hq, callback) {
  const url = constant.url_ws;

  let erpr_number;

  if (txt_nopr != '') {
    erpr_number = txt_nopr
  } else {
    erpr_number = txt_noer
  }

  let args = {
    Untitled: {
      ERPR_NUMBER: erpr_number,
      VALIDATOR: txt_validator1,
      VALIDATOR2: txt_validator2,
      CHECKER: txt_checker,
      KODECABANG: txt_branchid,
      DEPARTEMENT: txt_dep,
      TIPE_ER: TIPE_ER,
      PERIODE: txt_periode,
      TANGGAL_INCOMING: txt_ti,
      TANGGAL_PROSES_CHECKER: txt_tpc,
      STATUS: txt_status,
      REMARKS: txt_remarks,
      TANGGAL_INCOMING_FINANCE: txt_tif,
      SLA_PR: CheckIsNaN(txt_slapr),
      SLA_PO: CheckIsNaN(txt_slapo),
      SLA_ER_DATE: CheckIsNaN(txt_slaerdate),
      SLA_KIRIM: CheckIsNaN(sla_kirim),
      SLA_CABANG: CheckIsNaN(sla_cabang),
      ACCT: CheckIsNaN(acct),
      SLA_FIN: CheckIsNaN(txt_slafin),
      SLA_HQ: CheckIsNaN(sla_hq)
    }
  }
  soap.createClientAsync(url).then((client) => {

    client.fsUpdateDataPRSharepoint(args, function (err, result, rawResponse, soapHeader, rawRequest) {

      callback(result)
    })
  })
}

function fsUpdateDataPRSharepoint_NEW(
  txt_nopr,
  txt_noer,
  id_validator1,
  id_validator2,
  id_checker,
  txt_branchid,
  txt_dep,
  TIPE_ER,
  txt_periode,
  txt_ti,
  txt_tpc,
  txt_status,
  txt_remarks,
  txt_tif,
  txt_slapr,
  txt_slapo,
  txt_slaerdate,
  txt_slafin,
  sla_kirim,
  sla_cabang,
  acct,
  sla_hq,
  txt_er_bt,
  txt_lampiran,
  txt_tac, callback) {
  const url = constant.url_ws;

  let erpr_number;

  if (txt_nopr != '') {
    erpr_number = txt_nopr
  } else {
    erpr_number = txt_noer
  }

  let args = {
    requestUpdate: {
      ERPR_NUMBER: erpr_number,
      VALIDATOR: id_validator1,
      VALIDATOR2: id_validator2,
      CHECKER: id_checker,
      KODECABANG: txt_branchid,
      DEPARTEMENT: txt_dep,
      TIPE_ER: TIPE_ER,
      PERIODE: txt_periode,
      TANGGAL_INCOMING: txt_ti,
      TANGGAL_PROSES_CHECKER: txt_tpc,
      STATUS: txt_status,
      REMARKS: txt_remarks,
      TANGGAL_INCOMING_FINANCE: txt_tif,
      SLA_PR: CheckIsNaN(txt_slapr),
      SLA_PO: CheckIsNaN(txt_slapo),
      SLA_ER_DATE: CheckIsNaN(txt_slaerdate),
      SLA_KIRIM: CheckIsNaN(sla_kirim),
      SLA_CABANG: CheckIsNaN(sla_cabang),
      ACCT: CheckIsNaN(acct),
      SLA_FIN: CheckIsNaN(txt_slafin),
      SLA_HQ: CheckIsNaN(sla_hq),
      ER_BT: txt_er_bt,
      LAMPIRAN: txt_lampiran,
      TAC: txt_tac
    }
  }
  soap.createClientAsync(url).then((client) => {

    client.fsUpdateDataPRSharepoint_NEW(args, function (err, result, rawResponse, soapHeader, rawRequest) {

      callback(result)
    })
  })
}

function convertDate(date) {

  if (date == '' || date == null) {
    return ''
  }

  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');

}

function CheckIsNaNDate(date) {
  if (date == "NaN-NaN-NaN") {
    return ''
  } else {
    return date
  }
}

function convertBranch(branch) {
  if (!branch) return ''
  else return branch.substring(0, 3);
}

function dateReplace(date) {
  if (date == '') return ''
  else return date.replace('/', '-')
}

function CheckIsNaN(param) {
  if (param == 'NaN' || param === NaN || isNaN(param)) {
    return '-'
  } else {
    return param
  }
}

module.exports = router;