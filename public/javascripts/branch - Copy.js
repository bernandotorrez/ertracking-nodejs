function Simbol(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode

    if ((charCode >= 0 && charCode < 32) || (charCode > 47 && charCode < 58) || (charCode > 64 && charCode < 91) ||
        (charCode > 96 && charCode < 123) || (charCode > 44 && charCode < 48) ||
        (charCode > 38 && charCode < 42) || (charCode == 37 || charCode == 32 || charCode == 61 || charCode == 44 || charCode == 58)) {
        return true;
    } else {
        return false;
    }

}

function Refresh() {

    document.location = 'page_ws_branch';

}

function enable_text(status) {
    status = !status;


    document.dialog_edit_profile.txt_dep.disabled = status;
    document.dialog_edit_profile.txt_validator1.disabled = status;
    document.dialog_edit_profile.txt_validator2.disabled = status;
    document.dialog_edit_profile.txt_checker.disabled = status;
    document.dialog_edit_profile.txt_periode.disabled = status;
    document.dialog_edit_profile.txt_ti.disabled = status;
    document.dialog_edit_profile.txt_tpc.disabled = status;
    document.dialog_edit_profile.txt_status.disabled = status;
    document.dialog_edit_profile.txt_remarks.disabled = status;
    document.dialog_edit_profile.txt_tif.disabled = status;
    //document.dialog_edit_profile.txt_appdate.disabled = status; 
    document.dialog_edit_profile.txt_tipeerpr.disabled = status;
}


$('#aktif').change(function () {
    if ($('#aktif option:selected').val() == 'aktifkan') {
        document.getElementById("txt_checker").disabled = false;
        document.getElementById("txt_tipeer").disabled = false;
        document.getElementById("txt_validator1").disabled = false;
        document.getElementById("txt_validator2").disabled = false;
        document.getElementById("txt_periode").disabled = false;
        document.getElementById("txt_ti").disabled = false;
        document.getElementById("txt_tpc").disabled = false;
        document.getElementById("txt_tif").disabled = false;
        document.getElementById("txt_status").disabled = false;
        document.getElementById("txt_remarks").disabled = false;

        document.getElementById("txt_tipeerpr").disabled = false;
        document.getElementById("txt_dep").disabled = false;
    } else {
        document.getElementById("txt_checker").disabled = true;
        document.getElementById("txt_tipeer").disabled = true;
        document.getElementById("txt_validator1").disabled = true;
        document.getElementById("txt_validator2").disabled = true;
        document.getElementById("txt_periode").disabled = true;
        document.getElementById("txt_ti").disabled = true;
        document.getElementById("txt_tpc").disabled = true;
        document.getElementById("txt_tif").disabled = true;
        document.getElementById("txt_status").disabled = true;
        document.getElementById("txt_remarks").disabled = true;

        document.getElementById("txt_tipeerpr").disabled = true;
        document.getElementById("txt_dep").disabled = true;
    }
});

