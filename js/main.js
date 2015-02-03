$(
    function () {

        // Set #beta-code border radius (cross-browser styling) and select all its text
        $('#beta-code').css('border-radius', '8px').select();

        // Select contents of #hebrew
        $('#selectall').click(
            function () {
                SelectText('hebrew');
                return false;
            }
        );

        // Fade in about page
        $('#aboutlink').click(
            function () {
                $('#about').fadeToggle('slow');
                return false;
            }
        );

        // Run convert() on load
        $('#hebrew').html(convert($('#beta-code').val()));

        // Run convert() on textchange
        $('#beta-code').bind('textchange',
            function (event) {
                $('#hebrew').html(convert($(this).val()));
            }
        )

        // Convert Beta Code in #beta-code to Unicode in #hebrew
        function convert(text) {
            // Handle terminal kaf
            text = text.replace(/k(?=[f:][\s])|k(?=[f:]$)|k(?=[f:]$)|k(?=[\s-;])|k$/igm, '\u05DA');

            // Handle other terminal letters
            text = text.replace(/m(?=[\s-;])|m$/igm, '\u05DD');
            text = text.replace(/n(?=[\s-;])|n$/igm, '\u05DF');
            text = text.replace(/p(?=[\s-;])|p$/igm, '\u05E3');
            text = text.replace(/c(?=[\s-;])|c$/igm, '\u05E5');

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
            text = text.replace(/\./gm, '\u05BC');
            text = text.replace(/</gm, '\u05AB');
            text = text.replace(/,/gm, '\u05A3');
            text = text.replace(/\|/gm, '\u05BD');
            text = text.replace(/-/gm, '\u05BE');
            text = text.replace(/;/gm, '\u05C3');
            text = text.replace(/\n/g, '<br />');
            text = text.replace(/j/igm, '');
            text = text.replace(/v/igm, '');

            return text;
        }
        
        // From http://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
        function SelectText(element) {
            var doc = document
                , text = doc.getElementById(element)
                , range, selection
            ;    
            if (doc.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(text);
                range.select();
            } else if (window.getSelection) {
                selection = window.getSelection();        
                range = document.createRange();
                range.selectNodeContents(text);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }
);
