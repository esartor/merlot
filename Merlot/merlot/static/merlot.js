var dateFormat = "yy-mm-dd";

$(document).ready(function() {

    // focus in login page
    $('#login').focus();


    function dateTranslatorSetup(input) {
        input.before('<span class="date-translated">'+merlot.i18n.TYPE_DATE_BELLOW_I18N+'</span>');
    };    
    
    $("#form\\.date").datepicker({"dateFormat": dateFormat});

    //PROJECT SELECTION
    var only_ranged_star_end = $("#form\\.start_date, #form\\.end_date");
    var preset_ranges_from_to = $("#form\\.from_date, #form\\.to_date");
    if (preset_ranges_from_to.length){
        //we have to create the little calendar icon on the right
        preset_ranges_from_to.each(function(){
            icon = '<img class="calendar-icon ui-datepicker-trigger" src="/@@/merlot/images/calendar.gif"/>';
            $(this).after(icon);
        });
        preset_ranges_from_to.daterangepicker({
            presetRanges: [
                {text: merlot.i18n.TODAY_I18N, dateStart: 'today', dateEnd: 'today' },
                {text: merlot.i18n.LAST_7_DAYS_I18N, dateStart: 'today-7days', dateEnd: 'today' },
                {text: merlot.i18n.MONTH_TO_DATE_I18N, dateStart: function(){ return Date.parse('today').moveToFirstDayOfMonth(); }, dateEnd: 'today' },
                {text: merlot.i18n.PREVIOUS_MONTH_I18N, dateStart: function(){ return Date.parse('1 month ago').moveToFirstDayOfMonth(); }, dateEnd:function(){ return Date.parse('1 month ago').moveToLastDayOfMonth(); } } 
            ],
            presets: {dateRange: merlot.i18n.DATE_RANGE_I18N}, 
            dateFormat: dateFormat
        });

        //we copy the events from the daterangpicker to the calendar icon launcher
        preset_ranges_from_to.each(function(){
            calendar_launcher = $(this).next('.calendar-icon');
            $(this).copyEventsTo(calendar_launcher);
            $(this).unbind();
        });
        preset_ranges_from_to.each(function(){  
            dateTranslatorSetup($(this));
            var date_translated = $(this).siblings('.date-translated');
            dateTranslator($(this), date_translated);          
        });            
    }
    if (only_ranged_star_end.length) {
        //we have to create the little calendar icon on the right
        only_ranged_star_end.each(function(){
            icon = '<img class="calendar-icon ui-datepicker-trigger" src="/@@/merlot/images/calendar.gif"/>';
            $(this).after(icon);
        });
        only_ranged_star_end.daterangepicker({
            presetRanges:[],
            presets: {specificDate:merlot.i18n.SPECIFIC_DATE_I18N, dateRange: merlot.i18n.DATE_RANGE_I18N}, 
            dateFormat: dateFormat
        });

        //we copy the events from the daterangpicker to the calendar icon launcher
        only_ranged_star_end.each(function(){
            calendar_launcher = $(this).next('.calendar-icon');
            $(this).copyEventsTo(calendar_launcher);
            $(this).unbind();
        });  
        only_ranged_star_end.each(function(){  
            dateTranslatorSetup($(this));
            var date_translated = $(this).siblings('.date-translated');
            dateTranslator($(this), date_translated);          
        });               
    }


    //projects container
    $('#project-container .filters select').change(function() {
        $('.ajax-load').css('display', 'block');
        $.ajax({
          url: 'project_container_listing_template',
          data:({status : this.value}),
          success: function(data) {
            $('.results').html(data);
            $('.ajax-load').css('display', 'none');
          }
        });
    });
    listingFilter(context='#project-container',
                  listing_table_id='#listing-table',
                  values_to_filter='.searchable',
                  selectable=true);

    //project container
    listingFilter(context='#project',
                  listing_table_id='#listing-table',
                  values_to_filter='.searchable',
                  selectable=true,
                  trigger_event='click');


    //clients container
    listingFilter(context='#clients-container',
                  listing_table_id='#listing-table',
                  values_to_filter='.searchable',
                  selectable=true);


    //Users container
    listingFilter(context='#users-container',
                  listing_table_id='#listing-table',
                  values_to_filter='.searchable');

    //dashboard
    listingFilter(context='#dashboard',
                  listing_table_id='#listing-table',
                  values_to_filter='.searchable',
                  selectable=true,
                  trigger_event='click');




    //LOG VIEW
    work_hours = $('#form\\.hours');
    remaing_hours = $('#form\\.remaining');
    calculateRemaingHours(work_hours, remaing_hours);


    manageFlashMessages();

    //collapsable content
    $(".colapsable").collapse({
                group:'table',
                head:'h2',
                show: function() {
                    this.animate({opacity: 'toggle', height: 'toggle'}, 200);
                },
                hide : function() {
                    this.animate({opacity: 'toggle', height: 'toggle'}, 200);
                }
            });

    //tooltips
    $('.actions .action').each(function(){
        var title = $(this).attr('title');
        $(this).removeAttr('title');
        $(this).attr('my-attr', title);
    });
    $('.actions .action').tipsy({gravity: $.fn.tipsy.autoNS, title: 'my-attr'});            

});