$('#btn_save').click(function () {
    // ER Single
  var txt_checker = $('#txt_checker').val();
  var txt_validator1 = $('#txt_validator1').val();
  var txt_validator2 = $('#txt_validator2').val();
  var txt_tipeer = $('#txt_tipeer').val();
  var txt_periode = $('#txt_periode').val();
  var txt_ti = $('#txt_ti').val();
  var txt_tpc = $('#txt_tpc').val();
  var txt_tif = $('#txt_tif').val();
  var txt_status = $('#txt_status').val();
  var txt_dep = $('#txt_dep').val();
  var txt_tipeerpr = $('#txt_tipeerpr').val();
  var tipe_er = $('#tipe_er').val();
  var txt_tac = $('#txt_tac').val();
  var txt_er_bt = $('#txt_er_bt').val();
  var txt_lampiran = $('#txt_lampiran').val();
  // ER Single

  // ER MultiBranch
  var txt_tipeerprmb = $('#txt_tipeerprmb').val();
  var txt_checkermb = $('#txt_checkermb').val();
  var txt_validator1mb = $('#txt_validator1mb').val();
  var txt_validator2mb = $('#txt_validator2mb').val();
  var txt_periodemb = $('#txt_periodemb').val();
  var txt_timb = $('#txt_timb').val();
  var txt_tpcmb = $('#txt_tpcmb').val();
  var txt_tifmb = $('#txt_tifmb').val();
  var txt_statusmb = $('#txt_statusmb').val();
  var txt_depmb = $('#txt_depmb').val();
  var txt_tacmb = $('#txt_tacmb').val();
  // ER MultiBranch
    //var error = $('#error').html();
  
    if (tipe_er == 'ER') {


      if (txt_tipeer == "") {
        $('#pesan').css('color', '#F44336').html('Pilih Tipe');
        $('#txt_tipeer').focus();
        //$('#nodata').html('Isi Tipe ER');
        //alert('tes');
      } else if (txt_checker == "Tidak Ditemukan" || txt_checker == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Checker');
        $('#txt_checker').focus();
  
  
      } else if (txt_validator1 == "Tidak Ditemukan" || txt_validator1 == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Validator 1');
        $('#txt_validator1').focus(); 
  
      } else if (txt_validator2 == "Tidak Ditemukan" || txt_validator2 == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Validator 2');
        $('#txt_validator2').focus();
  
      } else if (txt_tipeerpr == "") {
        $('#pesan').css('color', '#F44336').html('Pilih Tipe ER');
        $('#txt_tipeerpr').focus();
  
      } else if (txt_tac == '' || txt_tac == '-') {
        $('#pesan').css('color', '#F44336').html('Pilih TAC');
        $('#txt_tac').focus();
  
      } else if (txt_periode == "") {
        $('#pesan').css('color', '#F44336').html('Isi Periode');
        $('#txt_periode').focus();
  
      } else if (txt_ti == "") {
        $('#pesan').css('color', '#F44336').html('Isi Tanggal Incoming');
        $('#txt_ti').focus();
  
      } else if (txt_tpc == "") {
        $('#pesan').css('color', '#F44336').html('Isi Tanggal Proses Checker');
        $('#txt_tpc').focus();
  
      } else if (txt_tif == "") {
        $('#pesan').css('color', '#F44336').html('Isi Tanggal Incoming Finance');
        $('#txt_tif').focus();
  
      } else if (txt_status == "") {
        $('#pesan').css('color', '#F44336').html('Pilih Status');
        $('#txt_status').focus();
  
      } else if (txt_dep == "" || txt_dep=='Something went wrong') {
        $('#pesan').css('color', '#F44336').html('Pilih Departemen');
        $('#txt_dep').focus();
  
      } else {
        $('#pesan').css('color', '#4CAF50').html('Validasi OK, Ready to Save');
        save_branch();
      }
  
      return false;
  
    } else if (tipe_er == 'BTACT') {
  
  
      if (txt_tipeer == "") {
        $('#pesan').css('color', '#F44336').html('Pilih Tipe');
        $('#txt_tipeer').focus();
        //$('#nodata').html('Isi Tipe ER');
        //alert('tes');
      } else if (txt_checker == "Tidak Ditemukan" || txt_checker == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Checker');
        $('#txt_checker').focus();
  
  
      } else if (txt_validator1 == "Tidak Ditemukan" || txt_validator1 == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Validator 1');
        $('#txt_validator1').focus();
  
      } else if (txt_validator2 == "Tidak Ditemukan" || txt_validator2 == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Validator 2');
        $('#txt_validator2').focus();
  
      } else if (txt_tipeerpr == "") {
        $('#pesan').css('color', '#F44336').html('Pilih Tipe ER');
        $('#txt_tipeerpr').focus();
  
      } else if (txt_periode == "") {
        $('#pesan').css('color', '#F44336').html('Isi Periode');
        $('#txt_periode').focus();
  
      } else if (txt_ti == "") {
        $('#pesan').css('color', '#F44336').html('Isi Tanggal Incoming');
        $('#txt_ti').focus();
  
      } else if (txt_tpc == "") {
        $('#pesan').css('color', '#F44336').html('Isi Tanggal Proses Checker');
        $('#txt_tpc').focus();
  
      } else if (txt_tif == "") {
        $('#pesan').css('color', '#F44336').html('Isi Tanggal Incoming Finance');
        $('#txt_tif').focus();
  
      } else if (txt_status == "") {
        $('#pesan').css('color', '#F44336').html('Pilih Status');
        $('#txt_status').focus();
  
      } else if (txt_dep == "" || txt_dep=='Something went wrong') {
        $('#pesan').css('color', '#F44336').html('Pilih Departemen');
        $('#txt_dep').focus();
  
      } else if (txt_er_bt == "" || txt_er_bt == "-") {
        $('#pesan').css('color', '#F44336').html('Pilih ER / BT');
        $('#txt_er_bt').focus();
  
      } else if (txt_lampiran == "" || txt_lampiran == "-") {
        $('#pesan').css('color', '#F44336').html('Pilih Lampiran');
        $('#txt_lampiran').focus();
  
      } else {
        $('#pesan').css('color', '#4CAF50').html('Validasi OK, Ready to Save');
        save_branch();
      }
  
      return false;
  
    } else if (tipe_er == 'BTADV') {
  
  
      if (txt_tipeer == "") {
        $('#pesan').css('color', '#F44336').html('Pilih Tipe');
        $('#txt_tipeer').focus();
        //$('#nodata').html('Isi Tipe ER');
        //alert('tes');
      } else if (txt_checker == "Tidak Ditemukan" || txt_checker == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Checker');
        $('#txt_checker').focus();
  
  
      } else if (txt_validator1 == "Tidak Ditemukan" || txt_validator1 == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Validator 1');
        $('#txt_validator1').focus();
  
      } else if (txt_validator2 == "Tidak Ditemukan" || txt_validator2 == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Validator 2');
        $('#txt_validator2').focus();
  
      } else if (txt_tipeerpr == "") {
        $('#pesan').css('color', '#F44336').html('Pilih Tipe ER');
        $('#txt_tipeerpr').focus();
  
      } else if (txt_periode == "") {
        $('#pesan').css('color', '#F44336').html('Isi Periode');
        $('#txt_periode').focus();
  
      } else if (txt_ti == "") {
        $('#pesan').css('color', '#F44336').html('Isi Tanggal Incoming');
        $('#txt_ti').focus();
  
      } else if (txt_tpc == "") {
        $('#pesan').css('color', '#F44336').html('Isi Tanggal Proses Checker');
        $('#txt_tpc').focus();
  
      } else if (txt_tif == "") {
        $('#pesan').css('color', '#F44336').html('Isi Tanggal Incoming Finance');
        $('#txt_tif').focus();
  
      } else if (txt_status == "") {
        $('#pesan').css('color', '#F44336').html('Pilih Status');
        $('#txt_status').focus();
  
      } else if (txt_dep == "" || txt_dep=='Something went wrong') {
        $('#pesan').css('color', '#F44336').html('Pilih Departemen');
        $('#txt_dep').focus();  
  
      } else {
        $('#pesan').css('color', '#4CAF50').html('Validasi OK, Ready to Save');
        save_branch();
      }
  
      return false;
  
    } else if (tipe_er == 'MB') {
      if (txt_checkermb == "Tidak Ditemukan" || txt_checkermb == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Checker');
        $('#txt_checkermb').focus();
  
  
      } else if (txt_validator1mb == "Tidak Ditemukan" || txt_validator1mb == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Validator 1');
        $('#txt_validator1mb').focus();
  
      } else if (txt_validator2mb == "Tidak Ditemukan" || txt_validator2mb == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Validator 2');
        $('#txt_validator2mb').focus();
  
      } else if (txt_tipeerprmb == "") {
        $('#pesanmb').css('color', '#F44336').html('Pilih Tipe ER');
        $('#txt_tipeerprmb').focus();
  
      } else if (txt_tacmb == '-') {
        $('#pesan').css('color', '#F44336').html('Pilih TAC');
        $('#txt_tacmb').focus();
  
      } else if (txt_periodemb == "") {
        $('#pesanmb').css('color', '#F44336').html('Isi Periode');
        $('#txt_periodemb').focus();
  
      } else if (txt_timb == "") {
        $('#pesanmb').css('color', '#F44336').html('Isi Tanggal Incoming');
        $('#txt_timb').focus();
  
      } else if (txt_tpcmb == "") {
        $('#pesanmb').css('color', '#F44336').html('Isi Tanggal Proses Checker');
        $('#txt_tpcmb').focus();
  
      } else if (txt_tifmb == "") {
        $('#pesanmb').css('color', '#F44336').html('Isi Tanggal Incoming Finance');
        $('#txt_tifmb').focus();
  
      } else if (txt_statusmb == "") {
        $('#pesanmb').css('color', '#F44336').html('Pilih Status');
        $('#txt_statusmb').focus();
  
      } else if (txt_depmb == "" || txt_depmb=='Something went wrong') {
        $('#pesanmb').css('color', '#F44336').html('Pilih Departemen');
        $('#txt_depmb').focus();
  
      } else {
        $('#pesanmb').css('color', '#4CAF50').html('Validasi OK, Ready to Save');
        save_branch();
      }
  
      return false;
    } else if (tipe_er == 'MP') {
      if (txt_checkermb == "Tidak Ditemukan" || txt_checkermb == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Checker');
        $('#txt_checkermb').focus();
  
  
      } else if (txt_validator1mb == "Tidak Ditemukan" || txt_validator1mb == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Validator 1');
        $('#txt_validator1mb').focus();
  
      } else if (txt_validator2mb == "Tidak Ditemukan" || txt_validator2mb == '') {
        $('#pesan').css('color', '#F44336').html('Pilih Validator 2');
        $('#txt_validator2mb').focus();
  
      } else if (txt_tipeerprmb == "") {
        $('#pesanmb').css('color', '#F44336').html('Pilih Tipe ER');
        $('#txt_tipeerprmb').focus();
  
      } else if (txt_periodemb == "") {
        $('#pesanmb').css('color', '#F44336').html('Isi Periode');
        $('#txt_periodemb').focus();
  
      } else if (txt_timb == "") {
        $('#pesanmb').css('color', '#F44336').html('Isi Tanggal Incoming');
        $('#txt_timb').focus();
  
      } else if (txt_tpcmb == "") {
        $('#pesanmb').css('color', '#F44336').html('Isi Tanggal Proses Checker');
        $('#txt_tpcmb').focus();
  
      } else if (txt_tifmb == "") {
        $('#pesanmb').css('color', '#F44336').html('Isi Tanggal Incoming Finance');
        $('#txt_tifmb').focus();
  
      } else if (txt_statusmb == "") {
        $('#pesanmb').css('color', '#F44336').html('Pilih Status');
        $('#txt_statusmb').focus();
  
      } else if (txt_depmb == "" || txt_depmb=='Something went wrong') {
        $('#pesanmb').css('color', '#F44336').html('Pilih Departemen');
        $('#txt_depmb').focus();
  
      } else {
        $('#pesanmb').css('color', '#4CAF50').html('Validasi OK, Ready to Save');
        save_branch();
      }
  
      return false;
    }
  
  });
  

