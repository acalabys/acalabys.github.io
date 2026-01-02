async function fetchJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function safeText(s) {
  return String(s ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[m]));
}

function setYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
}

function setupMobileNav() {
  const btn = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
}

function applySiteBranding(site) {
  const mark = document.getElementById("brandMark");
  const name = document.getElementById("brandName");
  if (mark) mark.textContent = site.lab.shortName || "DSL";
  if (name) name.textContent = site.lab.name || "Digital Systems Lab";

  const footerOrg = document.getElementById("footerOrg");
  const footerLabName = document.getElementById("footerLabName");
  if (footerOrg) footerOrg.textContent = site.lab.org || site.lab.name || "";
  if (footerLabName) footerLabName.textContent = site.lab.name || "";

  const footerLinks = document.getElementById("footerLinks");
  if (footerLinks && Array.isArray(site.footerLinks)) {
    footerLinks.innerHTML = "";
    site.footerLinks.forEach((l) => {
      const a = el("a", "", safeText(l.label));
      a.href = l.href;
      if (/^https?:\/\//.test(l.href)) { a.target = "_blank"; a.rel = "noopener"; }
      footerLinks.appendChild(a);
    });
  }
}

function renderHero(site) {
  const { lab, hero } = site;

  const kicker = document.getElementById("heroKicker");
  const title = document.getElementById("heroTitle");
  const lead = document.getElementById("heroLead");
  const badge = document.getElementById("heroBadge");
  const note = document.getElementById("heroNote");

  if (kicker) kicker.textContent = lab.kicker || "";
  if (title) title.textContent = lab.name || "";
  if (lead) lead.textContent = lab.lead || "";
  if (badge) badge.textContent = lab.heroBadge || "Highlights";
  if (note) note.textContent = lab.heroNote || "";

  const chips = document.getElementById("heroChips");
  if (chips) {
    chips.innerHTML = "";
    (lab.keywords || []).forEach((k) => chips.appendChild(el("li", "", safeText(k))));
  }

  const cta = document.getElementById("heroCta");
  if (cta) {
    cta.innerHTML = "";
    (hero.cta || []).forEach((c) => {
      const a = el("a", `btn ${c.style === "primary" ? "primary" : ""}`, safeText(c.label));
      a.href = c.href;
      cta.appendChild(a);
    });
  }

  const stats = document.getElementById("heroStats");
  if (stats) {
    stats.innerHTML = "";
    (hero.stats || []).forEach((s) => {
      const box = el("div", "stat");
      box.appendChild(el("div", "stat-num", safeText(s.value)));
      box.appendChild(el("div", "stat-label", safeText(s.label)));
      stats.appendChild(box);
    });
  }

  const hg = document.getElementById("highlightsGrid");
  if (hg) {
    hg.innerHTML = "";
    (hero.highlights || []).forEach((h) => {
      const card = el("div", "feature glass");
      card.appendChild(el("h3", "", safeText(h.title)));
      card.appendChild(el("p", "muted", safeText(h.desc)));
      hg.appendChild(card);
    });
  }
}

function renderNews(news) {
  const list = document.getElementById("newsList");
  if (!list) return;

  list.innerHTML = "";
  news.slice(0, 6).forEach((n) => {
    const card = el("article", "card glass");
    card.appendChild(el("div", "card-top",
      `<span class="pill">${safeText(n.date)}</span>`
    ));
    card.appendChild(el("div", "card-title", safeText(n.title)));
    card.appendChild(el("p", "muted", safeText(n.desc || "")));
    if (n.link?.href) {
      const a = el("a", "link", safeText(n.link.label || "More →"));
      a.href = n.link.href;
      card.appendChild(a);
    }
    list.appendChild(card);
  });
}

function renderProjects(projects) {
  const list = document.getElementById("projectsList");
  if (!list) return;

  // fill tag dropdown
  const tagSelect = document.getElementById("projectTag");
  const allTags = new Set();
  projects.forEach(p => (p.tags || []).forEach(t => allTags.add(t)));
  if (tagSelect) {
    [...allTags].sort().forEach(t => {
      const opt = document.createElement("option");
      opt.value = t; opt.textContent = t;
      tagSelect.appendChild(opt);
    });
  }

  const render = (q, tag) => {
    list.innerHTML = "";
    const qq = (q || "").trim().toLowerCase();
    const tt = (tag || "").trim();

    projects
      .filter(p => {
        const hay = `${p.title} ${p.summary} ${(p.tags || []).join(" ")}`.toLowerCase();
        const matchQ = !qq || hay.includes(qq);
        const matchT = !tt || (p.tags || []).includes(tt);
        return matchQ && matchT;
      })
      .forEach(p => {
        const card = el("article", "card glass");
        card.appendChild(el("div", "card-title", safeText(p.title)));
        card.appendChild(el("p", "muted", safeText(p.summary || "")));

        const tagRow = el("div", "tag-row");
        (p.tags || []).forEach(t => tagRow.appendChild(el("span", "tag", safeText(t))));
        card.appendChild(tagRow);

        if (Array.isArray(p.links) && p.links.length) {
          const row = el("div", "link-row");
          p.links.forEach(l => {
            const a = el("a", "link", safeText(l.label));
            a.href = l.href;
            if (/^https?:\/\//.test(l.href)) { a.target = "_blank"; a.rel = "noopener"; }
            row.appendChild(a);
          });
          card.appendChild(row);
        }
        list.appendChild(card);
      });
  };

  const search = document.getElementById("projectSearch");
  const tag = document.getElementById("projectTag");
  const update = () => render(search?.value, tag?.value);

  search?.addEventListener("input", update);
  tag?.addEventListener("change", update);
  render("", "");
}

function renderPublications(pubs) {
  const list = document.getElementById("pubList");
  if (!list) return;

  // sort newest first
  pubs = [...pubs].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  // year dropdown
  const yearSelect = document.getElementById("pubYear");
  const years = [...new Set(pubs.map(p => p.year).filter(Boolean))].sort((a,b)=>b-a);
  if (yearSelect) years.forEach(y => {
    const opt = document.createElement("option");
    opt.value = String(y); opt.textContent = String(y);
    yearSelect.appendChild(opt);
  });

  const typeSelect = document.getElementById("pubType");
  const search = document.getElementById("pubSearch");

  const toHTML = (p) => {
    const title = safeText(p.title);
    const venue = safeText(p.venue || "");
    const year = safeText(p.year || "");
    const authors = safeText((p.authors || []).join(", "));
    const kw = (p.keywords || []).map(k => `<span class="tag">${safeText(k)}</span>`).join("");

    const links = [];
    if (p.links?.pdf) links.push(`<a class="link" href="${p.links.pdf}" target="_blank" rel="noopener">PDF</a>`);
    if (p.links?.code) links.push(`<a class="link" href="${p.links.code}" target="_blank" rel="noopener">Code</a>`);
    if (p.links?.doi) links.push(`<a class="link" href="${p.links.doi}" target="_blank" rel="noopener">DOI</a>`);

    return `
      <div class="pub-head">
        <div class="pub-title">${title}</div>
        <div class="pub-meta muted">${authors}</div>
      </div>
      <div class="pub-sub muted">
        <span class="pill">${year}</span>
        <span class="pill pill2">${venue}</span>
        ${p.type ? `<span class="pill pill3">${safeText(p.type)}</span>` : ""}
      </div>
      ${kw ? `<div class="tag-row">${kw}</div>` : ""}
      ${links.length ? `<div class="link-row">${links.join("")}</div>` : ""}
    `;
  };

  const render = () => {
    const q = (search?.value || "").trim().toLowerCase();
    const y = (yearSelect?.value || "").trim();
    const t = (typeSelect?.value || "").trim();

    list.innerHTML = "";
    pubs
      .filter(p => {
        const hay = `${p.title} ${p.venue} ${(p.authors||[]).join(" ")} ${(p.keywords||[]).join(" ")}`.toLowerCase();
        const matchQ = !q || hay.includes(q);
        const matchY = !y || String(p.year) === y;
        const matchT = !t || (p.type || "") === t;
        return matchQ && matchY && matchT;
      })
      .forEach(p => {
        const li = el("li", "pub glass");
        li.innerHTML = toHTML(p);
        list.appendChild(li);
      });
  };

  search?.addEventListener("input", render);
  yearSelect?.addEventListener("change", render);
  typeSelect?.addEventListener("change", render);

  render();
}

function renderMembers(members) {
  const piGrid = document.getElementById("piGrid");
  const studentGrid = document.getElementById("studentGrid");
  const alumniGrid = document.getElementById("alumniGrid");

  const renderCard = (m) => {
  const card = el("article", "member card glass");

  // photo or fallback avatar
  let left;
  if (m.photo && String(m.photo).trim().length > 0) {
    const img = document.createElement("img");
    img.className = "avatar-img";
    img.src = m.photo;
    img.alt = `${m.name || "Member"} photo`;
    img.loading = "lazy";
    img.decoding = "async";
    left = img;
  } else {
    const avatar = el("div", "avatar");
    avatar.textContent = (m.name || "M").trim().slice(0, 2).toUpperCase();
    left = avatar;
  }

  const body = el("div", "");
  body.appendChild(el("div", "card-title", safeText(m.name)));
  body.appendChild(el("p", "muted", safeText(`${m.role || ""}${m.bio ? " · " + m.bio : ""}`)));

  if (Array.isArray(m.links) && m.links.length) {
    const row = el("div", "link-row");
    m.links.forEach(l => {
      const a = el("a", "link", safeText(l.label));
      a.href = l.href;
      if (/^https?:\/\//.test(l.href)) { a.target = "_blank"; a.rel = "noopener"; }
      row.appendChild(a);
    });
    body.appendChild(row);
  }

  card.appendChild(left);
  card.appendChild(body);
  return card;
  };

  if (piGrid) {
    piGrid.innerHTML = "";
    (members.pi || []).forEach(m => piGrid.appendChild(renderCard(m)));
  }
  if (studentGrid) {
    studentGrid.innerHTML = "";
    (members.students || []).forEach(m => studentGrid.appendChild(renderCard(m)));
  }
  if (alumniGrid) {
    alumniGrid.innerHTML = "";
    (members.alumni || []).forEach(m => alumniGrid.appendChild(renderCard(m)));
  }
}

function renderGallery(items) {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  const tagSelect = document.getElementById("galleryTag");
  const search = document.getElementById("gallerySearch");

  // tags
  const allTags = new Set();
  items.forEach(it => (it.tags || []).forEach(t => allTags.add(t)));
  if (tagSelect) {
    [...allTags].sort().forEach(t => {
      const opt = document.createElement("option");
      opt.value = t; opt.textContent = t;
      tagSelect.appendChild(opt);
    });
  }

  // lightbox refs
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbTitle = document.getElementById("lightboxTitle");
  const lbDesc = document.getElementById("lightboxDesc");
  const lbTags = document.getElementById("lightboxTags");
  const btnPrev = document.getElementById("lbPrev");
  const btnNext = document.getElementById("lbNext");

  let current = 0;
  let filtered = [...items];

  const openLB = (idx) => {
    current = Math.max(0, Math.min(idx, filtered.length - 1));
    const it = filtered[current];

    lbImg.src = it.src;
    lbImg.alt = it.title ? it.title : "gallery image";
    lbTitle.textContent = it.title || "";
    lbDesc.textContent = it.desc || (it.date ? it.date : "");
    lbTags.innerHTML = "";
    (it.tags || []).forEach(t => {
      const s = document.createElement("span");
      s.className = "tag";
      s.textContent = t;
      lbTags.appendChild(s);
    });

    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  };

  const closeLB = () => {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    // prevent flicker on next open
    lbImg.src = "";
  };

  const go = (delta) => {
    if (!filtered.length) return;
    const next = (current + delta + filtered.length) % filtered.length;
    openLB(next);
  };

  // close handlers
  lb?.addEventListener("click", (e) => {
    if (e.target && e.target.dataset && e.target.dataset.close === "1") closeLB();
  });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  });
  btnPrev?.addEventListener("click", () => go(-1));
  btnNext?.addEventListener("click", () => go(1));

  const render = () => {
    const q = (search?.value || "").trim().toLowerCase();
    const tag = (tagSelect?.value || "").trim();

    filtered = items.filter(it => {
      const hay = `${it.title || ""} ${it.desc || ""} ${it.date || ""} ${(it.tags || []).join(" ")}`.toLowerCase();
      const matchQ = !q || hay.includes(q);
      const matchT = !tag || (it.tags || []).includes(tag);
      return matchQ && matchT;
    });

    grid.innerHTML = "";
    filtered.forEach((it, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "gallery-item";
      card.setAttribute("aria-label", `${it.title || "Photo"} 확대보기`);

      const img = document.createElement("img");
      img.className = "gallery-thumb";
      img.src = it.thumb || it.src;
      img.alt = it.title || "Gallery photo";
      img.loading = "lazy";
      img.decoding = "async";

      const cap = document.createElement("div");
      cap.className = "gallery-cap";
      cap.innerHTML = `
        <div class="gallery-title">${safeText(it.title || "")}</div>
        <div class="gallery-sub muted">${safeText(it.date || "")}</div>
      `;

      card.appendChild(img);
      card.appendChild(cap);
      card.addEventListener("click", () => openLB(idx));
      grid.appendChild(card);
    });

    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "card";
      empty.innerHTML = `<div class="card-title">No results</div><p class="muted">검색 조건을 바꿔보세요.</p>`;
      grid.appendChild(empty);
    }
  };

  search?.addEventListener("input", render);
  tagSelect?.addEventListener("change", render);

  render();
}

