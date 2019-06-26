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

  let jumlah_paid_amount = 0,
    tipe_mb, tipe_nci, tipe_mp, tipe_bt;
  tipe_mb = txt_noerpr.indexOf("MB");
  tipe_nci = txt_noerpr.indexOf("NCI");
  tipe_bt = txt_noerpr.indexOf("BT");
  tipe_mp = txt_noerpr.indexOf("MP");

  if (tipe_ws == 'BTACT' || tipe_ws == 'BTADV') {

    if (tipe_ws === 'BTACT') {
      var param_ws_bt = 'actual';
    } else {
      var param_ws_bt = 'advance';
    }

    fsGetDataBt(txt_noerpr, param_ws_bt, (result) => {
      var {
        BATCH_NAME,
        ER_DATE,
        INVOICE_TYPE_LOOKUP_CODE,
        INVOICE_NUM,
        TRADING_PARTNER,
        INVOICE_DATE,
        INVOICE_AMOUNT,
        DESCRIPTION,
        APPROVAL,
        STATUS,
        PAYMENT_DATE,
        SETUJUI,
        VALIDASI,
        TYPE,
        USERSETUJUI,
        PAY_GROUP_NAME,
        BENEFICIARY,
        ACCOUNT_NUMBER,
        BRANCH,
        ERROR,
        BANKNAME,
        BRANCHNAME,
      } = result;

      fsGetDataPRSharepointHQ_NEW(BATCH_NAME, (result_hq) => {
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

        if (location == 'HQ') { // role HQ

          if (prnumber_hq != '' || ernumber_hq != '') {
            button = 'update';
          } else {
            button = 'save';
          }

        } else { // role cabang

          if (prnumber_hq != '' || ernumber_hq != '') {
            button = 'hide';
          } else {
            //button = 'save';
            button = 'hide';
          }

        }
        var kode = BRANCH
        if (INVOICE_NUM != '') {
          kode = convertBranch(kode);

          if (kode == '' || kode === undefined) {
            kode = '010';
          }

          getDataBranch('', kode, '', (result_branch) => {

            var checker_branch = result_branch.CHECKER,
              validator1_branch = result_branch.VALIDATOR1,
              validator2_branch = result_branch.VALIDATOR2,
              id_checker = result_branch.id_checker,
              id_validator1 = result_branch.id_validator1,
              id_validator2 = result_branch.id_validator2,
              error_branch = result_branch.error

            if (CHECKER == '') {
              checker = id_checker
            } else {
              checker = CHECKER;
            }

            if (VALIDATOR == '') {
              validator1 = id_validator1
            } else {
              validator1 = VALIDATOR;
            }

            if (VALIDATOR2 == '') {
              validator2 = id_validator2
            } else {
              validator2 = VALIDATOR2
            }

            getDataChecker('', '', checker, (result) => {

              callback_data = {
                'status': 'success',
                'txt_noerpr': INVOICE_NUM,
                'txt_nopr': '',
                'txt_noer': BATCH_NAME,
                'txt_prdate': CheckIsNaNDate(convertDate('-')),
                'txt_appdate': CheckIsNaNDate(convertDate('-')),
                'txt_podate': CheckIsNaNDate(convertDate('-')),
                'txt_erdate': CheckIsNaNDate(convertDate(ER_DATE)),
                'txt_beneficiary': BENEFICIARY,
                'txt_accnumber': ACCOUNT_NUMBER,
                'txt_amount': INVOICE_AMOUNT,
                'txt_accdate': CheckIsNaNDate(convertDate('-')),
                'txt_tglcair': CheckIsNaNDate(convertDate(PAYMENT_DATE)),
                'txt_paygroup': PAY_GROUP_NAME,
                'txt_branchid': BRANCH,
                'txt_kegiatan': DESCRIPTION,
                'data1': INVOICE_NUM,
                'txt_validator1': result.nama_validator1,
                'txt_validator2': result.nama_validator2,
                'txt_checker': checker,
                'txt_tipeer': TIPE_ER,
                'txt_periode': convertDate(PERIODE),
                'txt_ti': CheckIsNaNDate(convertDate(TANGGAL_INCOMING)),
                'txt_tpc': CheckIsNaNDate(convertDate(TANGGAL_PROSES_CHECKER)),
                'txt_tif': CheckIsNaNDate(convertDate(TANGGAL_INCOMING_FINANCE)),
                'txt_status': STATUS,
                'txt_remarks': REMARKS,
                'txt_tipeerpr': TYPE_PR_ER_NUMBER,
                'txt_dep': DEPARTEMENT,
                'txt_inv': INVOICE_NUM,
                'button': button,
                'txt_amountpaid': INVOICE_AMOUNT,
                'tipe': 'biasa',
                'tipe_ws': tipe_ws,
                'ERROR': ERROR,
                'id_checker': checker,
                'id_validator1': validator1,
                'id_validator2': validator2,
                'txt_er_bt': ER_BT,
                'txt_tac': '',
                'txt_lampiran': LAMPIRAN,
                'txt_btappdate': CheckIsNaNDate(convertDate(SETUJUI)),
                'txt_btvaldatedate': CheckIsNaNDate(convertDate(VALIDASI)),
                'txt_btvalidateby': USERSETUJUI,
                'txt_bankname': BANKNAME,
                'txt_branchname': BRANCHNAME,
                'txt_paymentdate': PAYMENT_DATE
              }

              res.status(200).send(callback_data)
              return;
            })
          })

        } else {

          callback_data = {
            'status': 'failed',
            'button': 'hide',
            'tipe': 'biasa',
            'ERROR': ERROR,
          }

          res.status(200).send(callback_data)
          return;
        }

      })

    })

  } else if (tipe_ws == 'MP') { // for multipaid
    fsGetDataERMultipaid(txt_noerpr, (result) => {

      var {
        ER_NUMBER,
        BENEFICIARY,
        ACCOUNT_NUMBER,
        BANK_NAME,
        WHT_TAX_CODE,
        AMOUNT_PAID,
        PAY_GROUP_NAME,
        ERRORMB,
        totalBranch,
        totalPaid,
        description
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

        var button, kode;
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
            //button = 'save';
            button = 'hide';
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
            kode_cabang_ora = result_ora.BRANCHID,
            nomor_po = result.PO_NUMBER
          var kode, checker, callback_data, validator1, validator2;
          if (ER_NUMBER != '') {
            kode = convertBranch(kode_cabang_ora);

            if (kode == '' || kode === undefined || checkNULL(kode) == '') {
              kode = '010';
            }

            //jumlah_paid_amount = (AMOUNT_PAID - WHT_TAX_CODE)

            getDataBranch('', kode, '', (result_branch) => {

              var checker_branch = result_branch.CHECKER,
                validator1_branch = result_branch.VALIDATOR1,
                validator2_branch = result_branch.VALIDATOR2,
                id_checker = result_branch.id_checker,
                id_validator1 = result_branch.id_validator1,
                id_validator2 = result_branch.id_validator2,
                error_branch = result_branch.error

              if (CHECKER == '') {
                checker = id_checker
              } else {
                checker = CHECKER
              }

              if (VALIDATOR == '') {
                validator1 = id_validator1
              } else {
                validator1 = VALIDATOR
              }

              if (VALIDATOR2 == '') {
                validator2 = id_validator2
              } else {
                validator2 = VALIDATOR2
              }

              getDataChecker('', '', checker, (result) => {

                if(checkNULL(totalBranch) == '' && checkNULL(totalPaid) == ''){
                  callback_data = {
                    'status': 'failed',
                    'button': 'hide',
                    'tipe': 'multibranch',
                    'ERROR': '',
                  }
                } else if (tipe_nci != -1 || tipe_bt != -1) {
                  callback_data = {
                    'status': 'failed',
                    'button': 'hide',
                    'tipe': 'multibranch',
                    'ERROR': '',
                  }
                } else if (checkNULL(totalPaid) > 1) {
                  callback_data = {
                    'txt_checker': checker,
                    'txt_tipeer': TIPE_ER,
                    'txt_tipeerpr': TYPE_PR_ER_NUMBER,
                    'txt_validator1': result.nama_validator1,
                    'txt_validator2': result.nama_validator2,
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
                    'txt_amountpaid': AMOUNT_PAID,
                    'button': button,
                    'tipe': 'multibranch',
                    'location': location,
                    'txt_prdate': convertDate(pr_date_ora),
                    'txt_podate': convertDate(po_date_ora),
                    'txt_erdate': convertDate(er_date_ora),
                    'txt_accdate': convertDate(acc_date_ora),
                    'txt_tglcair': convertDate(pay_date_ora),
                    'ERROR': error_ora,
                    'ERRORMB': ERRORMB,
                    'id_checker': checker,
                    'id_validator1': validator1,
                    'id_validator2': validator2,
                    'txt_tac': TAC,
                    'error_branch': error_branch,
                    'tipe_ws': tipe_ws,
                    'txt_paygroup': PAY_GROUP_NAME,
                    'txt_nomorpo': nomor_po,
                    'txt_kegiatan': description,
                    'txt_branchname': 'HEADQUARTER'
                  }
                } else if (checkNULL(totalBranch) > 1) {
                  callback_data = {
                    'status': 'failed',
                    'button': 'hide',
                    'tipe': 'multibranch',
                    'ERROR': '',
                  }
                } else if (checkNULL(totalBranch) == 1 && checkNULL(totalPaid) == 1) {
                  callback_data = {
                    'status': 'failed',
                    'button': 'hide',
                    'tipe': 'multibranch',
                    'ERROR': '',
                  }
                }

                res.status(200).send(callback_data)
                return;
              })
            })

          } else {
            let error_data;
            if (ERRORMB) {
              error_data = ERRORMB;
            } else {
              error_data = error_ora;
            }

            callback_data = {
              'status': 'failed',
              'button': 'hide',
              'tipe': 'multibranch',
              'ERROR': error_data,
            }

            res.status(200).send(callback_data)
            return;
          }

        })
      })
    })
  } else if (tipe_ws == 'MB') { // for multibranch
    fsGetDataERMultibranch(txt_noerpr, (result) => {

      var {
        ER_NUMBER,
        BENEFICIARY,
        ACCOUNT_NUMBER,
        BANK_NAME,
        WHT_TAX_CODE,
        AMOUNT_PAID,
        PAY_GROUP_NAME,
        ERRORMB,
        totalBranch,
        totalPaid,
        description
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

        var button, kode;
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
            //button = 'save';
            button = 'hide';
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
            kode_cabang_ora = result_ora.BRANCHID,
            nomor_po = result.PO_NUMBER
          var kode, checker, callback_data, validator1, validator2;
          if (ER_NUMBER != '') {
            kode = convertBranch(kode_cabang_ora);

            if (kode == '' || kode === undefined || checkNULL(kode) == '') {
              kode = '010';
            }

            //jumlah_paid_amount = (AMOUNT_PAID - WHT_TAX_CODE)

            getDataBranch('', kode, '', (result_branch) => {

              var checker_branch = result_branch.CHECKER,
                validator1_branch = result_branch.VALIDATOR1,
                validator2_branch = result_branch.VALIDATOR2,
                id_checker = result_branch.id_checker,
                id_validator1 = result_branch.id_validator1,
                id_validator2 = result_branch.id_validator2,
                error_branch = result_branch.error

              if (CHECKER == '') {
                checker = id_checker
              } else {
                checker = CHECKER
              }

              if (VALIDATOR == '') {
                validator1 = id_validator1
              } else {
                validator1 = VALIDATOR
              }

              if (VALIDATOR2 == '') {
                validator2 = id_validator2
              } else {
                validator2 = VALIDATOR2
              }

              getDataChecker('', '', checker, (result) => {

                if (checkNULL(totalBranch) == 1 || checkNULL(totalPaid) > 1) {
                  callback_data = {
                    'status': 'failed',
                    'button': 'hide',
                    'tipe': 'multibranch',
                    'ERROR': '',
                  }
                } else if (checkNULL(totalBranch) > 1 || tipe_mb != -1 || tipe_nci != -1 || tipe_bt == -1) {
                  callback_data = {
                    'txt_checker': checker,
                    'txt_tipeer': TIPE_ER,
                    'txt_tipeerpr': TYPE_PR_ER_NUMBER,
                    'txt_validator1': result.nama_validator1,
                    'txt_validator2': result.nama_validator2,
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
                    'txt_amountpaid': AMOUNT_PAID,
                    'button': button,
                    'tipe': 'multibranch',
                    'location': location,
                    'txt_prdate': convertDate(pr_date_ora),
                    'txt_podate': convertDate(po_date_ora),
                    'txt_erdate': convertDate(er_date_ora),
                    'txt_accdate': convertDate(acc_date_ora),
                    'txt_tglcair': convertDate(pay_date_ora),
                    'ERROR': error_ora,
                    'ERRORMB': ERRORMB,
                    'id_checker': checker,
                    'id_validator1': validator1,
                    'id_validator2': validator2,
                    'txt_tac': TAC,
                    'error_branch': error_branch,
                    'tipe_ws': tipe_ws,
                    'txt_paygroup': PAY_GROUP_NAME,
                    'txt_nomorpo': nomor_po,
                    'txt_kegiatan': description,
                    'txt_branchname': 'HEADQUARTER'
                  }
                } else {
                  callback_data = {
                    'status': 'failed',
                    'button': 'hide',
                    'tipe': 'multibranch',
                    'ERROR': '',
                  }
                }

                res.status(200).send(callback_data)
                return;
              })
            })

          } else {
            let error_data;
            if (ERRORMB) {
              error_data = ERRORMB;
            } else {
              error_data = error_ora;
            }

            callback_data = {
              'status': 'failed',
              'button': 'hide',
              'tipe': 'multibranch',
              'ERROR': error_data,
            }

            res.status(200).send(callback_data)
            return;
          }

        })
      })
    })
  } else { // for er single
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
        ERROR,
        PO_STATUS,
        PR_STATUS,
        WHT_AMOUNT,
        PO_NUMBER,
        totalBranch,
        totalPaid,
        BANK_NAME,
        BRANCHNAME
      } = result;

      if (WHT_AMOUNT < 0) {
        WHT_AMOUNT = WHT_AMOUNT * (-1);
      } else {
        WHT_AMOUNT = WHT_AMOUNT;
      }

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
            //button = 'save';
            button = 'hide';
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
          return;
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

            if (CHECKER == '') {
              checker = id_checker
            } else {
              checker = CHECKER
            }

            if (CHECKER == '') {
              validator1 = id_validator1
            } else {
              validator1 = VALIDATOR
            }

            if (CHECKER == '') {
              validator2 = id_validator2
            } else {
              validator2 = VALIDATOR2
            }

            if (WHT_AMOUNT == '' || WHT_AMOUNT == null) {
              var jumlah_tax_amount_er = parseInt(PAID_AMOUNT);
              WHT_AMOUNT = 0;
            } else {
              var jumlah_tax_amount_er = (parseInt(PAID_AMOUNT) + parseInt(WHT_AMOUNT));
              WHT_AMOUNT = WHT_AMOUNT;
            }

            getDataChecker('', '', checker, (result) => {

              if (checkNULL(totalBranch) > 2 || checkNULL(totalPaid) > 1) {
                callback_data = {
                  'status': 'failed',
                  'button': 'hide',
                  'tipe': 'biasa',
                  'ERROR': '',
                }
              } else if (checkNULL(totalBranch) <= 2 || checkNULL(totalPaid) == 1) {
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
                  'txt_validator1': result.nama_validator1,
                  'txt_validator2': result.nama_validator2,
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
                  'id_checker': checker,
                  'id_validator1': validator1,
                  'id_validator2': validator2,
                  'txt_tac': TAC,
                  'txt_postatus': PO_STATUS,
                  'txt_prstatus': PR_STATUS,
                  'txt_tax_er': WHT_AMOUNT,
                  'txt_jumlah_tax_er': jumlah_tax_amount_er,
                  'txt_nomorpo': PO_NUMBER,
                  'txt_bankname': BANK_NAME,
                  'txt_branchname': BRANCHNAME,
                  'txt_paymentdate': PAYMENT_DATE
                }
              } else {

                callback_data = {
                  'status': 'failed',
                  'button': 'hide',
                  'tipe': 'biasa',
                  'ERROR': '',
                }

              }

              res.status(200).send(callback_data);
              return;
            })
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
    txt_kegiatan,
    txt_beneficiary,
    txt_paygroup,
    txt_bankname,
    txt_accnumber,
    txt_amount,
    txt_branchname,
    txt_paymentdate,
    txt_nameupd,
    txt_noerpr,
    txt_podate,
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
    txt_tacmb,
    txt_kegiatanmb,
    txt_beneficiarymb,
    txt_paygroupmb,
    txt_amountpaidmb,
    txt_banknamemb,
    txt_accountnumbermb
  } = req.body;

  if (txt_tipeermb == 'MultiBranch' || txt_tipeerpr == 'MultiBranch' ||
    txt_tipeermb == 'multibranch' || txt_tipeerpr == 'multibranch') mb = 'mb'
  else mb = ''

  if (tipe_ws == 'MB') TIPE_ER = 'MultiBranch'
  else if (tipe_ws == 'BTACT') TIPE_ER = 'BT Actual';
  else if (tipe_ws == 'BTADV') TIPE_ER = 'BT Advance';
  else if (tipe_ws == 'ER') TIPE_ER = 'Expense Request';
  else if (tipe_ws == 'MP') TIPE_ER = 'MultiPaid';

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
      txt_tipeerpr,
      txt_periode,
      txt_ti,
      txt_tpc,
      txt_status,
      txt_remarks,
      txt_tif,
      TIPE_ER,
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
          // fsUpdateDataPRSharepoint_NEW(
          //   txt_nopr,
          //   txt_noer,
          //   id_validator1,
          //   id_validator2,
          //   id_checker,
          //   txt_branchid,
          //   txt_dep,
          //   TIPE_ER,
          //   txt_periode,
          //   txt_ti,
          //   txt_tpc,
          //   txt_status,
          //   txt_remarks,
          //   txt_tif,
          //   txt_slapr,
          //   txt_slapo,
          //   txt_slaerdate,
          //   txt_slafin,
          //   sla_kirim,
          //   sla_cabang,
          //   acct,
          //   sla_hq,
          //   txt_er_bt,
          //   txt_lampiran,
          //   txt_tac, (result_branch) => {

          //   })

          res.status(200).send('OK')
          return;
        } else {
          res.status(200).send(result)
          return;
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
      txt_tipeerprmb,
      txt_periodemb,
      txt_timb,
      txt_tpcmb,
      txt_statusmb,
      txt_remarksmb,
      txt_tifmb,
      TIPE_ER,
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
      txt_tacmb, (result) => {
        if (!result) {
          // fsUpdateDataPRSharepoint_NEW(
          //   txt_noprmb,
          //   txt_noermb,
          //   id_validator1,
          //   id_validator2,
          //   id_checker,
          //   htxt_branchidmb,
          //   txt_depmb,
          //   TIPE_ER,
          //   txt_periodemb,
          //   txt_timb,
          //   txt_tpcmb,
          //   txt_statusmb,
          //   txt_remarksmb,
          //   txt_tifmb,
          //   txt_slaprmb,
          //   txt_slapomb,
          //   txt_slaerdatemb,
          //   txt_slafinmb,
          //   sla_kirimmb,
          //   sla_cabangmb,
          //   acctmb,
          //   sla_hqmb,
          //   txt_er_bt,
          //   txt_lampiran,
          //   txt_tac, (result_branch) => {

          //   })

          res.status(200).send('OK')
          return;
        } else {
          res.status(200).send(result)
          return;
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
    txt_kegiatan,
    txt_beneficiary,
    txt_paygroup,
    txt_bankname,
    txt_accnumber,
    txt_amount,
    txt_branchname,
    txt_paymentdate,
    txt_nameupd,
    txt_noerpr,
    txt_podate,
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
    txt_tacmb,
    txt_kegiatanmb,
    txt_beneficiarymb,
    txt_paygroupmb,
    txt_amountpaidmb,
    txt_banknamemb,
    txt_accountnumbermb
  } = req.body;

  if (txt_tipeermb == 'MultiBranch' || txt_tipeerpr == 'MultiBranch' ||
    txt_tipeermb == 'multibranch' || txt_tipeerpr == 'multibranch') mb = 'mb'
  else mb = ''

  if (tipe_ws == 'MB') TIPE_ER = 'MultiBranch'
  else if (tipe_ws == 'BTACT') TIPE_ER = 'BT Actual';
  else if (tipe_ws == 'BTADV') TIPE_ER = 'BT Advance';
  else if (tipe_ws == 'ER') TIPE_ER = 'Expense Request';
  else if (tipe_ws == 'MP') TIPE_ER = 'MultiPaid';

  let sla_kirim = sla(convertDate(txt_ti), convertDate(txt_erdate));
  let sla_cabang = sla(convertDate(txt_ti), convertDate(txt_prdate));
  let acct = sla(convertDate(txt_accdate), convertDate(txt_tpc));
  let sla_hq = sla(convertDate(txt_tglcair), convertDate(txt_ti));

  let sla_kirimmb = sla(convertDate(txt_timb), convertDate(htxt_erdatemb));
  let sla_cabangmb = sla(convertDate(txt_timb), convertDate(htxt_prdatemb));
  let acctmb = sla(convertDate(htxt_accdatemb), convertDate(txt_tpcmb));
  let sla_hqmb = sla(convertDate(htxt_tglcairmb), convertDate(txt_timb));

  let active = 1

  if ((txt_nopr + mb == '' && txt_nopr + mb == null) &&
    (txt_noer + mb == '' && txt_noer + mb == null)) {
    res.status(200).send('PR atau ER Number Tidak Boleh Kosong');
    return;
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
        txt_tipeerpr,
        txt_periode,
        txt_ti,
        txt_tpc,
        txt_status,
        txt_remarks,
        txt_tif,
        TIPE_ER,
        txt_appdate,
        txt_nameapp,
        txt_slapr,
        txt_slapo,
        txt_slaerdate,
        sla_kirim,
        sla_cabang,
        acct,
        txt_slafin,
        sla_hq,
        txt_inv,
        txt_er_bt,
        txt_lampiran,
        txt_tac,
        active,
        txt_kegiatan,
        txt_beneficiary,
        txt_paygroup,
        txt_bankname,
        txt_accnumber,
        txt_amount,
        txt_prdate,
        txt_appdate,
        txt_podate,
        txt_erdate,
        txt_branchname,
        txt_accdate,
        txt_paymentdate,
        txt_noerpr, // sbg parameter search_no
        txt_nameapp, // sbg name_of_updated
        (result) => {

          if (!result) {

            // fsSaveDataPRSharepoint_NEW(
            //   txt_nopr,
            //   txt_noer,
            //   id_validator1,
            //   id_validator2,
            //   id_checker,
            //   kode_cabang,
            //   txt_dep,
            //   TIPE_ER,
            //   txt_periode,
            //   txt_ti,
            //   txt_tpc,
            //   txt_status,
            //   txt_remarks,
            //   txt_tif,
            //   txt_slapr,
            //   txt_slapo,
            //   txt_slaerdate,
            //   txt_slafin,
            //   txt_inv,
            //   sla_kirim,
            //   sla_cabang,
            //   acct,
            //   sla_hq,
            //   txt_er_bt,
            //   txt_lampiran,
            //   txt_tac, (result_branch) => {

            //   })

            res.status(200).send('OK')
            return
          } else {
            res.status(200).send(result)
            return
          }
          // if(result.error.ERROR===undefined) res.status(200).send('OK')
          // else res.status(200).send(result)

        })
    } else { //insert multibranch
      txt_er_bt = '-';
      txt_lampiran = '-';
      txt_tac = '-';
      txt_accdatemb = ''
      txt_erdatemb = ''
      txt_podatemb = ''
      txt_appdatemb = ''
      txt_prdatemb = ''
      fsSaveDataPRSharepointHQ_NEW(
        txt_noprmb,
        txt_noermb,
        id_validator1,
        id_validator2,
        id_checker,
        htxt_branchidmb,
        txt_depmb,
        txt_tipeerprmb,
        txt_periodemb,
        txt_timb,
        txt_tpcmb,
        txt_statusmb,
        txt_remarksmb,
        txt_tifmb,
        TIPE_ER,
        txt_appdatemb,
        txt_nameappmb,
        txt_slaprmb,
        txt_slapomb,
        txt_slaerdatemb,
        sla_kirimmb,
        sla_cabangmb,
        acctmb,
        txt_slafinmb,
        sla_hqmb,
        txt_invmb,
        txt_er_bt,
        txt_lampiran,
        txt_tacmb,
        active,
        txt_kegiatanmb,
        txt_beneficiarymb,
        txt_paygroupmb,
        txt_banknamemb,
        txt_accountnumbermb,
        txt_amountpaidmb,
        txt_prdatemb,
        txt_appdatemb,
        txt_podatemb,
        txt_erdatemb,
        txt_branchname,
        txt_accdatemb,
        txt_paymentdate,
        txt_noerpr, // sbg parameter search_no
        txt_nameappmb, // sbg name_of_updated
        (result) => {

          if (!result) {

            // fsSaveDataPRSharepoint_NEW(
            //   txt_noprmb,
            //   txt_noermb,
            //   id_validator1,
            //   id_validator2,
            //   id_checker,
            //   htxt_branchidmb,
            //   txt_depmb,
            //   TIPE_ER,
            //   txt_periodemb,
            //   txt_timb,
            //   txt_tpcmb,
            //   txt_statusmb,
            //   txt_remarksmb,
            //   txt_tifmb,
            //   txt_slaprmb,
            //   txt_slapomb,
            //   txt_slaerdatemb,
            //   txt_slafinmb,
            //   txt_invmb,
            //   sla_kirimmb,
            //   sla_cabangmb,
            //   acctmb,
            //   sla_hqmb,
            //   txt_er_bt,
            //   txt_lampiran,
            //   txt_tacmb, (result_branch) => {

            //   })

            res.status(200).send('OK')
            return
          } else {
            res.status(200).send(result)
            return
          }
          // if(result.error.ERROR===undefined) res.status(200).send('OK')
          // else res.status(200).send(result)

        })
    }


  }

})

