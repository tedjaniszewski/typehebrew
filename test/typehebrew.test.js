// Run with: npm test
var test = require('node:test');
var assert = require('node:assert');
var TH = require('../js/typehebrew.js');

function he(beta) { return TH.toHebrew(beta); }
// Compare Hebrew canonically, so expected strings can be typed in any mark order.
function nfc(s) { return s.normalize('NFC'); }
function sameHebrew(actual, expected, msg) { assert.strictEqual(nfc(actual), nfc(expected), msg); }
function tr(beta, scheme) { return TH.transliterate(beta, scheme || 'sbl'); }

test('basic letters, vowels and final forms', function () {
    sameHebrew(he('):elohiym'), 'אֱלֹהִים');
    sameHebrew(he('hf)frec'), 'הָאָרֶץ');
    sameHebrew(he('lfk:'), 'לָךְ');
    sameHebrew(he('melek:-yi&:rf)"l'), 'מֶלֶךְ־יִשְׂרָאֵל');
    assert.strictEqual(he('mj'), 'מ', 'j suppresses the final form');
});

test('Beta Code is case-insensitive', function () {
    assert.strictEqual(he('B.:R")$IYT'), he('b.:r")$iyt'));
});

test('points are emitted in a consistent order whatever order they are typed', function () {
    assert.strictEqual(he('b.a'), he('ba.'));
    assert.strictEqual(he('$.f'), 'שּׁ'.normalize('NFD').replace('ּׁ', 'ּׁ') + 'ָ');
});

test('holem male is encoded on the waw', function () {
    sameHebrew(he('yowm'), 'יוֹם');
    sameHebrew(he('mic:wot'), 'מִצְוֹת', 'consonantal waw keeps its own holem');
});

test('geresh and gershayim', function () {
    assert.strictEqual(he('tn//k'), 'תנ״ך');
    assert.strictEqual(he('p/'), 'פ׳', 'no final form before geresh');
});

test('smart quotes from phone keyboards are treated as tsere', function () {
    assert.strictEqual(he('l“b'), he('l"b'));
});

test('cantillation marks (Michigan-Claremont codes)', function () {
    sameHebrew(he('b.:r")$i73yt'), 'בְּרֵאשִׁ֖ית');
    sameHebrew(he('hf)fre75c00'), 'הָאָֽרֶץ׃'.replace('הָאָֽ', 'הָאָ').replace('רֶץ', 'רֶֽץ'));
    assert.strictEqual(he('ba92'), 'בַ֑');
    assert.strictEqual(he('b<'), 'ב֫', 'legacy ole shortcut');
    assert.strictEqual(he('b,'), 'ב֣', 'legacy munah shortcut');
    assert.strictEqual(he('b|'), 'בֽ', 'legacy meteg shortcut');
    assert.strictEqual(he('mf05'), 'םָ׀', 'paseq');
});

test('SBL transliteration: Shema and Genesis 1:1', function () {
    assert.strictEqual(tr('$:ma( yi&:rf)"l y:hwfh ):eloh"ynw. y:hwfh )exfd;'),
        'šəmaʿ yiśrāʾēl YHWH ʾĕlōhênû YHWH ʾeḥād.');
    assert.strictEqual(tr('b.:r")$iyt b.frf) ):elohiym )"t ha$.fmayim w:)"t hf)frec'),
        'bərēʾšît bārāʾ ʾĕlōhîm ʾēt haššāmayim wəʾēt hāʾāreṣ');
});

test('SBL transliteration: shewa, dagesh, matres, furtive patah, qamets hatuf', function () {
    assert.strictEqual(tr('xfk:mfh'), 'ḥokmâ');
    assert.strictEqual(tr('k.fl-hf)fdfm'), 'kol-hāʾādām');
    assert.strictEqual(tr('rw.xa'), 'rûaḥ');
    assert.strictEqual(tr('w.melek:'), 'ûmelek');
    assert.strictEqual(tr('hab.ayit'), 'habbayit');
    assert.strictEqual(tr('yi$:m:rw.'), 'yišmərû');
    assert.strictEqual(tr('$f|m:rw.'), 'šāmərû', 'meteg marks a long qamets before vocal shewa');
    assert.strictEqual(tr('yowm'), 'yôm');
    assert.strictEqual(tr('ywom'), 'yôm', 'holem male typed waw-first');
    assert.strictEqual(tr('mic:wot'), 'miṣwōt');
    assert.strictEqual(tr('t.owrfh'), 'tôrâ');
    assert.strictEqual(tr('b."yt'), 'bêt');
    assert.strictEqual(tr('l:yhwfh'), 'ləYHWH');
    assert.strictEqual(tr('sw.sfh.'), 'sûsāh', 'mappiq he is a consonant');
});

test('accents do not appear in the transliteration', function () {
    assert.strictEqual(tr('b.:r")$i73yt'), 'bərēʾšît');
});

test('Lambdin transliteration marks spirants and uses superscript shewa', function () {
    assert.strictEqual(tr('b.:r")$iyt b.frf) ):elohiym )"t', 'lambdin'), 'bᵉrēʾšîṯ bārāʾ ʾĕlōhîm ʾēṯ');
    assert.strictEqual(tr('xfk:mfh', 'lambdin'), 'ḥoḵmâ');
    assert.strictEqual(tr('w.melek:', 'lambdin'), 'ûmeleḵ');
});

test('Jewish Encyclopedia transliteration', function () {
    assert.strictEqual(tr('b.:r")$iyt b.frf) ):elohiym )"t ha$.fmayim w:)"t hf)frec', 'je'),
        'bereshit bara elohim et hashamayim we\'et ha\'areẓ');
    assert.strictEqual(tr('t.owrfh', 'je'), 'torah');
    assert.strictEqual(tr('s"per', 'je'), 'sefer');
});