function listingFilter(context, listing_table_id, values_to_filter, selectable, trigger_event){
    if ($(context).length !== 0){
        var selectable = selectable | false;
        $("#filter-search").focus();
        $("#filter-search").keyup(function() {
            var table = $(listing_table_id);
            var values = [];
            $(values_to_filter, listing_table_id).each(function(i){
                values[i] = $(this).html();
            });
            $.uiTableFilter( table, this.value, values );
            if (selectable) {
                if (this.value === ''){
                    table.find("tbody > tr:visible").removeClass('selected');
                }
                else {
                    table.find("tbody > tr:visible").removeClass('selected');
                    var tr = table.find("tbody > tr:visible")[0];
                    $(tr).addClass('selected');
                }
            }
        });

        $('#filter-form').submit(function(){
            var table = $(listing_table_id);
            if (selectable) {
                var tr = table.find("tbody > tr:visible")[0];
                if(tr !== undefined){
                    $(tr).addClass('selected');
                    link_to_go = table.find("tbody > tr:visible .linkeable")[0];
                    if(trigger_event){
                        $(link_to_go).trigger(trigger_event);
                    }
                    else {
                        document.location = $(link_to_go).attr('href');
                    }
                }
            }
            return false;
        }).focus();
    }
}

function calculateRemaingHours(work_hours, remaing_hours) {
    if (work_hours && remaing_hours) {
        var remaing_value = remaing_hours.val();
        work_hours.blur(function(e) {
            total = 0;
            if (work_hours.val().length > 0) {
                if (remaing_value) {
                    total = remaing_value - work_hours.val();
                    if (total < 0) {
                        total = 0;
                    }
                }
                else {
                    total = '';
                }
            }
            remaing_hours.attr('value', total);
        });
    }
}

function manageFlashMessages() {
    $('#flash-messages > ul').each(function() {
        var count = 0;
        var messages_container = $(this)

        messages_container.find('li').each(function() {
            var close_message = $("<span>&nbsp;</span>")
                .attr('title','Close message')
                .addClass('close_message ui-icon ui-icon-close')
                .click(function() {
                    count--;
                    if (count > 0) {
                        $(this).parent().slideUp("slow");
                    }
                    else {
                        messages_container.slideUp("slow");
                    }
                });
            $(this).append(close_message);
            count++;
        });

    });
}
function dateTranslator(date_input, date_translated) {
    // code from http://www.datejs.com/ demos
    var messages = "no match";
    var input = date_input, date_string = date_translated, date = null;
    var input_empty = (date_input.val() == '') ? merlot.i18n.ENTER_DATE_HERE_I18N : date_input.val(), empty_string = merlot.i18n.TYPE_DATE_BELLOW_I18N;
    input.val(input_empty);
    date_string.text(empty_string);
    input.keyup(
        function (e) {
            date_string.removeClass();
            date_string.addClass('date-translated');
            if (input.val().length > 0) {
                date = Date.parse(input.val());
                if (date !== null) {
                    input.removeClass();
                    date_string.addClass("accept").text(date.toString("dddd, MMM dd, yyyy"));
                } else {
                    input.addClass("validate_error");
                    date_string.addClass("error").text(messages+"...");
                }
            } else {
                date_string.text(empty_string).addClass("empty");
            }
        }
    );
    input.focus(
        function (e) {
            if (input.val() === input_empty) {
                input.val("");
            }
        }
    );
    input.blur(
        function (e) {
            if (input.val() !== "") {
                input.attr('value', date.toString("yyyy-MM-dd"));
            }
            if (input.val() === "") {
                input.val(input_empty).removeClass();
            }
        }
    );    
}
