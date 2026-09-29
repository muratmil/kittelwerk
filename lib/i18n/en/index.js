// Bölümler tek tek; yeni bölüm eklenince buraya da yazılır.
import rahmen from './rahmen.js';
import home from './home.js';
import kategorien from './kategorien.js';
import produkt from './produkt.js';
import mail from './mail.js';
import seiten from './seiten.js';
import druckinfo from './druckinfo.js';
import recht from './recht.js';

export default {
  ...rahmen,
  ...home,
  ...kategorien,
  ...produkt,
  ...mail,
  ...seiten,
  ...druckinfo,
  ...recht,
};
