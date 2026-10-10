TypeHebrew
==========
A web-based Hebrew Beta Code to Unicode converter, live at [typehebrew.org](https://typehebrew.org).

Type CCAT/Michigan-Claremont Beta Code and get pointed Unicode Hebrew, with
cantillation, plus a transliteration (SBL, Jewish Encyclopedia, or Lambdin).

* `index.html`, `css/main.css`: the page. No build step; GitHub Pages serves it as is.
* `js/typehebrew.js`: the conversion engine (Beta Code → Hebrew and transliteration).
  It has no DOM dependencies, and the on-page key is generated from its tables.
* `js/main.js`: the page's behaviour.
* `test/`: engine tests. Run `npm test` (Node 18+).
* `lib/`: reference material (Beta Code charts, keyboard manuals, the original prototype).

Cantillation marks use the two-digit Michigan-Claremont codes from
`lib/betacode-reference.html`, typed after the letter they sit on (`b.:r")$i73yt`).
The older single-character shortcuts `<` (ole), `,` (munah) and `|` (meteg) still work.
