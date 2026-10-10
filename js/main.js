(function () {
    'use strict';

    var TH = window.TypeHebrew,
        betaCode = document.getElementById('beta-code'),
        hebrew = document.getElementById('hebrew'),
        transliteration = document.getElementById('transliteration'),
        scheme = document.getElementById('scheme'),
        key = document.getElementById('key'),
        about = document.getElementById('about'),
        DOTTED_CIRCLE = '\u25CC',
        // Phones and tablets: don't pop up the on-screen keyboard unasked.
        touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    // Remember the chosen transliteration scheme between visits.
    function loadScheme() {
        try { return localStorage.getItem('typehebrew-scheme'); } catch (e) { return null; }
    }
    function saveScheme(value) {
        try { localStorage.setItem('typehebrew-scheme', value); } catch (e) { /* private mode */ }
    }

    // Convert the Beta Code in #beta-code into #hebrew and #transliteration
    function convert() {
        var tokens = TH.parse(betaCode.value);
        hebrew.textContent = TH.toHebrew(tokens);
        transliteration.textContent = TH.transliterate(tokens, scheme.value);
    }

    // Select the contents of an element, as if highlighted with the mouse
    function selectContents(element) {
        var range = document.createRange(),
            selection = window.getSelection();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function copyContents(element, button) {
        var text = element.textContent,
            label = button.textContent;

        function done(ok) {
            button.textContent = ok ? 'COPIED' : 'PRESS CTRL+C';
            setTimeout(function () { button.textContent = label; }, 1500);
        }

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function () { done(true); }, function () {
                selectContents(element);
                done(false);
            });
        } else {
            selectContents(element);
            try { done(document.execCommand('copy')); } catch (e) { done(false); }
        }
    }

    // Where the key inserts codes. Until the box has been used, that's the
    // end of the text rather than the start.
    var caret = null;
    function rememberCaret() {
        caret = { start: betaCode.selectionStart, end: betaCode.selectionEnd };
    }

    // Insert a code at the cursor in #beta-code (used by the key)
    function insertCode(code) {
        var at = caret || { start: betaCode.value.length, end: betaCode.value.length };
        betaCode.setRangeText(code, at.start, at.end, 'end');
        rememberCaret();
        convert();
        if (!touch) { betaCode.focus(); }
    }

    // ------------------------------------------------------------------
    // The key, built from the converter's own tables
    // ------------------------------------------------------------------

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) { node.className = className; }
        if (text !== undefined) { node.textContent = text; }
        return node;
    }

    function card(entry) {
        var button = el('button', 'card'),
            glyph = el('span', 'glyph', entry.glyph),
            codes = el('span', 'codes');

        button.type = 'button';
        button.setAttribute('data-code', entry.code);
        button.title = 'Insert ' + entry.code;
        glyph.lang = 'he';
        glyph.setAttribute('aria-hidden', 'true');

        codes.appendChild(el('kbd', '', entry.code));
        (entry.also || []).forEach(function (code) {
            codes.appendChild(document.createTextNode(' '));
            codes.appendChild(el('kbd', 'alt', code));
        });

        button.appendChild(glyph);
        button.appendChild(el('span', 'name', entry.name));
        button.appendChild(codes);
        return button;
    }

    function section(title, entries, options) {
        options = options || {};
        var wrapper = el(options.collapsible ? 'details' : 'section', 'key-section'),
            heading = el(options.collapsible ? 'summary' : 'h3', '', title),
            grid = el('div', 'cards');

        wrapper.appendChild(heading);
        if (options.note) { wrapper.appendChild(el('p', 'note', options.note)); }
        entries.forEach(function (entry) { grid.appendChild(card(entry)); });
        wrapper.appendChild(grid);
        return wrapper;
    }

    function mark(he) {
        return DOTTED_CIRCLE + he;
    }

    function buildKey() {
        var consonants = TH.CONSONANTS.map(function (c) {
            return {
                code: c.code,
                name: c.name,
                glyph: (c.dot ? c.he + c.dot : c.he) + (c.fin ? ' ' + c.fin : '')
            };
        });

        var vowels = TH.VOWELS.map(function (v) {
            return { code: v.code, name: v.name, glyph: mark(v.he), also: v.alt };
        });
        // Vowel letters, inserted after the hireq, tsere and holem cards.
        vowels.splice(3, 0, { code: 'iy', name: 'hireq yod', glyph: mark('\u05B4\u05D9') });
        vowels.splice(7, 0, { code: 'ow', name: 'holem waw', glyph: '\u05D5\u05B9', also: ['wo'] });
        vowels.splice(9, 0, { code: 'w.', name: 'shureq', glyph: '\u05D5' + TH.DAGESH });

        var marks = [{ code: '.', name: 'dagesh', glyph: mark(TH.DAGESH) }]
            .concat(TH.PUNCTUATION.map(function (p) {
                return { code: p.code, name: p.name, glyph: p.he, also: p.alt };
            }))
            .concat([{ code: 'j', name: 'no final form', glyph: '\u05DE', also: ['v'] }]);

        function accents(group) {
            return TH.ACCENTS.filter(function (a) { return a.group === group; })
                .map(function (a) {
                    return { code: a.code, name: a.name, glyph: mark(a.he), also: a.legacy };
                });
        }

        key.appendChild(section('Consonants', consonants, {
            note: 'Final forms are added automatically at the end of a word.'
        }));
        key.appendChild(section('Vowels', vowels));
        key.appendChild(section('Other marks', marks));
        key.appendChild(section('Cantillation: disjunctive accents', accents('disjunctive'), {
            collapsible: true,
            note: 'Type an accent\'s number after the letter it sits on, after any vowel: b.:r")$i73yt. ' +
                'Pre- and postpositive accents go on the first or last letter of the word.'
        }));
        key.appendChild(section('Cantillation: conjunctive accents', accents('conjunctive'), { collapsible: true }));
        key.appendChild(section('Cantillation: meteg and other marks', accents('other'), { collapsible: true }));
    }

    // ------------------------------------------------------------------
    // Wiring
    // ------------------------------------------------------------------

    var saved = loadScheme();
    if (saved && TH.SCHEMES[saved]) { scheme.value = saved; }

    buildKey();
    convert();
    betaCode.addEventListener('input', convert);
    ['input', 'keyup', 'mouseup', 'touchend', 'select', 'blur'].forEach(function (type) {
        betaCode.addEventListener(type, rememberCaret);
    });
    scheme.addEventListener('change', function () {
        saveScheme(scheme.value);
        convert();
    });

    key.addEventListener('click', function (event) {
        var button = event.target.closest('.card');
        if (button) { insertCode(button.getAttribute('data-code')); }
    });

    document.querySelectorAll('[data-select]').forEach(function (button) {
        button.addEventListener('click', function () {
            selectContents(document.getElementById(button.getAttribute('data-select')));
        });
    });

    document.querySelectorAll('[data-copy]').forEach(function (button) {
        button.addEventListener('click', function () {
            copyContents(document.getElementById(button.getAttribute('data-copy')), button);
        });
    });

    function toggle(link, panel) {
        link.addEventListener('click', function () {
            panel.hidden = !panel.hidden;
            link.setAttribute('aria-expanded', String(!panel.hidden));
            if (!panel.hidden && touch) {
                panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
    toggle(document.getElementById('keylink'), key);
    toggle(document.getElementById('aboutlink'), about);

    if (!touch) {
        betaCode.select();
        rememberCaret();
    }
}());