function renderContact(site) {
  const contactCard = document.getElementById("contactCard");
  const recruitCard = document.getElementById("recruitCard");
  if (!contactCard || !recruitCard) return;

  const addr = (site.contact.addressLines || []).map(l => `<div>${safeText(l)}</div>`).join("");

  const links = (site.contact.links || []).map(l => {
    const ext = /^https?:\/\//.test(l.href);
    return `<a class="link" href="${l.href}" ${ext ? 'target="_blank" rel="noopener"' : ""}>${safeText(l.label)}</a>`;
  }).join("");

  contactCard.innerHTML = `
    <div class="card-title">Address</div>
    <div class="muted">${addr}</div>
    <div class="spacer"></div>
    <div class="card-title">Email</div>
    <div class="muted"><a class="link" href="mailto:${safeText(site.contact.email)}">${safeText(site.contact.email)}</a></div>
    <div class="spacer"></div>
    <div class="card-title">Links</div>
    <div class="link-row">${links || '<span class="muted">-</span>'}</div>
  `;

  recruitCard.innerHTML = `
    <div class="card-title">${safeText(site.recruiting.title || "Join Us")}</div>
    <p class="muted">${safeText(site.recruiting.body || "")}</p>
    <ul class="bullets">
      ${(site.recruiting.items || []).map(it => `<li>${safeText(it)}</li>`).join("")}
    </ul>
  `;
}

async function main() {
  setYear();
  setupMobileNav();

  const site = await fetchJSON("data/site.json");
  applySiteBranding(site);

  const page = document.body.getAttribute("data-page");
  if (page === "home") {
    renderHero(site);
    const news = await fetchJSON("data/news.json");
    renderNews(news);
  } else if (page === "members") {
    const members = await fetchJSON("data/members.json");
    renderMembers(members);
  } else if (page === "projects") {
    const projects = await fetchJSON("data/projects.json");
    renderProjects(projects);
  } else if (page === "publications") {
    const pubs = await fetchJSON("data/publications.json");
    renderPublications(pubs);
  } else if (page === "gallery") {
    const items = await fetchJSON("data/gallery.json");
    renderGallery(items);
  } else if (page === "contact") {
    renderContact(site);
  }
}

main().catch((e) => {
  console.error(e);
  const mainEl = document.getElementById("main");
  if (mainEl) {
    const err = document.createElement("div");
    err.className = "container page";
    err.innerHTML = `<div class="card glass"><div class="card-title">Error</div><p class="muted">${safeText(e.message)}</p></div>`;
    mainEl.prepend(err);
  }
});


