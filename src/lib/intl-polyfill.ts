// Hermes ships only a partial Intl implementation; currency formatting for
// non-US locales (INR grouping, EUR/JPY symbols, etc.) is unreliable. We force
// the formatjs polyfills + the locale data for the 7 currencies finio supports.
// Imported once at the top of the app entry, BEFORE any formatCurrency call.
import '@formatjs/intl-getcanonicallocales/polyfill-force';
import '@formatjs/intl-locale/polyfill-force';

import '@formatjs/intl-pluralrules/polyfill-force';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/de';
import '@formatjs/intl-pluralrules/locale-data/ja';

import '@formatjs/intl-numberformat/polyfill-force';
import '@formatjs/intl-numberformat/locale-data/en';
import '@formatjs/intl-numberformat/locale-data/en-IN';
import '@formatjs/intl-numberformat/locale-data/en-GB';
import '@formatjs/intl-numberformat/locale-data/en-CA';
import '@formatjs/intl-numberformat/locale-data/en-AU';
import '@formatjs/intl-numberformat/locale-data/de';
import '@formatjs/intl-numberformat/locale-data/ja';
