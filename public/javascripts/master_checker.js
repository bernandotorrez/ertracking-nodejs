


$('document').ready(function () {

  $('#nik').keyup(function() {
    var nik = $(this).val().trim()
    
    if(nik.length >= 10) {
      
      getName(nik)
      return false;
    }

  })

  function getName(nik) {
    var url = $('#url').val();
    $.ajax({

      type: "POST", //or POST
      //url:'http://172.16.1.187/er-tracking/Home/getChecker',
      url: url + 'soap/getNameAD',
      //  (or whatever your url is)
      data: {
        nik: nik
      },
      dataType: "json",
      //can send multipledata like {data1:var1,data2:var2,data3:var3
      //can use dataType:'text/html' or 'json' if response type expected 

      beforeSend: function () {
        $('#nama_checker').val('Loading...');
      },

      success: function (result) {

        var json = result;
        $('#nama_checker').val(json.givenName);
      }
    })

    return false;
  }

  jQuery.validator.addMethod("lettersonly", function (value, element) {
    return this.optional(element) || /^[a-z]+$/i.test(value);
  }, "Letters only please");

  $("#master-checker-form").validate({
    rules: {

      nama_checker: {
        required: true,
        lettersonly: true,
        maxlength: 25,
        minlength: 3
      }
    },
    //For custom messages
    messages: {

      nama_checker: {
        required: "Isi Nama Checker",
        minlength: "Minimal 3 Karakter",
        maxlength: "Maksimal 25 Karakter",
        lettersonly: "Masukkan Hanya Huruf"
      },
    },

    errorPlacement: function (error, element) {
      $(element).closest('.form-group').find('.help-block').html(error.html());

    },
    highlight: function (element) {
      $(element).closest('.form-group').removeClass('has-success').addClass('has-error');

    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).closest('.form-group').removeClass('has-error');
      $(element).closest('.form-group').find('.help-block').html('');

    },

  });

  /* daftar submit */
});

