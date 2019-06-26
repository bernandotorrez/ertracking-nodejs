
function Simbol(evt) {
  var charCode = (evt.which) ? evt.which : event.keyCode
  
    if ((charCode >= 0 && charCode < 32) || (charCode > 47 && charCode < 58) || (charCode > 64 && charCode < 91) 
      || (charCode > 96 && charCode < 123) || (charCode > 44 && charCode < 48)
      || (charCode > 38 && charCode < 42) || (charCode == 37 || charCode == 32 || charCode == 61 || charCode == 44 || charCode == 58)){
          return true;
    }else{
           return false;
    }
  
} 

 jQuery(function($) {
  $('#id-disable-check').on('click', function() {
    var inp = $('#form-input-readonly').get(0);
    if(inp.hasAttribute('disabled')) {
      inp.setAttribute('readonly' , 'true');
      inp.removeAttribute('disabled');
      inp.value="This text field is readonly!";
    }
    else {
      inp.setAttribute('disabled' , 'disabled');
      inp.removeAttribute('readonly');
      inp.value="This text field is disabled!";
    }
  });


  if(!ace.vars['touch']) {
    $('.chosen-select').chosen({allow_single_deselect:true}); 
    //resize the chosen on window resize

    $(window)
    .off('resize.chosen')
    .on('resize.chosen', function() {
      $('.chosen-select').each(function() {
         var $this = $(this);
         $this.next().css({'width': $this.parent().width()});
      })
    }).trigger('resize.chosen');
    //resize chosen on sidebar collapse/expand
    $(document).on('settings.ace.chosen', function(e, event_name, event_val) {
      if(event_name != 'sidebar_collapsed') return;
      $('.chosen-select').each(function() {
         var $this = $(this);
         $this.next().css({'width': $this.parent().width()});
      })
    });


    $('#chosen-multiple-style .btn').on('click', function(e){
      var target = $(this).find('input[type=radio]');
      var which = parseInt(target.val());
      if(which == 2) $('#form-field-select-4').addClass('tag-input-style');
       else $('#form-field-select-4').removeClass('tag-input-style');
    });
  }


  $('[data-rel=tooltip]').tooltip({container:'body'});
  $('[data-rel=popover]').popover({container:'body'});

  autosize($('textarea[class*=autosize]'));
  
  $('#id-input-file-1 , #id-input-file-2').ace_file_input({
    no_file:'No File ...',
    btn_choose:'Choose',
    btn_change:'Change',
    droppable:false,
    onchange:null,
    thumbnail:false //| true | large
    //whitelist:'gif|png|jpg|jpeg'
    //blacklist:'exe|php'
    //onchange:''
    //
  });
  //pre-show a file name, for example a previously selected file
  //$('#id-input-file-1').ace_file_input('show_file_list', ['myfile.txt'])


  $('#id-input-file-3').ace_file_input({
    style: 'well',
    btn_choose: 'Drop files here or click to choose',
    btn_change: null,
    no_icon: 'ace-icon fa fa-cloud-upload',
    droppable: true,
    thumbnail: 'small'//large | fit
   
    ,
    preview_error : function(filename, error_code) {
      
    }

  }).on('change', function(){
    //console.log($(this).data('ace_input_files'));
    //console.log($(this).data('ace_input_method'));
  });
  
  
  
  //dynamically change allowed formats by changing allowExt && allowMime function
  $('#id-file-format').removeAttr('checked').on('change', function() {
    var whitelist_ext, whitelist_mime;
    var btn_choose
    var no_icon
    if(this.checked) {
      btn_choose = "Drop images here or click to choose";
      no_icon = "ace-icon fa fa-picture-o";

      whitelist_ext = ["jpeg", "jpg", "png", "gif" , "bmp"];
      whitelist_mime = ["image/jpg", "image/jpeg", "image/png", "image/gif", "image/bmp"];
    }
    else {
      btn_choose = "Drop files here or click to choose";
      no_icon = "ace-icon fa fa-cloud-upload";
      
      whitelist_ext = null;//all extensions are acceptable
      whitelist_mime = null;//all mimes are acceptable
    }
    var file_input = $('#id-input-file-3');
    file_input
    .ace_file_input('update_settings',
    {
      'btn_choose': btn_choose,
      'no_icon': no_icon,
      'allowExt': whitelist_ext,
      'allowMime': whitelist_mime
    })
    file_input.ace_file_input('reset_input');
    
    file_input
    .off('file.error.ace')
    .on('file.error.ace', function(e, info) {
    
    });
 
  });

  $('#spinner1').ace_spinner({value:0,min:0,max:200,step:10, btn_up_class:'btn-info' , btn_down_class:'btn-info'})
  .closest('.ace-spinner')
  .on('changed.fu.spinbox', function(){
    //console.log($('#spinner1').val())
  }); 
  $('#spinner2').ace_spinner({value:0,min:0,max:10000,step:100, touch_spinner: true, icon_up:'ace-icon fa fa-caret-up bigger-110', icon_down:'ace-icon fa fa-caret-down bigger-110'});
  $('#spinner3').ace_spinner({value:0,min:-100,max:100,step:10, on_sides: true, icon_up:'ace-icon fa fa-plus bigger-110', icon_down:'ace-icon fa fa-minus bigger-110', btn_up_class:'btn-success' , btn_down_class:'btn-danger'});
  $('#spinner4').ace_spinner({value:0,min:-100,max:100,step:10, on_sides: true, icon_up:'ace-icon fa fa-plus', icon_down:'ace-icon fa fa-minus', btn_up_class:'btn-purple' , btn_down_class:'btn-purple'});

  
  //datepicker plugin
  //link
  $('.date-picker').datepicker({
    autoclose: true,
    todayHighlight: true
  })
  //show datepicker when clicking on the icon
  .next().on(ace.click_event, function(){
    $(this).prev().focus();
  });


  
  
  var tag_input = $('#form-field-tags');
  try{
    tag_input.tag(
      {
      placeholder:tag_input.attr('placeholder'),
      //enable typeahead by specifying the source array
      source: ace.vars['US_STATES'],//defined in ace.js >> ace.enable_search_ahead
      /**
      //or fetch data from database, fetch those that match "query"
      source: function(query, process) {
        $.ajax({url: 'remote_source.php?q='+encodeURIComponent(query)})
        .done(function(result_items){
        process(result_items);
        });
      }
      */
      }
    )

    //programmatically add/remove a tag
    var $tag_obj = $('#form-field-tags').data('tag');
    $tag_obj.add('Programmatically Added');
    
    var index = $tag_obj.inValues('some tag');
    $tag_obj.remove(index);
  }
  catch(e) {
    //display a textarea for old IE, because it doesn't support this plugin or another one I tried!
    tag_input.after('<textarea id="'+tag_input.attr('id')+'" name="'+tag_input.attr('name')+'" rows="3">'+tag_input.val()+'</textarea>').remove();
    //autosize($('#form-field-tags'));
  }
  
  
  /////////
  $('#modal-form input[type=file]').ace_file_input({
    style:'well',
    btn_choose:'Drop files here or click to choose',
    btn_change:null,
    no_icon:'ace-icon fa fa-cloud-upload',
    droppable:true,
    thumbnail:'large'
  })
  
  //chosen plugin inside a modal will have a zero width because the select element is originally hidden
  //and its width cannot be determined.
  //so we set the width after modal is show
  $('#modal-form').on('shown.bs.modal', function () {
    if(!ace.vars['touch']) {
      $(this).find('.chosen-container').each(function(){
        $(this).find('a:first-child').css('width' , '210px');
        $(this).find('.chosen-drop').css('width' , '210px');
        $(this).find('.chosen-search input').css('width' , '200px');
      });
    }
  })
  
});


  $('document').ready(function()
{ 
  /*var tgl_awal = $('#tgl_awal').val();
  var tgl_akhir = $('#tgl_akhir').val();*/

   $("#report-form").validate({
        rules: {
           tgl_awal: {
                required: true,
                
                //maxlength: 10,
                //minlength: 10
            },
            tgl_akhir: {
                required: true,
                //maxlength: 10,
                //minlength: 10
            },
       
        },
        //For custom messages
        messages: {
            tgl_awal:{
                required: "Isi Tanggal Awal",
                //minlength: "Minimal 10 Karakter",
                 //maxlength: "Maksimal 10 Karakter"
            },
            tgl_akhir:{
              required: "Isi Tanggal Akhir",
                 //minlength: "Minimal 10 Karakter",
                 //maxlength: "Maksimal 10 Karakter"
            },
           
        },
       
      errorPlacement : function(error, element) {
        $(element).closest('.form-group').find('.help-block').html(error.html());

       },
       highlight : function(element) {
        $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
        
       },
       unhighlight: function(element, errorClass, validClass) {
        $(element).closest('.form-group').removeClass('has-error');
        $(element).closest('.form-group').find('.help-block').html('');
        
       },
     
     });
     
     /* daftar submit */
});

    jQuery(function($) {
        //initiate dataTables plugin
        var myTable = 
        $('#dynamic-table')
        //.wrap("<div class='dataTables_borderWrap' />")   //if you are applying horizontal scrolling (sScrollX)
        .DataTable( {
          bAutoWidth: true, 
          } );
      
        
        
        $.fn.dataTable.Buttons.defaults.dom.container.className = 'dt-buttons btn-overlap btn-group btn-overlap';
        
        new $.fn.dataTable.Buttons( myTable, {
          buttons: [
            {
            "extend": "colvis",
            "text": "<i class='fa fa-search bigger-110 blue'></i> <span class='hidden'>Show/hide columns</span>",
            "className": "btn btn-white btn-primary btn-bold",
            columns: ':not(:last)'
            },
            {
            "extend": "csv",
            "text": "<i class='fa fa-database bigger-110 orange'></i> <span class='hidden'>Export to CSV</span>",
            "className": "btn btn-white btn-primary btn-bold",
             
            },
            {
            "extend": "excel",
            "text": "<i class='fa fa-file-excel-o bigger-110 green'></i> <span class='hidden'>Export to Excel</span>",
            "className": "btn btn-white btn-primary btn-bold",
            
            },
            // {
            // "extend": "pdf",
            // "text": "<i class='fa fa-file-pdf-o bigger-110 red'></i> <span class='hidden'>Export to PDF</span>",
            // "className": "btn btn-white btn-primary btn-bold"
            // },    
          ]
        } );
        myTable.buttons().container().appendTo( $('.tableTools-container') );
        
        //style the message box
        var defaultCopyAction = myTable.button(1).action();
        myTable.button(1).action(function (e, dt, button, config) {
          defaultCopyAction(e, dt, button, config);
          $('.dt-button-info').addClass('gritter-item-wrapper gritter-info gritter-center white');
        });
        
        
        var defaultColvisAction = myTable.button(0).action();
        myTable.button(0).action(function (e, dt, button, config) {
          
          defaultColvisAction(e, dt, button, config);
          
          
          if($('.dt-button-collection > .dropdown-menu').length == 0) {
            $('.dt-button-collection')
            .wrapInner('<ul class="dropdown-menu dropdown-light dropdown-caret dropdown-caret" />')
            .find('a').attr('href', '#').wrap("<li />")
          }
          $('.dt-button-collection').appendTo('.tableTools-container .dt-buttons')
        });
      
        ////
      
        setTimeout(function() {
          $($('.tableTools-container')).find('a.dt-button').each(function() {
            var div = $(this).find(' > div').first();
            if(div.length == 1) div.tooltip({container: 'body', title: div.parent().text()});
            else $(this).tooltip({container: 'body', title: $(this).text()});
          });
        }, 500);
        
        
        
        
        
        myTable.on( 'select', function ( e, dt, type, index ) {
          if ( type === 'row' ) {
            $( myTable.row( index ).node() ).find('input:checkbox').prop('checked', true);
          }
        } );
        myTable.on( 'deselect', function ( e, dt, type, index ) {
          if ( type === 'row' ) {
            $( myTable.row( index ).node() ).find('input:checkbox').prop('checked', false);
          }
        } );
      
      
      
      
        /////////////////////////////////
        //table checkboxes
        $('th input[type=checkbox], td input[type=checkbox]').prop('checked', false);
        
        //select/deselect all rows according to table header checkbox
        $('#dynamic-table > thead > tr > th input[type=checkbox], #dynamic-table_wrapper input[type=checkbox]').eq(0).on('click', function(){
          var th_checked = this.checked;//checkbox inside "TH" table header
          
          $('#dynamic-table').find('tbody > tr').each(function(){
            var row = this;
            if(th_checked) myTable.row(row).select();
            else  myTable.row(row).deselect();
          });
        });
        
        //select/deselect a row when the checkbox is checked/unchecked
        $('#dynamic-table').on('click', 'td input[type=checkbox]' , function(){
          var row = $(this).closest('tr').get(0);
          if(this.checked) myTable.row(row).deselect();
          else myTable.row(row).select();
        });
      
      
      
        $(document).on('click', '#dynamic-table .dropdown-toggle', function(e) {
          e.stopImmediatePropagation();
          e.stopPropagation();
          e.preventDefault();
        });
        
        
        
        //And for the first simple table, which doesn't have TableTools or dataTables
        //select/deselect all rows according to table header checkbox
        var active_class = 'active';
        $('#simple-table > thead > tr > th input[type=checkbox]').eq(0).on('click', function(){
          var th_checked = this.checked;//checkbox inside "TH" table header
          
          $(this).closest('table').find('tbody > tr').each(function(){
            var row = this;
            if(th_checked) $(row).addClass(active_class).find('input[type=checkbox]').eq(0).prop('checked', true);
            else $(row).removeClass(active_class).find('input[type=checkbox]').eq(0).prop('checked', false);
          });
        });
        
        //select/deselect a row when the checkbox is checked/unchecked
        $('#simple-table').on('click', 'td input[type=checkbox]' , function(){
          var $row = $(this).closest('tr');
          if($row.is('.detail-row ')) return;
          if(this.checked) $row.addClass(active_class);
          else $row.removeClass(active_class);
        });
      
        
      
        /********************************/
        //add tooltip for small view action buttons in dropdown menu
        $('[data-rel="tooltip"]').tooltip({placement: tooltip_placement});
        
        //tooltip placement on right or left
        function tooltip_placement(context, source) {
          var $source = $(source);
          var $parent = $source.closest('table')
          var off1 = $parent.offset();
          var w1 = $parent.width();
      
          var off2 = $source.offset();
          //var w2 = $source.width();
      
          if( parseInt(off2.left) < parseInt(off1.left) + parseInt(w1 / 2) ) return 'right';
          return 'left';
        }
        
        
        
        
        /***************/
        $('.show-details-btn').on('click', function(e) {
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

  
      
      