function save_branch() {


    var formData = $('#dialog_edit_profile').serialize();
    var url = $('#full_url').val();
    // console.log(formData);
    // alert(formData);

    swal({
        title: 'Are you sure?',
        text: 'Are you sure want to save this data?',
        type: 'info',
        showCancelButton: true,
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
    }, function () {
        $.ajax({
            url: url + 'soap/save_hq',
            type: 'POST',
            data: formData,
            success: function (data) {
                if (data == "OK") {
                    swal({
                        title: 'Success',
                        text: '',
                        type: 'success',
                        showCancelButton: false,
                        closeOnConfirm: true,
                        showLoaderOnConfirm: false,
                    }, function () {
                        document.getElementById("nodata").innerHTML = "";
                        document.getElementById("data").innerHTML = "Input Data Berhasil";
                        document.getElementById('txt_noerpr').focus();
                        $('html, body').animate({
                            scrollTop: 0
                        }, 'fast').delay(2000);
                        location.reload();

                    });

                } else {
                    swal({
                        title: 'Error',
                        text: data,
                        type: 'error',
                        showCancelButton: false,
                        closeOnConfirm: false,
                        showLoaderOnConfirm: false,
                    });
                    document.getElementById("data").innerHTML = "";
                    document.getElementById("nodata").innerHTML = "Input Data Gagal";
                    document.getElementById('txt_noerpr').focus();
                    $('html, body').animate({
                        scrollTop: 0
                    }, 'fast');

                }
            }
        });
        setTimeout(function () {
            //swal('Data saved');
        }, 2000);
    });


}
$(function () {

    $('#btn_update').click(function () {

        var formData = $('#dialog_edit_profile').serialize();
        // console.log(formData);
        // alert(formData);

        swal({
            title: 'Are you sure?',
            text: 'Are you sure want to update this data?',
            type: 'info',
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true,
        }, function () {
            $.ajax({
                url: 'CRUD/BR_Update_All.php',
                type: 'POST',
                data: formData,
                success: function (data) {
                    if (data == "OK") {
                        swal({
                            title: 'Success',
                            text: '',
                            type: 'success',
                            showCancelButton: false,
                            closeOnConfirm: true,
                            showLoaderOnConfirm: false,
                        }, function () {


                            document.getElementById("nodata").innerHTML = "";
                            document.getElementById("data").innerHTML = "Update Data Berhasil";
                            document.getElementById('txt_noerpr').focus();
                            $('html, body').animate({
                                scrollTop: 0
                            }, 'fast');
                        });
                    } else {
                        swal({
                            title: 'Error',
                            text: data,
                            type: 'error',
                            showCancelButton: false,
                            closeOnConfirm: false,
                            showLoaderOnConfirm: false,
                        });
                        document.getElementById("data").innerHTML = "";
                        document.getElementById("nodata").innerHTML = "Update Data Gagal";
                        document.getElementById('txt_noerpr').focus();
                        $('html, body').animate({
                            scrollTop: 0
                        }, 'fast');

                    }
                }
            });
            setTimeout(function () {
                //swal('Data saved');
            }, 2000);
        });
    });
});
jQuery(function ($) {
    $('#id-disable-check').on('click', function () {
        var inp = $('#form-input-readonly').get(0);
        if (inp.hasAttribute('disabled')) {
            inp.setAttribute('readonly', 'true');
            inp.removeAttribute('disabled');
            inp.value = "This text field is readonly!";
        } else {
            inp.setAttribute('disabled', 'disabled');
            inp.removeAttribute('readonly');
            inp.value = "This text field is disabled!";
        }
    });


    if (!ace.vars['touch']) {
        $('.chosen-select').chosen({
            allow_single_deselect: true
        });
        //resize the chosen on window resize

        $(window)
            .off('resize.chosen')
            .on('resize.chosen', function () {
                $('.chosen-select').each(function () {
                    var $this = $(this);
                    $this.next().css({
                        'width': $this.parent().width()
                    });
                })
            }).trigger('resize.chosen');
        //resize chosen on sidebar collapse/expand
        $(document).on('settings.ace.chosen', function (e, event_name, event_val) {
            if (event_name != 'sidebar_collapsed') return;
            $('.chosen-select').each(function () {
                var $this = $(this);
                $this.next().css({
                    'width': $this.parent().width()
                });
            })
        });


        $('#chosen-multiple-style .btn').on('click', function (e) {
            var target = $(this).find('input[type=radio]');
            var which = parseInt(target.val());
            if (which == 2) $('#form-field-select-4').addClass('tag-input-style');
            else $('#form-field-select-4').removeClass('tag-input-style');
        });
    }


    $('[data-rel=tooltip]').tooltip({
        container: 'body'
    });
    $('[data-rel=popover]').popover({
        container: 'body'
    });

    autosize($('textarea[class*=autosize]'));

    $('#id-input-file-1 , #id-input-file-2').ace_file_input({
        no_file: 'No File ...',
        btn_choose: 'Choose',
        btn_change: 'Change',
        droppable: false,
        onchange: null,
        thumbnail: false //| true | large
        //whitelist:'gif|png|jpg|jpeg'
        //blacklist:'exe|php'
        //onchange:''
        //
    });

    $('#id-input-file-3').ace_file_input({
        style: 'well',
        btn_choose: 'Drop files here or click to choose',
        btn_change: null,
        no_icon: 'ace-icon fa fa-cloud-upload',
        droppable: true,
        thumbnail: 'small' //large | fit
           
            ,
        preview_error: function (filename, error_code) {
          
        }

    }).on('change', function () {
    });

    //dynamically change allowed formats by changing allowExt && allowMime function
    $('#id-file-format').removeAttr('checked').on('change', function () {
        var whitelist_ext, whitelist_mime;
        var btn_choose
        var no_icon
        if (this.checked) {
            btn_choose = "Drop images here or click to choose";
            no_icon = "ace-icon fa fa-picture-o";

            whitelist_ext = ["jpeg", "jpg", "png", "gif", "bmp"];
            whitelist_mime = ["image/jpg", "image/jpeg", "image/png", "image/gif", "image/bmp"];
        } else {
            btn_choose = "Drop files here or click to choose";
            no_icon = "ace-icon fa fa-cloud-upload";

            whitelist_ext = null; //all extensions are acceptable
            whitelist_mime = null; //all mimes are acceptable
        }
        var file_input = $('#id-input-file-3');
        file_input
            .ace_file_input('update_settings', {
                'btn_choose': btn_choose,
                'no_icon': no_icon,
                'allowExt': whitelist_ext,
                'allowMime': whitelist_mime
            })
        file_input.ace_file_input('reset_input');

        file_input
            .off('file.error.ace')
            .on('file.error.ace', function (e, info) {
              
            });


    });

    $('#spinner1').ace_spinner({
            value: 0,
            min: 0,
            max: 200,
            step: 10,
            btn_up_class: 'btn-info',
            btn_down_class: 'btn-info'
        })
        .closest('.ace-spinner')
        .on('changed.fu.spinbox', function () {
            //console.log($('#spinner1').val())
        });
    $('#spinner2').ace_spinner({
        value: 0,
        min: 0,
        max: 10000,
        step: 100,
        touch_spinner: true,
        icon_up: 'ace-icon fa fa-caret-up bigger-110',
        icon_down: 'ace-icon fa fa-caret-down bigger-110'
    });
    $('#spinner3').ace_spinner({
        value: 0,
        min: -100,
        max: 100,
        step: 10,
        on_sides: true,
        icon_up: 'ace-icon fa fa-plus bigger-110',
        icon_down: 'ace-icon fa fa-minus bigger-110',
        btn_up_class: 'btn-success',
        btn_down_class: 'btn-danger'
    });
    $('#spinner4').ace_spinner({
        value: 0,
        min: -100,
        max: 100,
        step: 10,
        on_sides: true,
        icon_up: 'ace-icon fa fa-plus',
        icon_down: 'ace-icon fa fa-minus',
        btn_up_class: 'btn-purple',
        btn_down_class: 'btn-purple'
    });

    //datepicker plugin
    //link
    $('.date-picker').datepicker({
            autoclose: true,
            todayHighlight: true
        })
        //show datepicker when clicking on the icon
        .next().on(ace.click_event, function () {
            $(this).prev().focus();
        });

   
    var tag_input = $('#form-field-tags');
    try {
        tag_input.tag({
            placeholder: tag_input.attr('placeholder'),
            //enable typeahead by specifying the source array
            source: ace.vars['US_STATES'], //defined in ace.js >> ace.enable_search_ahead
            /**
            //or fetch data from database, fetch those that match "query"
            source: function(query, process) {
              $.ajax({url: 'remote_source.php?q='+encodeURIComponent(query)})
              .done(function(result_items){
              process(result_items);
              });
            }
            */
        })

        //programmatically add/remove a tag
        var $tag_obj = $('#form-field-tags').data('tag');
        $tag_obj.add('Programmatically Added');

        var index = $tag_obj.inValues('some tag');
        $tag_obj.remove(index);
    } catch (e) {
        //display a textarea for old IE, because it doesn't support this plugin or another one I tried!
        tag_input.after('<textarea id="' + tag_input.attr('id') + '" name="' + tag_input.attr('name') + '" rows="3">' + tag_input.val() + '</textarea>').remove();
        //autosize($('#form-field-tags'));
    }


    /////////
    $('#modal-form input[type=file]').ace_file_input({
        style: 'well',
        btn_choose: 'Drop files here or click to choose',
        btn_change: null,
        no_icon: 'ace-icon fa fa-cloud-upload',
        droppable: true,
        thumbnail: 'large'
    })

    //chosen plugin inside a modal will have a zero width because the select element is originally hidden
    //and its width cannot be determined.
    //so we set the width after modal is show
    $('#modal-form').on('shown.bs.modal', function () {
        if (!ace.vars['touch']) {
            $(this).find('.chosen-container').each(function () {
                $(this).find('a:first-child').css('width', '210px');
                $(this).find('.chosen-drop').css('width', '210px');
                $(this).find('.chosen-search input').css('width', '200px');
            });
        }
    })

});