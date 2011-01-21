var dateFormat = "yy-mm-dd";

$(document).ready(function() {

    // focus in login page
    $('#login').focus();
    
    
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
