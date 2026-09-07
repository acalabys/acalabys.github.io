const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { selectHeroSlides } = require('../assets/js/hero-selection.js');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, '../data', name), 'utf8'));
const research = read('research.json'), gallery = read('gallery.json');
const now = new Date(2026, 8, 7);
const rng = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
for (let seed = 0; seed < 100; seed++) {
  const slides = selectHeroSlides(research, gallery, now, rng(seed));
  assert.equal(slides.length, 6);
  for (const [category, count] of [['research', 1], ['academic', 3], ['activity', 2]]) {
    assert.equal(slides.filter(s => s.category === category).length, count);
  }
  assert.equal(new Set(slides.map(s => s.img)).size, 6);
  assert.equal(new Set(slides.filter(s => s.category === 'academic').map(s => s.title)).size, 3);
  for (const slide of slides) assert.ok(fs.existsSync(path.join(__dirname, '..', slide.img)));
}
const event = (date, src, category = 'academic') => ({ date, src, title: src, category });
const boundaries = selectHeroSlides([], [
  event('2024-09-06', 'too-old'), event('2024-09-07', 'cutoff'),
  event('2026-09-07', 'today'), event('2026-09-08', 'future'),
  event('2026-02-31', 'invalid'), event('', 'missing')
], now, rng(1));
assert.deepEqual(boundaries.map(s => s.img).sort(), ['cutoff', 'today']);
const leap = selectHeroSlides([], [event('2022-02-27', 'old'), event('2022-02-28', 'valid')], new Date(2024, 1, 29));
assert.deepEqual(leap.map(s => s.img), ['valid']);
const small = selectHeroSlides([], [{ date: '2026-05-01', category: 'academic', images: ['a','a','b','c'] }], now);
assert.equal(small.length, 3);
assert.equal(new Set(small.map(s => s.img)).size, 3);
assert.deepEqual(selectHeroSlides([], gallery, new Date(2030, 8, 7)), []);
console.log('PASS: 100 selections, 1/3/2 counts, event diversity, unique existing images, two-year boundary, future/invalid dates, leap day, sparse and expired galleries.');
