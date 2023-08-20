// import { annotate } from 'rough-notation';
// Or using unpkg
import { annotate, annotationGroup } from 'https://unpkg.com/rough-notation?module';

const position = document.querySelector('.kw_position');
const email = document.querySelector('.kw_email');
const school = document.querySelector('.kw_school');
const web = document.querySelector('.kw_web');
const cta = document.querySelector('.cta');

const a1 = annotate(position, { type: 'highlight', color: 'cyan', multiline: 'true'});
const a2 = annotate(web, { type: 'highlight', color: 'orange', multiline: 'true'});
const a3 = annotate(school, { type: 'highlight', color: 'gray', multiline: 'true'});
const a4 = annotate(email, { type: 'highlight', color: '#FEF9B1', multiline: 'true'});
const a5 = annotate(cta, { type: 'circle', color: 'red', multiline: 'true'});

const group = annotationGroup([a1, a2, a3, a5, a4]);
group.show();
