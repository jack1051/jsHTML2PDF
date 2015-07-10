/*
    jsHtmlToPDF.JQuery.js
    Version 1.0.2 (7/9/2015)
    
    Created by Luis Valle
    
    
    JQuery plugin/wrapper to communicate with my COORS webService
    and generate HTML to PDF. My webService uses the excellent wkhtmltopdf
    tool to convert the HTML to PDF so all credit goes to those guys...
            
    Visit www.evicore.net/jsHtmlToPDF.html for demos and setup details

*/

(function() {
    this.jsHtmlToPDF = function(options) {
        this.settings = null;
        this.dEvicore = null;
        this.dEvicore = $.Deferred();           
        
        settingsX = $.extend({
            arrHTML: [],
            pageStyle: '',
            myURLl: 'https://www.evicore.net/webservices/evicoreservice.asmx/ConvertHTMLtoPDFJS',
            myCustomParams: '',
            fileName: '',
            thisSessionID: ''
        }, options );
        
        this.settings = settingsX;
    }
    
    jsHtmlToPDF.prototype.convert = function() {
        var _settings = this.settings;
        var _dEvicore = this.dEvicore;
        this.settings = null;
        this.dEvicore = null;
        
        _settings.waitDivElmnt = $("<div id=\"dvPDFTelWait\" style=\"position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; background-color: black; " +
            "display: none;\"><form id=\"dvEvCrClone\"></form><div id=\"dvUplStats\" style=\"position: absolute; top: 100px; left: 50%; margin-left: -150px; " +
            "border: thick solid #0066CC; background-color: #99CCFF; padding: 10px 3px 10px 3px; width: 300px; height: 50px;\"><div style=\"text-align: center;\">" +
            "<span id=\"lblCont_Head\" runat=\"server\" Text=\"Label\" Font-Bold=\"True\" Font-Names=\"Arial\"><\/span><\/div><div style=\"background-color: " +
            "#FFDFBF; width: 100%; height: 20px; -moz-border-radius: 10px; -webkit-border-radius: 10px; border-radius: 10px;\"><div id=\"dvProg\" " +
            "style=\"background-color: Red; width: 0%; height: 100%; -moz-border-radius: 10px; -webkit-border-radius: 10px; border-radius: 10px;\">" +
            "<\/div><\/div><\/div><\/div>");
        
        var someRandomNum = ((Math.random() * 1e6) | 0);
        _settings.thisSessionID = 'WebSession_' + someRandomNum;
        _settings.fileName = ($.trim(_settings.fileName) != '' ? (_settings.fileName.split('.')[_settings.fileName.split('.').length -1].toLowerCase() == 'pdf' ? _settings.fileName : _settings.fileName + '.pdf') : 'pdf_' + someRandomNum + '.pdf');
        
        $(_settings.waitDivElmnt).insertAfter($(document.body).children().last());
        
        if ($.type(_settings.html) == 'string') {
            $('#dvEvCrClone').append('<div>' + _settings.html + '</div>');
        } else {
            $(_settings.html).clone().appendTo($('#dvEvCrClone'));
            var $tElm = $(_settings.html);
            
            var origTextAreas = $($tElm).find('textarea');
            var newTextAreas = $('#dvEvCrClone').children(":first").find('textarea');
                    
            for (var i=0; i < newTextAreas.length; i++) {
                var orgVallll = $(origTextAreas[i]).val();
                $(newTextAreas[i]).val('');
                $(newTextAreas[i]).append(orgVallll);
                //$(newTextAreas[i]).append($(origTextAreas[i]).val());
            }        
            
            var origSelects = $($tElm).find('select');
            var newSelects = $('#dvEvCrClone').children(":first").find('select');
                    
            for (var i=0; i < newSelects.length; i++) {
                var selVal = $('option:selected', origSelects[i]).val();
                $(newSelects[i]).find('option').each(function () {
                    var xSelVal = $(this).val();
                    if (selVal == xSelVal) {
                        $(this).attr('selected', 'selected');
                    }
                });
            }        
            
            $('#dvEvCrClone input:text').each(function () {
                $(this).attr('value', $(this).val());
            });
            $("#dvEvCrClone :checked").each(function () {
                $(this).attr('checked', 'checked');
            });
            
            /* Try to set img src's to absolute paths so wkhtmltopdf can render them correctly */
            if ($.trim(window.window.location.hostname) != '') {
                var tmpThisProtocol = $(location).attr('protocol');
                var tmpThisHostName = $(location).attr('hostname');
                $('#dvEvCrClone img').each(function () {
                    if (!$(this).attr('src').match('http') && !$(this).attr('src').match('://')) {
                        $(this).attr('src', tmpThisProtocol + '//' + tmpThisHostName + '/' + $(this).attr('src'));
                    }                    
                });
            }
            $tElm = null;
        }        
        
        var $tHml = (_settings.pageStyle + $('#dvEvCrClone').children().first().html()).replace(/\</g, '⌐').replace(/\>/g, '¬');
        $('#dvEvCrClone').remove();        
        _settings.html = null;
        origTextAreas = null;
        newTextAreas = null;
        origSelects = null;
        newSelects = null;        
        
        var maxCharacters = 150;
        if ($tHml.length > maxCharacters) {
            // Here we will break our HTML into small parts (at 150 characters each)
            for (var i = 0; i < $tHml.length; i += maxCharacters) {
                var htmlPortion = $tHml.substring(i, Math.min(i + maxCharacters, $tHml.length - 1));
                _settings.arrHTML.push(htmlPortion);
            }
        } else {
            _settings.arrHTML.push($tHml);
        }
        $tHml = '';
        
        $('#lblCont_Head').html('0%');
        $('#dvProg').css({ 'width': '0%' });
        $('#dvPDFTelWait').css({ 'opacity': '0', 'display': '' });
        
        $('#dvPDFTelWait').animate({
            opacity: '0.85'
        }, 'fast', function () {
            evicoreNextIteration(0);
        });
        
        function evicoreNextIteration(indx) {            
            if (indx <= (_settings.arrHTML.length - 1)) {
                var parms = {
                    'entryType': '0',
                    'sessionID': _settings.thisSessionID,
                    'inHTML': encodeURIComponent(_settings.arrHTML[indx]),
                    'properties': encodeURIComponent(_settings.myCustomParams),
                    'FileNamex': _settings.fileName
                }
                
                var finPercent = (indx + 1) / (_settings.arrHTML.length) * 100;
                $('#lblCont_Head').html(parseInt(finPercent) + '%');
                $("#dvProg").css({ 'width': finPercent + "%" });
                
                setTimeout(function () {
                    evicoreAJAXcall('ConvertHTMLtoPDFJS', parms)
                    .then(function (response) {
                        if (response.error == '1') {
                            alert(response.errorCode);
                            _dEvicore.resolve(true);
                        } else {
                            evicoreNextIteration(++indx);
                        }
                    });
                }, 6);
            } else {
                $('body').append("<form method='POST' action='" + _settings.myURLl + "' style='top:-3333333333px;'" +
                    " id='tempForm'><input type='hidden' name='entryType' value='1' /><input" +
                    " type='hidden' name='sessionID' value='" + _settings.thisSessionID + "' /><input" +
                    " type='hidden' name='inHTML' value='none' /><input type='hidden'" +
                    " name='properties' value='" + encodeURIComponent(_settings.myCustomParams) + "' /><input" +
                    " type='hidden' name='FileNamex' value='" + _settings.fileName + "' /><input" +
                    " type='submit' value='Submit' style='opacity:0;' class='HiddenBtn' /></form>");
                $('#tempForm').submit().remove();
                
                $('#lblCont_Head').html('100%');
                $("#dvProg").css({ 'width': "100%" });
                $("#dvPDFTelWait").fadeOut("slow", function () {
                    $("#dvPDFTelWait").css('display', 'none');
                    while (_settings.arrHTML.length > 0) {
                        _settings.arrHTML.pop();
                    }
                    $('#dvPDFTelWait').remove();
                    $(_settings.waitDivElmnt).remove();
                    _settings = null;
                    
                    _dEvicore.resolve(true);
                });
            }
        };
        
        return _dEvicore.promise();
    }

    function evicoreAJAXcall(aFunction, spParams) {
        if (!jQuery.support.cors) {
            jQuery.support.cors = true;
        }
        
        var d = $.Deferred();
        
        $.ajax({
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            url: "https://www.evicore.net/webservices/evicoreservice.asmx/" + aFunction,
            data: $.stringify(spParams),
            type: "POST",
            dataType: "json"
        })
        .done(function (response) {
            d.resolve((response.hasOwnProperty('d') ? $.parseJSON(response.d) : response));
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            if ($.trim(errorThrown) == '') {
                /* If this webpage exists in the same Domain as the webService it will throw a weird blank error, so we ignore it */
                d.resolve({ 'error': '0' });
            } else {
                errorThrown = 'Ajax communication failed!\n\n(Error Thrown: "' + errorThrown + '")';
                d.resolve({ 'error': '1', 'errorCode': errorThrown });
            }
        });
        
        return d.promise();
    }
}());

/* Support for Stringifying JSON objects for older versions of IE. Credit goes to http://blogs.sitepointstatic.com/examples/tech/json-serialization/json-serialization.js */
(function() {
    jQuery.extend({
        stringify  : function stringify(obj) {
            var t = typeof (obj);
            if (t != "object" || obj === null) {
                // simple data type
                if (t == "string") obj = '"' + obj + '"';
                return String(obj);
            } else {
                // recurse array or object
                var n, v, json = [], arr = (obj && obj.constructor == Array);
     
                for (n in obj) {
                    v = obj[n];
                    t = typeof(v);
                    if (obj.hasOwnProperty(n)) {
                        if (t == "string") v = '"' + v + '"'; else if (t == "object" && v !== null) v = jQuery.stringify(v);
                        json.push((arr ? "" : '"' + n + '":') + String(v));
                    }
                }
                return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
            }
        }
    });
}());