// ini buat yang pake ajax
router.post('/getChecker', (req, res, next) => {

  let {
    search
  } = req.body;

  getDataBranch('', '', search, (result) => {

    res.status(200).send(result);
    return;
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

        if (!hasil) {
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
    .catch(err => {
      callback({
        'CHECKER': err,
        "VALIDATOR1": err,
        "VALIDATOR2": err,
        "id_checker": err,
        "id_validator1": err,
        "id_validator2": err
      })
    })
}

router.post('/getNameAD', (req, res, next) => {

  var ad = new ActiveDirectory(config);

  let {
    nik
  } = req.body;

  ad.findUser(nik, function (err, user) {
    if (user === undefined || user === "undefined") {
      res.status(200).send({
        'givenName': '',
        'sn': '',
        'fullName': ''
      });
      return;
    } else {

      if (user.givenName == user.sn) {
        var nama_employee = user.givenName
      } else {
        var nama_employee = user.givenName + ' ' + user.sn;
      }

      res.status(200).send({
        'givenName': user.givenName,
        'sn': user.sn,
        'fullName': nama_employee
      });
      return;
    }
  });
})

router.post('/getNameHQ', (req, res, next) => {

  let {
    nik
  } = req.body;

  getEmployeeData(nik, (result) => {
    res.status(200).send({
      'nama': result.NAMA,
      'kode_cabang': result.KODE_CABANG,
      'nama_cabang': result.CABANG
    });
    return;
  })


})

router.post('/getName', (req, res, next) => {
  let {
    nik
  } = req.body;

  getEmployeeData(nik, (result) => {

    if (result.NAMA != 'Data Tidak Ditemukan') {
      res.status(200).send({
        'nama': result.NAMA
      });
      return;
    } else {

      var ad = new ActiveDirectory(config);
      ad.findUser(nik, function (err, user) {
        if (user === undefined || user === "undefined") {
          res.status(200).send({
            'givenName': '',
            'sn': '',
            'fullName': ''
          });
          return;
        } else {

          if (user.givenName == user.sn) {
            var nama_employee = user.givenName
          } else {
            if (user.sn === undefined) {
              var nama_employee = user.givenName
            } else {
              var nama_employee = user.givenName + ' ' + user.sn;
            }

          }

          res.status(200).send({
            'nama': nama_employee
          });
          return;
        }
      });
    }


  })
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

function fsGetDataBt(invoice_num, type, callback) {
  const url = constant.url_ws;

  let args = {
    invoice_num: invoice_num,
    type: type
  }
  soap.createClientAsync(url).then((client) => {

    client.fsGetDataBt(args, function (err, result, rawResponse, soapHeader, rawRequest) {

      let callback_data;

      if (result) {
        callback_data = result.responseBT;
      } else if (!result) {
        callback_data = {
          'BATCH_NAME': '',
          'ER_DATE': '',
          'INVOICE_TYPE_LOOKUP_CODEI': '',
          'INVOICE_NUM': '',
          'TRADING_PARTNER': '',
          'INVOICE_DATE': '',
          'INVOICE_AMOUNT': '',
          'DESCRIPTION': '',
          'ACCOUNTED': '',
          'APPROVAL': '',
          'STATUS': '',
          'PAYMENT_DATE': '',
          'SETUJUI': '',
          'VALIDASI': '',
          'TYPE': '',
          'USERSETUJUI': '',
          'PAY_GROUP_NAME': '',
          'BENEFICIARY': '',
          'ACCOUNT_NUMBER': '',
          'BRANCH': '',
          'ERROR': ''
        }
      } else if (err) {
        callback_data = {
          'BATCH_NAME': '',
          'ER_DATE': '',
          'INVOICE_TYPE_LOOKUP_CODEI': '',
          'INVOICE_NUM': '',
          'TRADING_PARTNER': '',
          'INVOICE_DATE': '',
          'INVOICE_AMOUNT': '',
          'DESCRIPTION': '',
          'ACCOUNTED': '',
          'APPROVAL': '',
          'STATUS': '',
          'PAYMENT_DATE': '',
          'SETUJUI': '',
          'VALIDASI': '',
          'TYPE': '',
          'USERSETUJUI': '',
          'PAY_GROUP_NAME': '',
          'BENEFICIARY': '',
          'ACCOUNT_NUMBER': '',
          'BRANCH': '',
          'ERROR': result.body
        }
      } else if (typeof result.statusCode !== 'undefined') {
        callback_data = {
          'BATCH_NAME': '',
          'ER_DATE': '',
          'INVOICE_TYPE_LOOKUP_CODEI': '',
          'INVOICE_NUM': '',
          'TRADING_PARTNER': '',
          'INVOICE_DATE': '',
          'INVOICE_AMOUNT': '',
          'DESCRIPTION': '',
          'ACCOUNTED': '',
          'APPROVAL': '',
          'STATUS': '',
          'PAYMENT_DATE': '',
          'SETUJUI': '',
          'VALIDASI': '',
          'TYPE': '',
          'USERSETUJUI': '',
          'PAY_GROUP_NAME': '',
          'BENEFICIARY': '',
          'ACCOUNT_NUMBER': '',
          'BRANCH': '',
          'ERROR': result.body
        }
      }
      callback(callback_data)
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

      client.fsGetDataOrafin_New(args, function (err, result, rawResponse, soapHeader, rawRequest) {

        let callback_data;

        if (result) {

          callback_data = result.responsePrEr.respone[0];
        } else if (!result) {

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
            'PR_STATUS': '',
            'PO_STATUS': '',
            'ERROR': '',
            'PO_NUMBER': '',
            'totalBranch': '',
            'totalPaid': '',
            'BRANCHNAME': ''
          }
        } else if (err) {
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
            'PR_STATUS': '',
            'PO_STATUS': '',
            'ERROR': err,
            'PO_NUMBER': '',
            'totalBranch': '',
            'totalPaid': '',
            'BRANCHNAME': ''
          }
        } else if (typeof result.error !== 'undefined') {

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
            'PR_STATUS': '',
            'PO_STATUS': '',
            'ERROR': result.error.ERROR,
            'PO_NUMBER': '',
            'totalBranch': '',
            'totalPaid': '',
            'BRANCHNAME': ''
          }
        }

        callback(callback_data)
      })
    })
    .catch(err => {
      callback({
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
        'PR_STATUS': '',
        'PO_STATUS': '',
        'ERROR': err,
        'totalBranch': '',
        'totalPaid': '',
        'BRANCHNAME': ''
      });

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
          'TAC': '',
          'ACTIVE': '',
          'DESCRIPTION': '',
          'BENEFECIARY': '',
          'PAY_GROUP': '',
          'BANK_NAME': '',
          'ACCOUNT_NUMBER': '',
          'AMOUNT': '',
          'PR_DATE': '',
          'PR_APPROVED_DATE': '',
          'PO_DATE': '',
          'ER_DATE': '',
          'BRANCH_NAME': '',
          'ACCOUNTING_DATE': '',
          'PAYMENT_DATE': '',
          'SEARCH_NO': '',
          'NAME_OF_UPDATED': ''
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
          'TAC': '',
          'ACTIVE': '',
          'DESCRIPTION': '',
          'BENEFECIARY': '',
          'PAY_GROUP': '',
          'BANK_NAME': '',
          'ACCOUNT_NUMBER': '',
          'AMOUNT': '',
          'PR_DATE': '',
          'PR_APPROVED_DATE': '',
          'PO_DATE': '',
          'ER_DATE': '',
          'BRANCH_NAME': '',
          'ACCOUNTING_DATE': '',
          'PAYMENT_DATE': '',
          'SEARCH_NO': '',
          'NAME_OF_UPDATED': ''
        }
      }
      callback(callback_data)
    })
  })
}

function fsGetDataERMultibranch(param, callback) {
  const url = constant.url_ws;

  let args = {

    batch_name: param

  }
  soap.createClientAsync(url).then((client) => {

      client.fsGetDataERMultibranch_NEW(args, function (err, result, rawResponse, soapHeader, rawRequest) {

        let callback_data;


        if (result) {
          callback_data = result.responseErMulti;
        } else if (!result) {
          callback_data = {
            'ER_NUMBER': '',
            'BENEFICIARY': '',
            'ACCOUNT_NUMBER': '',
            'BANK_NAME': '',
            'WHT_TAX_CODE': '',
            'AMOUNT_PAID': '',
            'PAY_GROUP_NAME': '',
            'ERRORMB': '',
            'totalBranch': '',
            'totalPaid': '',
            'description': ''
          }
        } else if (err) {
          callback_data = {
            'ER_NUMBER': '',
            'BENEFICIARY': '',
            'ACCOUNT_NUMBER': '',
            'BANK_NAME': '',
            'WHT_TAX_CODE': '',
            'AMOUNT_PAID': '',
            'PAY_GROUP_NAME': '',
            'ERRORMB': err,
            'totalBranch': '',
            'totalPaid': '',
            'description': ''
          }
        } else if (typeof result.statusCode !== 'undefined') {
          callback_data = {
            'ER_NUMBER': '',
            'BENEFICIARY': '',
            'ACCOUNT_NUMBER': '',
            'BANK_NAME': '',
            'WHT_TAX_CODE': '',
            'AMOUNT_PAID': '',
            'PAY_GROUP_NAME': '',
            'ERRORMB': result.error.ERROR,
            'totalBranch': '',
            'totalPaid': '',
            'description': ''
          }
        }
        callback(callback_data)
      })
    })
    .catch(err => {
      callback_data = {
        'ER_NUMBER': '',
        'BENEFICIARY': '',
        'ACCOUNT_NUMBER': '',
        'BANK_NAME': '',
        'WHT_TAX_CODE': '',
        'AMOUNT_PAID': '',
        'PAY_GROUP_NAME': '',
        'ERRORMB': err,
        'totalBranch': '',
        'totalPaid': '',
        'description': ''
      }
    })
}

function fsGetDataERMultipaid(param, callback) {
  const url = constant.url_ws;

  let args = {

    batch_name: param

  }
  soap.createClientAsync(url).then((client) => {

      client.fsGetDataERMultipaid(args, function (err, result, rawResponse, soapHeader, rawRequest) {

        let callback_data;


        if (result) {
          callback_data = result.responseErMulti;
        } else if (!result) {
          callback_data = {
            'ER_NUMBER': '',
            'BENEFICIARY': '',
            'ACCOUNT_NUMBER': '',
            'BANK_NAME': '',
            'WHT_TAX_CODE': '',
            'AMOUNT_PAID': '',
            'PAY_GROUP_NAME': '',
            'ERRORMB': '',
            'totalBranch': '',
            'totalPaid': '',
            'description': ''
          }
        } else if (err) {
          callback_data = {
            'ER_NUMBER': '',
            'BENEFICIARY': '',
            'ACCOUNT_NUMBER': '',
            'BANK_NAME': '',
            'WHT_TAX_CODE': '',
            'AMOUNT_PAID': '',
            'PAY_GROUP_NAME': '',
            'ERRORMB': err,
            'totalBranch': '',
            'totalPaid': '',
            'description': ''
          }
        } else if (typeof result.statusCode !== 'undefined') {
          callback_data = {
            'ER_NUMBER': '',
            'BENEFICIARY': '',
            'ACCOUNT_NUMBER': '',
            'BANK_NAME': '',
            'WHT_TAX_CODE': '',
            'AMOUNT_PAID': '',
            'PAY_GROUP_NAME': '',
            'ERRORMB': result.error.ERROR,
            'totalBranch': '',
            'totalPaid': '',
            'description': ''
          }
        }
        callback(callback_data)
      })
    })
    .catch(err => {
      callback_data = {
        'ER_NUMBER': '',
        'BENEFICIARY': '',
        'ACCOUNT_NUMBER': '',
        'BANK_NAME': '',
        'WHT_TAX_CODE': '',
        'AMOUNT_PAID': '',
        'PAY_GROUP_NAME': '',
        'ERRORMB': err,
        'totalBranch': '',
        'totalPaid': '',
        'description': ''
      }
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
  txt_nopr, //PR_NUMBER
  txt_noer, //ER_NUMBER
  id_validator1, //VALIDATOR
  id_validator2, //VALIDATOR2
  id_checker, //CHECKER
  kode_cabang, //KODECABANG
  txt_dep, //DEPARTMENT
  txt_tipeerpr, //TIPE_ER
  txt_periode, //PERIODE
  txt_ti, //TANGGAL_INCOMING
  txt_tpc, //TANGGAL_PROSES_CHECKER
  txt_status, //STATUS
  txt_remarks, //REMARKS
  txt_tif, //TANGGAL_INCOMING_FINANCE
  TIPE_ER, //TYPE_ER_PR_NUMBER
  txt_appdate, //APPROVER_DATE
  txt_nameapp, //NAME_OF_APPROVERD
  txt_slapr, //SLA_PR
  txt_slapo, //SLA_PO  
  txt_slaerdate, //SLA_ER_DATE
  sla_kirim, //SLA_KIRIM
  sla_cabang, //SLA_CABANG
  acct, //ACCT
  txt_slafin, //SLA_FIN
  sla_hq, //SLA_HQ
  txt_inv, //INVOICE_NO
  txt_er_bt, //ER_BT
  txt_lampiran, //LAMPIRAN
  txt_tac, //TAC
  active, //ACTIVE
  txt_kegiatan, //DESCRIPTION
  txt_beneficiary, //BENEFECIARY
  txt_paygroup, //PAY_GROUP
  txt_bankname, //BANK_NAME
  txt_accnumber, //ACCOUNT_NUMBER
  txt_amount, //AMOUNT
  txt_prdate, //PR_DTE
  txt_appdate, //PR_APPROVED_DATE
  txt_podate, //PO_DATE
  txt_erdate, //ER_DATE
  txt_branchname, //BRANCH_NAME
  txt_accdate, //ACCOUNTING_DATE
  txt_paymentdate, //PAYMENT_DATE
  txt_noerpr, //SEARCH_NO
  txt_nameapp, //NAME_OF_UPDATED
  callback) {
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
      TIPE_ER: txt_tipeerpr,
      PERIODE: txt_periode,
      TANGGAL_INCOMING: txt_ti,
      TANGGAL_PROSES_CHECKER: txt_tpc,
      STATUS: txt_status,
      REMARKS: txt_remarks,
      TANGGAL_INCOMING_FINANCE: txt_tif,
      TYPE_PR_ER_NUMBER: TIPE_ER,
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
      ACTIVE: active,
      DESCRIPTION: txt_kegiatan,
      BENEFECIARY: txt_beneficiary,
      PAY_GROUP: txt_paygroup,
      BANK_NAME: txt_bankname,
      ACCOUNT_NUMBER: txt_accnumber,
      AMOUNT: txt_amount,
      PR_DATE: txt_prdate,
      PR_APPROVED_DATE: txt_appdate,
      PO_DATE: txt_podate,
      ER_DATE: txt_erdate,
      BRANCH_NAME: txt_branchname,
      ACCOUNTING_DATE: txt_accdate,
      PAYMENT_DATE: txt_paymentdate,
      SEARCH_NO: txt_noerpr,
      NAME_OF_UPDATED: txt_nameapp
    }
  }
  soap.createClientAsync(url).then((client) => {

    client.fsSaveDataPRSharepointHQ_NEW(args, function (err, result, rawResponse, soapHeader, rawRequest) {
      //console.log(rawRequest)
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
  txt_tipeerpr,
  txt_periode,
  txt_ti,
  txt_tpc,
  txt_status,
  txt_remarks,
  txt_tif,
  TIPE_ER,
  txt_appdate,
  txt_nameapp,
  txt_slapr,
  txt_slapo,
  txt_slaerdate,
  sla_kirim,
  sla_cabang,
  acct,
  txt_slafin,
  sla_hq,
  txt_inv,
  txt_er_bt,
  txt_lampiran,
  txt_tac,
  active,
  txt_kegiatan,
  txt_beneficiary,
  txt_paygroup,
  txt_bankname,
  txt_accnumber,
  txt_amount,
  txt_prdate,
  txt_appdate,
  txt_podate,
  txt_erdate,
  txt_branchname,
  txt_accdate,
  txt_paymentdate,
  txt_noerpr, // sbg parameter search_no
  txt_nameapp, // sbg name_of_updated
  callback) {
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

  // if (txt_nopr != '') {
  //   erpr_number = txt_nopr
  // } else {
  //   erpr_number = txt_noer
  // }

  let args = {

    ERPR_NUMBER: txt_noer,
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
    TAC: txt_tac,
    NAMEOFUPDATED: txt_nameapp

  }
  soap.createClientAsync(url).then((client) => {

    client.fsUpdateDataPRSharepointHQ_NEW(args, function (err, result, rawResponse, soapHeader, rawRequest) {
      console.log(rawRequest)
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
          callback({
            'nama_validator1': 'Data Tidak Ditemukan',
            'nama_validator2': 'Data Tidak Ditemukan',
          })

        } else {

          data = {
            'nama_validator1': result.responseLIstChecker[0].nama_validator1,
            'nama_validator2': result.responseLIstChecker[0].nama_validator2,
          }

        }
        callback(data)

      })
    })
    .catch(err => {
      callback({
        'nama_validator1': err,
        'nama_validator2': err,
      });
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

function checkNULL(value) {
  if (!value || value == '' || value == null || value === undefined) return ''
  else return value

}

function CheckIsNaN(param) {
  if (param == 'NaN' || param === NaN || isNaN(param)) {
    return '-'
  } else {
    return param
  }
}

module.exports = router;