$(
    function () {
        $('textarea#hebrew').bind('textchange',
            function (event, previousText) {
                var textarea = $(this);
                var betacode = $('#betacode');
                var text = textarea.val();
                text = text.replace(/\u05D0/gm, ')');
                text = text.replace(/\u05D1/gm, 'B');
                text = text.replace(/\u05D2/gm, 'G');
                text = text.replace(/\u05D3/gm, 'D');
                text = text.replace(/\u05D4/gm, 'H');
                text = text.replace(/\u05D5/gm, 'W');
                text = text.replace(/\u05D6/gm, 'Z');
                text = text.replace(/\u05D7/gm, 'X');
                text = text.replace(/\u05D8/gm, '+');
                text = text.replace(/\u05D9/gm, 'Y');
                text = text.replace(/\u05DB/gm, 'K');
                text = text.replace(/\u05DC/gm, 'L');
                text = text.replace(/\u05DE/gm, 'M');
                text = text.replace(/\u05E0/gm, 'N');
                text = text.replace(/\u05E1/gm, 'S');
                text = text.replace(/\u05E2/gm, '(');
                text = text.replace(/\u05E4/gm, 'P');
                text = text.replace(/\u05E6/gm, 'C');
                text = text.replace(/\u05E7/gm, 'Q');
                text = text.replace(/\u05E8/gm, 'R');
                text = text.replace(/\u05E9/gm, '#');
                text = text.replace(/\u05E9\u05C1/gm, '&');
                text = text.replace(/\u05E9\u05C2/gm, '$');
                text = text.replace(/\u05C1/gm, '');
                text = text.replace(/\u05C2/gm, '');
                text = text.replace(/\u05EA/gm, 'T');
                text = text.replace(/\u05B2/gm, ':A');
                text = text.replace(/\u05B3/gm, ':F');
                text = text.replace(/\u05B1/gm, ':E');
                text = text.replace(/\u05B7/gm, 'A');
                text = text.replace(/\u05B8/gm, 'F');
                text = text.replace(/\u05B4/gm, 'I');
                text = text.replace(/\u05B6/gm, 'E');
                text = text.replace(/\u05B5/gm, '"');
                text = text.replace(/\u05B9/gm, 'O');
                text = text.replace(/\u05BB/gm, 'U');
                text = text.replace(/\u05B0/gm, ':');
                text = text.replace(/\u05BE/gm, '-');
                text = text.replace(/\u05BC/gm, '.');
                text = text.replace(/\u05BF/gm, ',');
                text = text.replace(/\u05C3/gm, ';');
                betacode.val(text);
            }
        );
    }
);