jQuery(function ($) {
  //initiate dataTables plugin
  var myTable =
    $('#master-checker-table')
    //.wrap("<div class='dataTables_borderWrap' />")   //if you are applying horizontal scrolling (sScrollX)
    .DataTable({
      bserverSide: true,

      bAutoWidth: false,
      "aoColumns": [{
          "bSortable": null
        },
        null, null, null, null, null,
        {
          "bSortable": false
        }
      ],
      "aaSorting": [],

      /* "bProcessing": true,
          "bServerSide": true,
          "sAjaxSource": "http://localhost:8080/ci-tracking/Home/getWSREPORT" ,*/


      "sScrollY": "280px",
      "bPaginate": true,

      // "sScrollX": "100%",
      // "sScrollXInner": "100%",
      // "bScrollCollapse": true,


      // "iDisplayLength": 10


      // select: {
      //   style: 'multi'
      // }
    });



  $.fn.dataTable.Buttons.defaults.dom.container.className = 'dt-buttons btn-overlap btn-group btn-overlap';

  new $.fn.dataTable.Buttons(myTable, {
    buttons: [
      {
      "extend": "colvis",
      "text": "<i class='fa fa-search bigger-110 blue'></i> <span class='hidden'>Show/hide columns</span>",
      "className": "btn btn-white btn-primary btn-bold",
      columns: ':not(:last)'
      },
      // {
      // "extend": "copy",
      // "text": "<i class='fa fa-copy bigger-110 pink'></i> <span class='hidden'>Copy to clipboard</span>",
      // "className": "btn btn-white btn-primary btn-bold"
      // },
      {
      "extend": "csv",
      "text": "<i class='fa fa-database bigger-110 orange'></i> <span class='hidden'>Export to CSV</span>",
      "className": "btn btn-white btn-primary btn-bold",
       exportOptions: {
       
          columns: ':not(:last)'
        
      }
      },
      {
      "extend": "excel",
      "text": "<i class='fa fa-file-excel-o bigger-110 green'></i> <span class='hidden'>Export to Excel</span>",
      "className": "btn btn-white btn-primary btn-bold",
      exportOptions: {
          columns: ':not(:last)',
        modifier: {
          search: 'applied',
          order: 'applied'
          
        }
      }
      },
      // {
      // "extend": "pdf",
      // "text": "<i class='fa fa-file-pdf-o bigger-110 red'></i> <span class='hidden'>Export to PDF</span>",
      // "className": "btn btn-white btn-primary btn-bold"
      // },
    //   {
    //   "extend": "print",
    //   "text": "<i class='fa fa-print bigger-110 grey'></i> <span class='hidden'>Print</span>",
    //   "className": "btn btn-white btn-primary btn-bold",
    //   autoPrint: false,
    //  /* message: 'This print was produced using the Print button for DataTables',
    //    columns: ':not(:first):not(:last)'*/
    //    exportOptions: {
    //           columns: ':not(:last)'
    //       }
          
    //   }     
    ]
  });
  myTable.buttons().container().appendTo($('.tableTools-container'));

  //style the message box
  var defaultCopyAction = myTable.button(1).action();
  myTable.button(1).action(function (e, dt, button, config) {
    defaultCopyAction(e, dt, button, config);
    $('.dt-button-info').addClass('gritter-item-wrapper gritter-info gritter-center white');
  });


  var defaultColvisAction = myTable.button(0).action();
  myTable.button(0).action(function (e, dt, button, config) {

    defaultColvisAction(e, dt, button, config);


    if ($('.dt-button-collection > .dropdown-menu').length == 0) {
      $('.dt-button-collection')
        .wrapInner('<ul class="dropdown-menu dropdown-light dropdown-caret dropdown-caret" />')
        .find('a').attr('href', '#').wrap("<li />")
    }
    $('.dt-button-collection').appendTo('.tableTools-container .dt-buttons')
  });

  ////

  setTimeout(function () {
    $($('.tableTools-container')).find('a.dt-button').each(function () {
      var div = $(this).find(' > div').first();
      if (div.length == 1) div.tooltip({
        container: 'body',
        title: div.parent().text()
      });
      else $(this).tooltip({
        container: 'body',
        title: $(this).text()
      });
    });
  }, 500);





  myTable.on('select', function (e, dt, type, index) {
    if (type === 'row') {
      $(myTable.row(index).node()).find('input:checkbox').prop('checked', true);
    }
  });
  myTable.on('deselect', function (e, dt, type, index) {
    if (type === 'row') {
      $(myTable.row(index).node()).find('input:checkbox').prop('checked', false);
    }
  });




  /////////////////////////////////
  //table checkboxes
  $('th input[type=checkbox], td input[type=checkbox]').prop('checked', false);

  //select/deselect all rows according to table header checkbox
  $('#dynamic-table > thead > tr > th input[type=checkbox], #dynamic-table_wrapper input[type=checkbox]').eq(0).on('click', function () {
    var th_checked = this.checked; //checkbox inside "TH" table header

    $('#dynamic-table').find('tbody > tr').each(function () {
      var row = this;
      if (th_checked) myTable.row(row).select();
      else myTable.row(row).deselect();
    });
  });

  //select/deselect a row when the checkbox is checked/unchecked
  $('#dynamic-table').on('click', 'td input[type=checkbox]', function () {
    var row = $(this).closest('tr').get(0);
    if (this.checked) myTable.row(row).deselect();
    else myTable.row(row).select();
  });



  $(document).on('click', '#dynamic-table .dropdown-toggle', function (e) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
  });



  //And for the first simple table, which doesn't have TableTools or dataTables
  //select/deselect all rows according to table header checkbox
  var active_class = 'active';
  $('#simple-table > thead > tr > th input[type=checkbox]').eq(0).on('click', function () {
    var th_checked = this.checked; //checkbox inside "TH" table header

    $(this).closest('table').find('tbody > tr').each(function () {
      var row = this;
      if (th_checked) $(row).addClass(active_class).find('input[type=checkbox]').eq(0).prop('checked', true);
      else $(row).removeClass(active_class).find('input[type=checkbox]').eq(0).prop('checked', false);
    });
  });

  //select/deselect a row when the checkbox is checked/unchecked
  $('#simple-table').on('click', 'td input[type=checkbox]', function () {
    var $row = $(this).closest('tr');
    if ($row.is('.detail-row ')) return;
    if (this.checked) $row.addClass(active_class);
    else $row.removeClass(active_class);
  });



  /********************************/
  //add tooltip for small view action buttons in dropdown menu
  $('[data-rel="tooltip"]').tooltip({
    placement: tooltip_placement
  });

  //tooltip placement on right or left
  function tooltip_placement(context, source) {
    var $source = $(source);
    var $parent = $source.closest('table')
    var off1 = $parent.offset();
    var w1 = $parent.width();

    var off2 = $source.offset();
    //var w2 = $source.width();

    if (parseInt(off2.left) < parseInt(off1.left) + parseInt(w1 / 2)) return 'right';
    return 'left';
  }




  /***************/
  $('.show-details-btn').on('click', function (e) {
    e.preventDefault();
    $(this).closest('tr').next().toggleClass('open');
    $(this).find(ace.vars['.icon']).toggleClass('fa-angle-double-down').toggleClass('fa-angle-double-up');
  });
  /***************/





  /**
  //add horizontal scrollbars to a simple table
  $('#simple-table').css({'width':'2000px', 'max-width': 'none'}).wrap('<div style="width: 1000px;" />').parent().ace_scroll(
    {
    horizontal: true,
    styleClass: 'scroll-top scroll-dark scroll-visible',//show the scrollbars on top(default is bottom)
    size: 2000,
    mouseWheelLock: true
    }
  ).css('padding-top', '12px');
  */


})

