

function eraseText1() {
$('#txt_noerpr').val('');
$('#txt_ernumber').val('');
$('#txt_beneficiary').val('');
$('#txt_accountnumber').val('');
$('#txt_bankname').val('');
$('#txt_taxcode').val('');
$('#txt_amountpaid').val('');
}

/* SHIFT = Open Disabled Form
document.addEventListener("keydown", keyDownTextField, false);

function keyDownTextField(e) {

 var keyCode = e.which || e.keyCode;
 if (keyCode == 16) {

  enableText();
  document.getElementById("aktif").checked = true;

 } else {

 }
}
*/

var map = {
 17: false,
 81: false
};
$(document).keydown(function(e) {
 if (e.keyCode in map) {
  map[e.keyCode] = true;
  if (map[17] && map[81]) {
   $('html, body').animate({
    scrollTop: 0
   }, 'fast');
   eraseText1();
   document.getElementById('txt_noerpr').focus();

  }
 }
}).keyup(function(e) {
 if (e.keyCode in map) {
  map[e.keyCode] = false;
 }
});

function search() {
 $("#loading").show(); // Tampilkan loadingnya

 $.ajax({
  type: "POST", // Method pengiriman data bisa dengan GET atau POST
   //url: "http://172.16.1.187/er-tracking/WebService/getWSMultiBranch",
  url: "http://172.16.1.187/er-tracking/WebService/getWSMultiBranch", // Isi dengan url/path file php yang dituju
  data: {
   txt_noerpr: $("#txt_noerpr").val().val()
  }, // data yang akan dikirim ke file proses
  dataType: "json",
  beforeSend: function(e) {
   if (e && e.overrideMimeType) {
    e.overrideMimeType("application/json;charset=UTF-8");
   }
   $("#error").fadeOut();
        $("#btn-search").html('<i class="fa fa-spinner fa-pulse fa-fw"></i> Searching').prop('disabled', true);
        
  },
  success: function(response) { // Ketika proses pengiriman berhasil


   if (response.status == "success") { // Jika isi dari array status adalah success
    //fungsi javascript bilangan dalam rupiah
    if (response.txt_amountpaid.length > 0) {
     var bilangan = response.txt_amountpaid;


     var number_string = bilangan.toString(),
      sisa = number_string.length % 3,
      rupiah = number_string.substr(0, sisa),
      ribuan = number_string.substr(sisa).match(/\d{3}/g);

     if (ribuan) {
      separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');

     }
    } else {
     var rupiah = "";
    }
    $('#txt_ernumber').val(response.txt_ernumber);
    $('#txt_beneficiary').val(response.txt_beneficiary);
    $('#txt_accountnumber').val(response.txt_accountnumber);
    $('#txt_bankname').val(response.txt_bankname);
    $('#txt_taxcode').val(response.txt_taxcode);
    $('#txt_amountpaid').val(rupiah);

    $("#btn-search").html('Search').prop('disabled', false);
    $('#data').html('Data ditemukan');
    $('#nodata').html('');
    } else if (response.status == "failed") {
      //alert(response);
    $('#txt_ernumber').val('');
    $('#txt_beneficiary').val('');
    $('#txt_accountnumber').val('');
    $('#txt_bankname').val('');
    $('#txt_taxcode').val('');
    $('#txt_amountpaid').val('');
    $("#btn-search").html('Search').prop('disabled', false);
    $('#data').html('');
    $('#nodata').html('Data tidak Ditemukan');
    }
  },
  error: function(xhr, ajaxOptions, thrownError) { // Ketika ada error
   alert(xhr.responseText);
  }
 });
}

//=========================================================//

$(document).ready(function() {
 $("#loading").hide(); // Sembunyikan loadingnya

 $("#btn-search").click(function() { // Ketika user mengklik tombol Cari
  search(); // Panggil function search
 });

 $("#txt_noerpr").keyup(function() {
 /*if($(this).val().length > 8) { */// Ketika user menekan tombol di keyboard
  if (event.keyCode == 13) { // Jika user menekan tombol ENTER
   search(); // Panggil function search
  }
/*}*/
 });


});



function CheckKey(e) //receives event object as parameter
{
 var code = e.keyCode ? e.keyCode : e.which;
 /*if($(this).val().length > 8) {*/
 if (code === 13) {
  
  search();

 }
/*}*/
}
$(document).ready(function(){
$("#txt_checker").chosen().change(function() {
    //alert($(this).val());
    var text = $(this).val();
    //$('#txt_validator1').val(txt);

     $.ajax({

        type:"POST",//or POST
        url:'http://172.16.1.187/er-tracking/Home/getChecker',
                           //  (or whatever your url is)
        data:{search:text},
        dataType : "json", 
        //can send multipledata like {data1:var1,data2:var2,data3:var3
        //can use dataType:'text/html' or 'json' if response type expected 
        success: function(result) {
        
        var json =  result;

        console.log(json);
        $('#txt_validator1').val(json.validator1);
        $('#txt_validator2').val(json.validator2);


    }
     })
});
});
  /*$( function() {
  
        $( "#txt_checker" ).autocomplete({
            source: function( request, response ) {
                
                $.ajax({
                    url: "http://172.16.1.187/er-tracking/Home/getChecker",
                    type: 'post',
                    dataType: "json",
                    data: {
                        search: request.term
                    },
                    success: function( data ) {
                        response( data );
                    }
                });
            },
            select: function (event, ui) {
                $('#txt_checker').val(ui.item.checker); // display the selected text
                $('#txt_validator1').val(ui.item.validator1); // save selected id to input
                $('#txt_validator2').val(ui.item.validator2); // save selected id to input
                return false;
            }
        });
    });*/
         
  
        //autocomplete
       
