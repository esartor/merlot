var dateFormat = "yy-mm-dd";
$(document).ready(function() {
    $('.log-link').click(function(){
        log_link = $(this);
        action = $(this).attr('href') + '/@@add-log-ajax';
        log_row = $('<tr class="log-row">'+
                       '<td colspan="'+$('#listing-table th').length+'">'+
                       '<a class="delete"><img alt="delete" src="/@@/merlot/images/close.png"></a>'+
                         '<div class="ajax-load">'+
                           '<img alt="ajax-load" src="/@@/merlot/images/ajax-load.gif">'+
                         '</div>'+
                       '</td>'+
                     '</tr>');
        tr_parent = $(this).closest('tr');
        tr_parent.addClass('selected');
        tr_parent.after(log_row);
        $('.ajax-load', log_row).css('display', 'block');
        $('.delete', log_row).click(function(){
            $(this).closest('.log-row').fadeOut('fast', function() {
                $(this).remove();
            });
        });

        $.ajax({
            url:action,
            dataType:'html',
            async: true,
            data:{'ajax':true},
            success: function(data) {
                $('.log-row .ajax-load').css('display', 'none');
                form = $(data);
                logFormDataHanddler(form);
            }
        });
        function logFormDataHanddler(form) {
            row = $('td:first',log_row).append(form);
            row.hide().fadeTo('slow', 1);
            form_obj = $('form', row);
            form_hours = $('#form\\.hours', log_row);
            form_remaing = $('#form\\.remaining', log_row);
            //focus in the first input
            $('input:first',log_row).focus();
            calculateRemaingHours(form_hours, form_remaing);

            //bind the calendar
            dateTranslator(
                $("#form\\.date", log_row),
                $("#date-translated", log_row)
            );
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
                        row.html('<div>'+
                                    '<a class="more-logs" href="#">More?</a>'+
                                    '<div class="logged-data">'+
                                        '<img alt="success" class="success" src="/@@/merlot/images/check.png">'+
                                        '<span class="header">Hours: </span><span class="data">'+data.hours+'</span>'+
                                        '<span class="header">Remaining: </span><span class="data">'+data.remaining+'</span>'+
                                        '<span class="header">Date: </span><span class="data">'+data.date+'</span>'+
                                    '</div>'+
                                  '</div>');
                        row.hide().fadeIn('slow');
                        more_logs_link = $('.more-logs', row);
                        nex_task = $('.next-task', row);
                        more_logs_link.focus();
                        more_logs_link.click(function(e){
                            log_link.trigger('click');
                            more_logs_link.remove();
                            nex_task.remove();
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
        return false;
    });


    function dateTranslator(date_input, date_translated) {
        // code from http://www.datejs.com/ demos
        var messages = "no match";
        var input = date_input, date_string = date_translated, date = null;
        var input_empty = "Enter a date here", empty_string = "Type a date above";
        input.val(input_empty);
        date_string.text(empty_string);
        input.keyup(
            function (e) {
                date_string.removeClass();
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
