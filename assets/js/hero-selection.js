/* Balanced, recent hero images. Kept independent of the DOM for validation. */
(function (scope) {
  function selectHeroSlides(research, gallery, now = new Date(), random = Math.random) {
    const shuffle = (items) => {
      const result = [...items];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    };
    const year = now.getFullYear(), month = now.getMonth(), day = now.getDate();
    const today = Date.UTC(year, month, day);
    // Clamp Feb 29 to Feb 28 when the cutoff year is not a leap year.
    const cutoffDay = Math.min(day, new Date(Date.UTC(year - 2, month + 1, 0)).getUTCDate());
    const cutoff = Date.UTC(year - 2, month, cutoffDay);
    const parseDay = (value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return NaN;
      const [y, m, d] = value.split("-").map(Number);
      const time = Date.UTC(y, m - 1, d);
      return new Date(time).toISOString().slice(0, 10) === value ? time : NaN;
    };
    const recent = (gallery || []).filter(item => {
      const date = parseDay(item.date);
      return date >= cutoff && date <= today;
    });
    const used = new Set();
    const pickPhotos = (category, limit) => {
      const events = shuffle(recent.filter(item => item.category === category));
      const chosen = [], extras = [];
      const add = (slide) => {
        if (!used.has(slide.img) && chosen.length < limit) {
          used.add(slide.img);
          chosen.push(slide);
        }
      };
      for (const event of events) {
        // Existing albums sometimes have an obsolete src beside valid images.
        const images = event.images?.length ? event.images : [event.src || event.thumb];
        const options = shuffle([...new Set(images.filter(Boolean))]).map(img => ({
          img, category, title: event.title || "Gallery", caption: event.date, link: "gallery.html"
        }));
        const first = options.find(slide => !used.has(slide.img));
        if (first) add(first);
        extras.push(...options);
      }
      // Prefer different events; fill from other recent album photos if needed.
      shuffle(extras).forEach(add);
      return chosen;
    };
    const academic = pickPhotos("academic", 3);
    const activity = pickPhotos("activity", 2);
    const researchItem = shuffle((research || []).filter(item => item.img))[0];
    const researchSlide = researchItem && {
      img: researchItem.img, category: "research", title: researchItem.title || "Research",
      caption: researchItem.caption || researchItem.summary || "", link: researchItem.link || "research.html"
    };
    // Interleave categories. Never repeat or use old photos just to fill a slot.
    return [academic[0], researchSlide, activity[0], academic[1], activity[1], academic[2]].filter(Boolean);
  }
  if (typeof module !== "undefined" && module.exports) module.exports = { selectHeroSlides };
  else scope.selectHeroSlides = selectHeroSlides;
})(typeof globalThis !== "undefined" ? globalThis : this);
