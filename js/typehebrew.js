/*
 * TypeHebrew conversion engine
 *
 * Turns Hebrew Beta Code (CCAT / Michigan-Claremont) into Unicode Hebrew and
 * into Latin transliteration. Has no DOM dependencies, so it runs in the
 * browser (as window.TypeHebrew) and in Node (for the tests).
 *
 * The input is parsed once into a list of tokens. Each consonant becomes a
 * "cluster" carrying the points and accents typed after it. Both outputs are
 * built from those clusters. This is what lets final forms, holem male,
 * furtive patah, shewa, and so on be decided per word, rather than with
 * regular expressions over the raw text.
 */
(function (root) {
    'use strict';

    // ------------------------------------------------------------------
    // Character tables. The key on the page is generated from these too.
    // ------------------------------------------------------------------

    var CONSONANTS = [
        { code: ')', id: 'alef',    name: 'alef',     he: '\u05D0' },
        { code: 'b', id: 'bet',     name: 'bet',      he: '\u05D1', bgdkpt: true },
        { code: 'g', id: 'gimel',   name: 'gimel',    he: '\u05D2', bgdkpt: true },
        { code: 'd', id: 'dalet',   name: 'dalet',    he: '\u05D3', bgdkpt: true },
        { code: 'h', id: 'he',      name: 'he',       he: '\u05D4' },
        { code: 'w', id: 'waw',     name: 'waw',      he: '\u05D5' },
        { code: 'z', id: 'zayin',   name: 'zayin',    he: '\u05D6' },
        { code: 'x', id: 'het',     name: 'het',      he: '\u05D7' },
        { code: '+', id: 'tet',     name: 'tet',      he: '\u05D8' },
        { code: 'y', id: 'yod',     name: 'yod',      he: '\u05D9' },
        { code: 'k', id: 'kaf',     name: 'kaf',      he: '\u05DB', fin: '\u05DA', bgdkpt: true },
        { code: 'l', id: 'lamed',   name: 'lamed',    he: '\u05DC' },
        { code: 'm', id: 'mem',     name: 'mem',      he: '\u05DE', fin: '\u05DD' },
        { code: 'n', id: 'nun',     name: 'nun',      he: '\u05E0', fin: '\u05DF' },
        { code: 's', id: 'samek',   name: 'samek',    he: '\u05E1' },
        { code: '(', id: 'ayin',    name: 'ayin',     he: '\u05E2' },
        { code: 'p', id: 'pe',      name: 'pe',       he: '\u05E4', fin: '\u05E3', bgdkpt: true },
        { code: 'c', id: 'tsade',   name: 'tsade',    he: '\u05E6', fin: '\u05E5' },
        { code: 'q', id: 'qof',     name: 'qof',      he: '\u05E7' },
        { code: 'r', id: 'resh',    name: 'resh',     he: '\u05E8' },
        { code: '#', id: 'sinshin', name: 'sin/shin', he: '\u05E9' },
        { code: '&', id: 'sin',     name: 'sin',      he: '\u05E9', dot: '\u05C2' },
        { code: '$', id: 'shin',    name: 'shin',     he: '\u05E9', dot: '\u05C1' },
        { code: 't', id: 'taw',     name: 'taw',      he: '\u05EA', bgdkpt: true }
    ];

    // Vowel points. Hateph vowels may also be typed vowel-first ("a:").
    var VOWELS = [
        { code: 'a',  alt: [],     id: 'patah',       name: 'patah',          he: '\u05B7' },
        { code: 'f',  alt: [],     id: 'qamets',      name: 'qamets',         he: '\u05B8' },
        { code: 'i',  alt: [],     id: 'hireq',       name: 'hireq',          he: '\u05B4' },
        { code: 'e',  alt: [],     id: 'segol',       name: 'segol',          he: '\u05B6' },
        { code: '"',  alt: [],     id: 'tsere',       name: 'tsere',          he: '\u05B5' },
        { code: 'o',  alt: [],     id: 'holem',       name: 'holem',          he: '\u05B9' },
        { code: 'u',  alt: [],     id: 'qibbuts',     name: 'qibbuts',        he: '\u05BB' },
        { code: ':',  alt: [],     id: 'shewa',       name: 'shewa',          he: '\u05B0' },
        { code: ':a', alt: ['a:'], id: 'hatefPatah',  name: 'hateph-patah',   he: '\u05B2' },
        { code: ':f', alt: ['f:'], id: 'hatefQamets', name: 'hateph-qamets',  he: '\u05B3' },
        { code: ':e', alt: ['e:'], id: 'hatefSegol',  name: 'hateph-segol',   he: '\u05B1' }
    ];

    var DAGESH = '\u05BC';
    var HOLEM = '\u05B9';

    // Cantillation marks, coded with the two-digit Michigan-Claremont numbers
    // used in BHS-derived electronic texts such as the Westminster Leningrad
    // Codex. "pos" marks prepositive and postpositive accents, which sit on
    // the first or last letter of a word rather than on the stressed one.
    // "legacy" lists the older single-character TypeHebrew shortcuts.
    var ACCENTS = [
        { code: '92', name: 'atnah',              he: '\u0591', group: 'disjunctive' },
        { code: '01', name: 'segolta',            he: '\u0592', group: 'disjunctive', pos: 'post' },
        { code: '65', name: 'shalshelet',         he: '\u0593', group: 'disjunctive' },
        { code: '80', name: 'zaqef qatan',        he: '\u0594', group: 'disjunctive' },
        { code: '85', name: 'zaqef gadol',        he: '\u0595', group: 'disjunctive' },
        { code: '73', name: 'tipha',              he: '\u0596', group: 'disjunctive' },
        { code: '81', name: 'revia',              he: '\u0597', group: 'disjunctive' },
        { code: '02', name: 'zarqa (zinor)',      he: '\u05AE', group: 'disjunctive', pos: 'post' },
        { code: '82', name: 'zarqa (zinorit)',    he: '\u0598', group: 'disjunctive' },
        { code: '03', name: 'pashta',             he: '\u0599', group: 'disjunctive', pos: 'post' },
        { code: '33', name: 'pashta (medial)',    he: '\u0599', group: 'disjunctive' },
        { code: '10', name: 'yetiv',              he: '\u059A', group: 'disjunctive', pos: 'pre' },
        { code: '91', name: 'tevir',              he: '\u059B', group: 'disjunctive' },
        { code: '61', name: 'geresh',             he: '\u059C', group: 'disjunctive' },
        { code: '11', name: 'geresh muqdam',      he: '\u059D', group: 'disjunctive' },
        { code: '62', name: 'gershayim',          he: '\u059E', group: 'disjunctive' },
        { code: '84', name: 'qarne farah',        he: '\u059F', group: 'disjunctive' },
        { code: '14', name: 'telisha gedolah',    he: '\u05A0', group: 'disjunctive', pos: 'pre' },
        { code: '44', name: 'telisha gedolah (medial)', he: '\u05A0', group: 'disjunctive' },
        { code: '83', name: 'pazer',              he: '\u05A1', group: 'disjunctive' },
        { code: '13', name: 'dehi',               he: '\u05AD', group: 'disjunctive', pos: 'pre' },
        { code: '74', name: 'munah',              he: '\u05A3', group: 'conjunctive', legacy: [','] },
        { code: '70', name: 'mahpak',             he: '\u05A4', group: 'conjunctive' },
        { code: '71', name: 'merka',              he: '\u05A5', group: 'conjunctive' },
        { code: '72', name: 'merka kefulah',      he: '\u05A6', group: 'conjunctive' },
        { code: '94', name: 'darga',              he: '\u05A7', group: 'conjunctive' },
        { code: '63', name: 'qadma (azla)',       he: '\u05A8', group: 'conjunctive' },
        { code: '04', name: 'telisha qetannah',   he: '\u05A9', group: 'conjunctive', pos: 'post' },
        { code: '24', name: 'telisha qetannah (medial)', he: '\u05A9', group: 'conjunctive' },
        { code: '93', name: 'galgal',             he: '\u05AA', group: 'conjunctive' },
        { code: '60', name: 'ole',                he: '\u05AB', group: 'conjunctive', legacy: ['<'] },
        { code: '64', name: 'illuy',              he: '\u05AC', group: 'conjunctive' },
        { code: '95', name: 'meteg',              he: '\u05BD', group: 'other', meteg: true, legacy: ['|'] },
        { code: '35', name: 'meteg (medial)',     he: '\u05BD', group: 'other', meteg: true },
        { code: '75', name: 'silluq',             he: '\u05BD', group: 'other', meteg: true },
        { code: '52', name: 'upper dot',          he: '\u05C4', group: 'other', pos: 'none' },
        { code: '53', name: 'lower dot',          he: '\u05C5', group: 'other', pos: 'none' }
    ];

    // Marks that stand between letters or words rather than on a letter.
    var PUNCTUATION = [
        { code: '-',  alt: [],     id: 'maqqef',     name: 'maqqef',    he: '\u05BE' },
        { code: ';',  alt: ['00'], id: 'sofPasuq',   name: 'sof pasuq', he: '\u05C3' },
        { code: '05', alt: [],     id: 'paseq',      name: 'paseq',     he: '\u05C0' },
        { code: '/',  alt: [],     id: 'geresh',     name: 'geresh',    he: '\u05F3' },
        { code: '//', alt: [],     id: 'gershayim',  name: 'gershayim', he: '\u05F4' }
    ];

    // ------------------------------------------------------------------
    // Transliteration schemes
    // ------------------------------------------------------------------

    var LONG_VOWELS = {
        qamets: true, tsere: true, holem: true, hireqYod: true, tsereYod: true,
        segolYod: true, holemWaw: true, shureq: true, qametsHe: true,
        segolHe: true, tsereHe: true, holemHe: true
    };

    var SBL_CONSONANTS = {
        alef: 'ʾ', bet: 'b', gimel: 'g', dalet: 'd', he: 'h', waw: 'w', zayin: 'z',
        het: 'ḥ', tet: 'ṭ', yod: 'y', kaf: 'k', lamed: 'l', mem: 'm', nun: 'n',
        samek: 's', ayin: 'ʿ', pe: 'p', tsade: 'ṣ', qof: 'q', resh: 'r',
        sinshin: 'š', sin: 'ś', shin: 'š', taw: 't'
    };

    var SBL_VOWELS = {
        patah: 'a', qamets: 'ā', qametsHatuf: 'o', hireq: 'i', segol: 'e',
        tsere: 'ē', holem: 'ō', qibbuts: 'u', shewa: 'ə',
        hatefPatah: 'ă', hatefQamets: 'ŏ', hatefSegol: 'ĕ',
        hireqYod: 'î', tsereYod: 'ê', segolYod: 'ê', holemWaw: 'ô', shureq: 'û',
        qametsHe: 'â', segolHe: 'ê', tsereHe: 'ê', holemHe: 'ô'
    };

    function extend(base, changes) {
        var out = {}, key;
        for (key in base) { out[key] = base[key]; }
        for (key in changes) { out[key] = changes[key]; }
        return out;
    }

    var SCHEMES = {
        // SBL Handbook of Style (2nd ed.), academic style. Spirantization is
        // not marked; vocal shewa is ə.
        sbl: {
            label: 'SBL Academic',
            consonants: SBL_CONSONANTS,
            spirants: {},
            vowels: SBL_VOWELS,
            tetragrammaton: 'YHWH'
        },
        // Thomas O. Lambdin, Introduction to Biblical Hebrew. Marks the
        // spirantized begadkefat letters and writes vocal shewa as a
        // superscript e.
        lambdin: {
            label: 'Lambdin',
            consonants: SBL_CONSONANTS,
            spirants: { bet: 'ḇ', gimel: 'ḡ', dalet: 'ḏ', kaf: 'ḵ', pe: 'p̄', taw: 'ṯ' },
            vowels: extend(SBL_VOWELS, { shewa: 'ᵉ' }),
            tetragrammaton: 'YHWH'
        },
        // Jewish Encyclopedia (1901-1906). No vowel length; alef is not
        // written at the start or end of a word, or where it is silent
        // (has no vowel); dagesh lene is shown only
        // on pe (p/f); digraphs are not doubled.
        je: {
            label: 'Jewish Encyclopedia',
            consonants: extend(SBL_CONSONANTS, {
                alef: '\'', ayin: '\'', tsade: 'ẓ', qof: 'ḳ', sinshin: 'sh', sin: 's', shin: 'sh'
            }),
            spirants: { pe: 'f' },
            vowels: {
                patah: 'a', qamets: 'a', qametsHatuf: 'o', hireq: 'i', segol: 'e',
                tsere: 'e', holem: 'o', qibbuts: 'u', shewa: 'e',
                hatefPatah: 'a', hatefQamets: 'o', hatefSegol: 'e',
                hireqYod: 'i', tsereYod: 'e', segolYod: 'e', holemWaw: 'o', shureq: 'u',
                qametsHe: 'ah', segolHe: 'eh', tsereHe: 'eh', holemHe: 'oh'
            },
            silentAlef: true,
            singleDigraphs: true,
            tetragrammaton: 'YHWH'
        }
    };

    // ------------------------------------------------------------------
    // Lookup maps
    // ------------------------------------------------------------------

    var CONS_BY_CODE = {}, MARK_CODES = [], PUNCT_CODES = [];

    CONSONANTS.forEach(function (c) { CONS_BY_CODE[c.code] = c; });

    VOWELS.forEach(function (v) {
        [v.code].concat(v.alt).forEach(function (code) {
            MARK_CODES.push({ code: code, kind: 'vowel', item: v });
        });
    });
    MARK_CODES.push({ code: '.', kind: 'dagesh' });
    ACCENTS.forEach(function (a) {
        [a.code].concat(a.legacy || []).forEach(function (code) {
            MARK_CODES.push({ code: code, kind: 'accent', item: a });
        });
    });
    PUNCTUATION.forEach(function (p) {
        [p.code].concat(p.alt).forEach(function (code) {
            PUNCT_CODES.push({ code: code, item: p });
        });
    });

    // Longest codes first, so ":a" wins over ":" and "//" over "/".
    function byLength(a, b) { return b.code.length - a.code.length; }
    MARK_CODES.sort(byLength);
    PUNCT_CODES.sort(byLength);

    function matchAt(list, text, i) {
        for (var n = 0; n < list.length; n++) {
            if (text.substr(i, list[n].code.length) === list[n].code) {
                return list[n];
            }
        }
        return null;
    }

    // ------------------------------------------------------------------
    // Parsing
    // ------------------------------------------------------------------

    // Undo the "smart" punctuation that phone keyboards insert, and fold
    // case (Beta Code is case-insensitive).
    function normalizeInput(text) {
        return String(text)
            .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
            .replace(/[\u2013\u2014]/g, '-')
            .replace(/\u00A0/g, ' ')
            .replace(/\r\n?/g, '\n')
            .toLowerCase();
    }

    function newCluster(cons) {
        return {
            type: 'cluster', cons: cons, vowels: [], dagesh: false,
            accents: [], noFinal: false
        };
    }

    function parse(input) {
        var text = normalizeInput(input),
            tokens = [], cluster = null, i = 0, ch, m;

        while (i < text.length) {
            ch = text.charAt(i);

            if (CONS_BY_CODE[ch]) {
                cluster = newCluster(CONS_BY_CODE[ch]);
                tokens.push(cluster);
                i++;
                continue;
            }

            // "00" (sof pasuq) and "05" (paseq) are punctuation, so check
            // those before the two-digit accents.
            m = matchAt(PUNCT_CODES, text, i);
            if (m) {
                tokens.push({ type: m.item.id, item: m.item });
                cluster = null;
                i += m.code.length;
                continue;
            }

            m = matchAt(MARK_CODES, text, i);
            if (m) {
                if (cluster) {
                    if (m.kind === 'vowel') { cluster.vowels.push(m.item); }
                    else if (m.kind === 'dagesh') { cluster.dagesh = true; }
                    else { cluster.accents.push(m.item); }
                } else {
                    // A mark with no letter to sit on: pass it through as is.
                    tokens.push({ type: 'text', text: m.kind === 'dagesh' ? DAGESH : m.item.he, translit: '' });
                }
                i += m.code.length;
                continue;
            }

            // "j" and "v" are invisible: they stop the letter before them
            // from taking its final form.
            if (ch === 'j' || ch === 'v') {
                if (cluster) { cluster.noFinal = true; }
                i++;
                continue;
            }

            cluster = null;
            if (ch === '\n') {
                tokens.push({ type: 'newline' });
            } else if (/\s/.test(ch)) {
                tokens.push({ type: 'space', text: ch });
            } else {
                tokens.push({ type: 'text', text: ch, translit: ch });
            }
            i++;
        }

        markWords(tokens);
        return tokens;
    }

    // Group clusters into words and work out the cross-letter facts that
    // both outputs need: final forms, holem male, shureq.
    function markWords(tokens) {
        var t, c, next, word = null;

        for (t = 0; t < tokens.length; t++) {
            c = tokens[t];
            if (c.type !== 'cluster') { word = null; continue; }
            if (!word) { word = { clusters: [], next: null }; }
            c.word = word;
            c.index = word.clusters.length;
            word.clusters.push(c);

            next = tokens[t + 1];
            if (!next || next.type !== 'cluster') {
                word.next = next ? next.type : null;
                // Final form unless an abbreviation mark follows the letter.
                c.final = !c.noFinal && !(next && (next.type === 'geresh' || next.type === 'gershayim'));
            }

            c.shureq = c.cons.id === 'waw' && c.dagesh && c.vowels.length === 0;
        }

        // Holem male typed CCAT-style, holem before waw ("ow"): the holem is
        // moved onto a following waw that has no points of its own.
        for (t = 0; t + 1 < tokens.length; t++) {
            c = tokens[t];
            next = tokens[t + 1];
            if (c.type === 'cluster' && next.type === 'cluster' &&
                    c.vowels.length && c.vowels[0].id === 'holem' &&
                    next.cons.id === 'waw' && !next.vowels.length && !next.dagesh) {
                c.holemMale = true;
                next.holemCarrier = true;
            }
        }
    }

    // ------------------------------------------------------------------
    // Hebrew output
    // ------------------------------------------------------------------

    function clusterToHebrew(c) {
        var out = (c.final && c.cons.fin) ? c.cons.fin : c.cons.he;
        if (c.cons.dot) { out += c.cons.dot; }
        if (c.dagesh) { out += DAGESH; }
        c.vowels.forEach(function (v, n) {
            if (!(n === 0 && c.holemMale)) { out += v.he; }
        });
        if (c.holemCarrier) { out += HOLEM; }
        c.accents.forEach(function (a) { out += a.he; });
        return out;
    }

    function toHebrew(tokens) {
        if (typeof tokens === 'string') { tokens = parse(tokens); }
        return tokens.map(function (tok) {
            switch (tok.type) {
                case 'cluster': return clusterToHebrew(tok);
                case 'newline': return '\n';
                case 'space': case 'text': return tok.text;
                default: return tok.item.he;
            }
        }).join('');
    }

    // ------------------------------------------------------------------
    // Transliteration
    // ------------------------------------------------------------------

    function vowelId(c) {
        return c.vowels.length ? c.vowels[0].id : null;
    }

    function isFullVowel(id) {
        return id !== null && id !== 'shewa';
    }

    // Does the syllable carry stress or a meteg? Prepositive and
    // postpositive accents don't count: they don't mark the stressed letter.
    function isAccented(c) {
        return c.accents.some(function (a) { return !a.pos; });
    }

    function bare(c) {
        return !c.vowels.length && !c.dagesh;
    }

    function transliterateWord(word, scheme) {
        var cl = word.clusters, n = cl.length,
            out = '', open = false, prevLong = false, prevSilentShewa = false,
            skip = {}, i, c, next, v, cons, forte, mappiq, vowelOut, isSilent;

        // The divine name, with or without a one-letter prefix, is given in
        // the conventional form rather than letter by letter.
        var skeleton = cl.map(function (x) { return x.cons.id; }).join(' ');
        var yhwh = /^((?:bet|waw|kaf|lamed|mem) )?yod he waw he$/.exec(skeleton);
        if (yhwh) { n = yhwh[1] ? 1 : 0; }

        function fullVowelAfter(k) {
            for (var j = k + 1; j < cl.length; j++) {
                if (isFullVowel(vowelId(cl[j])) || cl[j].shureq) { return true; }
            }
            return false;
        }

        for (i = 0; i < n; i++) {
            if (skip[i]) { continue; }
            c = cl[i];
            next = cl[i + 1];
            v = vowelId(c);

            // Shureq is the vowel of the consonant before it (or stands alone
            // for word-initial "and").
            if (c.shureq) {
                out += scheme.vowels.shureq;
                open = true; prevLong = true; prevSilentShewa = false;
                continue;
            }

            // --- the consonant ---
            mappiq = c.cons.id === 'he' && c.dagesh && i === cl.length - 1;
            forte = c.dagesh && !mappiq && !(c.cons.bgdkpt && (i === 0 || !open));
            cons = scheme.consonants[c.cons.id];
            if (c.cons.bgdkpt && !c.dagesh && scheme.spirants[c.cons.id]) {
                cons = scheme.spirants[c.cons.id];
            }
            if (scheme.silentAlef && c.cons.id === 'alef' && (i === 0 || i === cl.length - 1 || v === null)) {
                cons = '';
            }
            if (forte && !(scheme.singleDigraphs && cons.length > 1)) {
                cons += cons;
            }

            // --- the vowel ---
            vowelOut = '';
            isSilent = false;

            // WLC-style holem male: a bare consonant followed by waw+holem.
            if (v === null && next && next.cons.id === 'waw' && !next.dagesh &&
                    vowelId(next) === 'holem' && next.vowels.length === 1) {
                v = 'holemWaw';
                skip[i + 1] = true;
            } else if (c.holemMale) {
                v = 'holemWaw';
                skip[i + 1] = true;
            } else if (next && next.cons.id === 'yod' && bare(next) &&
                    (v === 'hireq' || v === 'tsere' || v === 'segol')) {
                v = v === 'hireq' ? 'hireqYod' : v + 'Yod';
                skip[i + 1] = true;
            } else if (next && i + 1 === cl.length - 1 && next.cons.id === 'he' && bare(next) &&
                    (v === 'qamets' || v === 'segol' || v === 'tsere' || v === 'holem')) {
                v = v + 'He';
                skip[i + 1] = true;
            } else if (v === 'qamets' && !isAccented(c) && next && (
                    // before hateph qamets
                    vowelId(next) === 'hatefQamets' ||
                    // in a closed syllable: before a silent shewa
                    (vowelId(next) === 'shewa' && !next.dagesh && fullVowelAfter(i + 1)) ||
                    // closed syllable before maqqef ("kol-")
                    (i + 1 === cl.length - 1 && vowelId(next) === null && !next.shureq &&
                        word.next === 'maqqef'))) {
                v = 'qametsHatuf';
            } else if (v === 'shewa') {
                isSilent = !(i === 0 || forte ||
                    (next && next.cons.id === c.cons.id) ||
                    (fullVowelAfter(i) && (prevSilentShewa || prevLong)));
            }

            // Furtive patah is pronounced before its guttural.
            if (v === 'patah' && i === cl.length - 1 && i > 0 && open &&
                    (c.cons.id === 'het' || c.cons.id === 'ayin' || mappiq)) {
                out += scheme.vowels.patah + cons;
                open = false;
                continue;
            }

            if (v !== null && !isSilent) {
                vowelOut = scheme.vowels[v];
            }
            // Any further vowels typed on the same letter.
            c.vowels.slice(1).forEach(function (extra) {
                vowelOut += scheme.vowels[extra.id] || '';
            });

            out += cons + vowelOut;
            open = vowelOut !== '';
            prevLong = !!LONG_VOWELS[v] && !isSilent;
            prevSilentShewa = v === 'shewa' && isSilent;
        }

        if (yhwh) { out += scheme.tetragrammaton; }
        return out;
    }

    function transliterate(tokens, schemeName) {
        if (typeof tokens === 'string') { tokens = parse(tokens); }
        var scheme = SCHEMES[schemeName] || SCHEMES.sbl;

        return tokens.map(function (tok) {
            switch (tok.type) {
                case 'cluster':
                    return tok.index === 0 ? transliterateWord(tok.word, scheme) : '';
                case 'newline': return '\n';
                case 'space': return tok.text;
                case 'text': return tok.translit;
                case 'maqqef': return '-';
                case 'sofPasuq': return '.';
                case 'geresh': return '\'';
                case 'gershayim': return '"';
                default: return '';
            }
        }).join('');
    }

    var TypeHebrew = {
        CONSONANTS: CONSONANTS,
        VOWELS: VOWELS,
        ACCENTS: ACCENTS,
        PUNCTUATION: PUNCTUATION,
        SCHEMES: SCHEMES,
        DAGESH: DAGESH,
        parse: parse,
        toHebrew: toHebrew,
        transliterate: transliterate
    };

    if (typeof module === 'object' && module.exports) {
        module.exports = TypeHebrew;
    } else {
        root.TypeHebrew = TypeHebrew;
    }
}(this));
