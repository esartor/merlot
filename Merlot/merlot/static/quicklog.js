var dateFormat = "yy-mm-dd";
$(document).ready(function() {

    //lets create a basic structure for the tooltip in the loglinks
    var log_tooltip = $('<div class="tooltip log-row">'+
                            '<a class="delete"><img alt="delete" src="/@@/merlot/images/close.png"></a>'+
                            '<div class="ajax-load">'+
                                '<img alt="ajax-load" src="/@@/merlot/images/ajax-load.gif">'+
                            '</div>'+
                            '<div class="log-form-container"></div>'+
                        '</div>');
    $('.log-link').after(log_tooltip);
    
    //tooltip config
    $('.log-link').tooltip({
        effect: 'slide',
        tipClass:'log-row',
        position: ['center', 'left'],
        relative: true,
        events: {
            def:"click, "
        },
        onShow: function() {
		            var action = this.getTrigger().attr('href') + '/@@add-log-ajax';
		            var action_link = this.getTrigger();
		            var tip_layout = this.getTip();
                    $('.log-form-container', tip_layout).empty();
                    $.ajax({
                        url:action,
                        dataType:'html',
                        async: true,
                        data:{'ajax':true},
                        success: function(data) {
                            $('.log-row .ajax-load').css('display', 'none');
                            form = $(data);                           
                            logFormDataHanddler(form, tip_layout, action_link);                             
                        }
                    });
                },
        api: true                
    });
    //the close button inside the tooltip is going to work hide it
    $('.log-row .delete').click(function(){
            $(this).closest('tr').removeClass('selected');    
            $(this).parents('.actions').find('.log-link').tooltip().hide();
    });
    $('.log-link').click(function(e){
        $(this).closest('tr').addClass('selected');
        e.preventDefault(); 
    });       

    function logFormDataHanddler(form, log_row, log_link) {
        row = $('.log-form-container',log_row).append(form);
        form_obj = $('form', row);
        form_hours = $('#form\\.hours', log_row);
        form_remaing = $('#form\\.remaining', log_row);
        
        //focus in the first input
        $('input:first',log_row).focus();
        calculateRemaingHours(form_hours, form_remaing);

        //bind the calendar
        dateTranslator($("#form\\.date", log_row), $(".date-translated", log_row));       
        $("#form\\.date", log_row).datepicker({
            "dateFormat": dateFormat,
            "showOn": "button",
            "buttonImage": "/@@/merlot/images/calendar.gif",
            "buttonImageOnly": true,
            "constrainInput": false
        });
        //we bind the submit and we generate our own submit
        var button = $('.actionButtonsLog .button');
        button.click(function(e){
            var values = {};
            $.each(form_obj.serializeArray(), function (i, field) {
                values[field.name] = field.value;
            });
            values[button.attr('name')] = button.attr('value');
            var form_action = form_obj.attr('action');
            $.ajax({
                url: form_action,
                data: values,
                dataType:'json',
                success: function(data){
                    row.empty();                
                    row.append('<div class="success">'+
                                   '<h3><img alt="success" class="success" src="/@@/merlot/images/check.png">Success</h3>'+
                                   '<a class="more-logs" href="#">More?</a>'+
                                '</div>');
                    $('.success', row).hide().fadeIn('slow');
                    more_logs_link = $('.more-logs', row);
                    more_logs_link.focus();
                    more_logs_link.click(function(e){
                        $('.log-row .delete').trigger('click');
                        log_link.trigger('click');
                        return false;
                    });
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
            });

            e.preventDefault();
            return false;
        });
    }
    

    function dateTranslator(date_input, date_translated) {
        // code from http://www.datejs.com/ demos
        var messages = "no match";
        var input = date_input, date_string = date_translated, date = null;
        var input_empty = "Enter a date here", empty_string = "Type a date bellow";
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
});
