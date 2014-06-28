$(
    function () {
        $('textarea').css('border-radius', '8px');
        $('#aboutlink').click(
            function () {
                $('#about').fadeToggle('slow');
            }
        );
        $('#keylink').click(
            function () {
                $('#key').fadeToggle('slow');
            }
        );
        $('#hebrew').html(convert($('#betacode').val()));
        $('#betacode').bind('textchange',
            function (event) {
                $('#hebrew').html(convert($(this).val()));
            }
        ).select();

        function convert(text) {
            text = text.replace(/\)/gm, '\u05D0');
            text = text.replace(/B/igm, '\u05D1');
            text = text.replace(/G/igm, '\u05D2');
            text = text.replace(/D/igm, '\u05D3');
            text = text.replace(/H/igm, '\u05D4');
            text = text.replace(/W/igm, '\u05D5');
            text = text.replace(/Z/igm, '\u05D6');
            text = text.replace(/X/igm, '\u05D7');
            text = text.replace(/\+/gm, '\u05D8');
            text = text.replace(/Y/igm, '\u05D9');
            text = text.replace(/K/igm, '\u05DB');
            text = text.replace(/L/igm, '\u05DC');
            text = text.replace(/M/igm, '\u05DE');
            text = text.replace(/N/igm, '\u05E0');
            text = text.replace(/S/igm, '\u05E1');
            text = text.replace(/\(/gm, '\u05E2');
            text = text.replace(/P/igm, '\u05E4');
            text = text.replace(/C/igm, '\u05E6');
            text = text.replace(/Q/igm, '\u05E7');
            text = text.replace(/R/igm, '\u05E8');
            text = text.replace(/#/gm, '\u05E9');
            text = text.replace(/&/gm, '\u05E9\u05C2');
            text = text.replace(/\$/gm, '\u05E9\u05C1');
            text = text.replace(/T/igm, '\u05EA');
            text = text.replace(/:A/igm, '\u05B2');
            text = text.replace(/:F/igm, '\u05B3');
            text = text.replace(/:E/igm, '\u05B1');
            text = text.replace(/A:/igm, '\u05B2');
            text = text.replace(/F:/igm, '\u05B3');
            text = text.replace(/E:/igm, '\u05B1');
            text = text.replace(/A/igm, '\u05B7');
            text = text.replace(/F/igm, '\u05B8');
            text = text.replace(/I/igm, '\u05B4');
            text = text.replace(/E/igm, '\u05B6');
            text = text.replace(/"/gm, '\u05B5');
            text = text.replace(/O/igm, '\u05B9');
            text = text.replace(/U/igm, '\u05BB');
            text = text.replace(/:/gm, '\u05B0');
            text = text.replace(/-/gm, '\u05BE');
            text = text.replace(/\./gm, '\u05BC');
            text = text.replace(/,/gm, '\u05BF');
            text = text.replace(/;/gm, '\u05C3');
            text = text.replace(/\n/g, '<br />');
            text = text.replace(/J/igm, '');
            text = text.replace(/V/igm, '');
            return text;
        }
    }
);
