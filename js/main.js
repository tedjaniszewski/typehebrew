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
            // Handle terminal kaf
            text = text.replace(/k(?=[f:]\b)/igm, '\u05DA');
            
            // Handle other terminal letters
            text = text.replace(/k\b/igm, '\u05DA');
            text = text.replace(/m\b/igm, '\u05DD');
            text = text.replace(/n\b/igm, '\u05DF');
            text = text.replace(/p\b/igm, '\u05E3');
            text = text.replace(/c\b/igm, '\u05E5');
            
            // Handle other letters
            text = text.replace(/\)/gm, '\u05D0');
            text = text.replace(/b/igm, '\u05D1');
            text = text.replace(/g/igm, '\u05D2');
            text = text.replace(/d/igm, '\u05D3');
            text = text.replace(/h/igm, '\u05D4');
            text = text.replace(/w/igm, '\u05D5');
            text = text.replace(/z/igm, '\u05D6');
            text = text.replace(/x/igm, '\u05D7');
            text = text.replace(/\+/gm, '\u05D8');
            text = text.replace(/y/igm, '\u05D9');
            text = text.replace(/k/igm, '\u05DB');
            text = text.replace(/l/igm, '\u05DC');
            text = text.replace(/m/igm, '\u05DE');
            text = text.replace(/n/igm, '\u05E0');
            text = text.replace(/s/igm, '\u05E1');
            text = text.replace(/\(/gm, '\u05E2');
            text = text.replace(/p/igm, '\u05E4');
            text = text.replace(/c/igm, '\u05E6');
            text = text.replace(/q/igm, '\u05E7');
            text = text.replace(/r/igm, '\u05E8');
            text = text.replace(/#/gm, '\u05E9');
            text = text.replace(/&/gm, '\u05E9\u05C2');
            text = text.replace(/\$/gm, '\u05E9\u05C1');
            text = text.replace(/t/igm, '\u05EA');
            text = text.replace(/:a/igm, '\u05B2');
            text = text.replace(/:f/igm, '\u05B3');
            text = text.replace(/:e/igm, '\u05B1');
            text = text.replace(/a:/igm, '\u05B2');
            text = text.replace(/f:/igm, '\u05B3');
            text = text.replace(/e:/igm, '\u05B1');
            text = text.replace(/a/igm, '\u05B7');
            text = text.replace(/f/igm, '\u05B8');
            text = text.replace(/i/igm, '\u05B4');
            text = text.replace(/e/igm, '\u05B6');
            text = text.replace(/"/gm, '\u05B5');
            text = text.replace(/o/igm, '\u05B9');
            text = text.replace(/u/igm, '\u05BB');
            text = text.replace(/:/gm, '\u05B0');
            text = text.replace(/-/gm, '\u05BE');
            text = text.replace(/\./gm, '\u05BC');
            text = text.replace(/,/gm, '\u05BF');
            text = text.replace(/;/gm, '\u05C3');
            text = text.replace(/\n/g, '<br />');
            text = text.replace(/j/igm, '');
            text = text.replace(/v/igm, '');

            // Handle final forms.
            
            
            return text;
        }
    }
);