$("#kode_cabang").keydown(function (e) {
  // Allow: backspace, delete, tab, escape, enter and .
  if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
    // Allow: Ctrl+A, Command+A
    (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
    // Allow: home, end, left, right, down, up
    (e.keyCode >= 35 && e.keyCode <= 40)) {
    // let it happen, don't do anything
    return;
  }
  // Ensure that it is a number and stop the keypress
  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
    e.preventDefault();
  }
});

$("#checker").keydown(function (e) {
  // Allow: backspace, delete, tab, escape, enter and .
  if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
    // Allow: Ctrl+A, Command+A
    (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
    // Allow: home, end, left, right, down, up
    (e.keyCode >= 35 && e.keyCode <= 40)) {
    // let it happen, don't do anything
    return;
  }
  // Ensure that it is a number and stop the keypress
  if (!((e.keyCode == 8) || (e.keyCode == 32) || (e.keyCode == 46) || (e.keyCode >= 35 && e.keyCode <= 40) || (e.keyCode >= 65 && e.keyCode <= 90))) {

    e.preventDefault();

  }
});



$("#validator1").keydown(function (e) {
  // Allow: backspace, delete, tab, escape, enter and .
  if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
    // Allow: Ctrl+A, Command+A
    (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
    // Allow: home, end, left, right, down, up
    (e.keyCode >= 35 && e.keyCode <= 40)) {
    // let it happen, don't do anything
    return;
  }
  // Ensure that it is a number and stop the keypress
  if (!((e.keyCode == 8) || (e.keyCode == 32) || (e.keyCode == 46) || (e.keyCode >= 35 && e.keyCode <= 40) || (e.keyCode >= 65 && e.keyCode <= 90))) {

    e.preventDefault();

  }
});

$("#validator2").keydown(function (e) {
  // Allow: backspace, delete, tab, escape, enter and .
  if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
    // Allow: Ctrl+A, Command+A
    (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
    // Allow: home, end, left, right, down, up
    (e.keyCode >= 35 && e.keyCode <= 40)) {
    // let it happen, don't do anything
    return;
  }
  // Ensure that it is a number and stop the keypress
  if (!((e.keyCode == 8) || (e.keyCode == 32) || (e.keyCode == 46) || (e.keyCode >= 35 && e.keyCode <= 40) || (e.keyCode >= 65 && e.keyCode <= 90))) {

    e.preventDefault();

  }
});