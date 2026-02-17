/**
 * Portfolio CMS — app.js
 * Loads content from JSON and renders the page dynamically
 */

const LANGS = ['pt', 'en', 'es'];
let currentLang = 'pt';
let data = null;
let chatHistory = [];

// ─── INIT ─────────────────────────────────────────────────────────────────────

async function init() {
  const savedLang = localStorage.getItem('lang') || detectBrowserLang();
  await loadContent(savedLang);
  setupEventListeners();
  animateOnScroll();
}

function detectBrowserLang() {
  const browserLang = navigator.language?.split('-')[0] || 'pt';
  return LANGS.includes(browserLang) ? browserLang : 'pt';
}

// ─── CONTENT LOADING ──────────────────────────────────────────────────────────

async function loadContent(lang) {
  try {
    const res = await fetch(`data/content.${lang}.json?v=${Date.now()}`);
    if (!res.ok) throw new Error(`Failed to load content.${lang}.json`);
    data = await res.json();
    currentLang = lang;
    localStorage.setItem('lang', lang);
    renderAll();
    updateLangSwitcher();
  } catch (err) {
    console.error('Content load error:', err);
    if (lang !== 'pt') await loadContent('pt');
  }
}

// ─── RENDER ALL ───────────────────────────────────────────────────────────────

function renderAll() {
  document.title = data.meta.title;
  document.documentElement.lang = data.lang;
  renderNav();
  renderHero();
  renderStack();
  renderProjects();
  renderExperience();
  renderSkills();
  renderEducation();
  renderContact();
  renderAIChat();
  renderMobileMenu();
  renderHeroStackMini();
}

function renderMobileMenu() {
  const mobile = document.getElementById('mobile-menu');
  const desktop = document.getElementById('nav-links');
  if (!mobile || !desktop || !data?.nav) return;

  const links = data.nav.links.map(link =>
    `<a href="${link.href}" class="nav-link">${link.label}</a>`
  ).join('');

  const langSwitcher = `
    <div class="lang-switcher" style="margin-top:8px;">
      <button class="lang-btn ${currentLang==='pt'?'active':''}" onclick="loadContent('pt')">PT</button>
      <button class="lang-btn ${currentLang==='en'?'active':''}" onclick="loadContent('en')">EN</button>
      <button class="lang-btn ${currentLang==='es'?'active':''}" onclick="loadContent('es')">ES</button>
    </div>
  `;
  mobile.innerHTML = links + langSwitcher;
}

function renderHeroStackMini() {
  const miniEl = document.getElementById('hero-stack-mini');
  if (!miniEl || !data?.stack) return;
  const techs = data.stack.categories.flatMap(c => c.items).slice(0, 5);
  miniEl.innerHTML = techs.map(t => `
    <div style="display:flex; align-items:center; gap:8px;">
      <div style="width:6px; height:6px; background:var(--neon-green); border-radius:50%; box-shadow: 0 0 6px var(--neon-green);"></div>
      <span style="font-size:0.78rem; color:var(--text-secondary); font-family:var(--font-mono);">${t.name}</span>
    </div>
  `).join('');
}

// ─── NAV ──────────────────────────────────────────────────────────────────────

function renderNav() {
  const linksEl = document.getElementById('nav-links');
  if (!linksEl || !data.nav) return;
  linksEl.innerHTML = data.nav.links.map(link =>
    `<a href="${link.href}" class="nav-link">${link.label}</a>`
  ).join('');
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function renderHero() {
  const { hero, meta } = data;
  setText('hero-name', hero.name);
  setText('hero-role', hero.role);
  setText('hero-bio', hero.bio);
  setAttr('hero-cv-btn', 'href', meta.cv_url);
  setText('hero-cv-btn', hero.cta_cv);
  setText('hero-projects-btn', hero.cta_projects);
  setText('hero-contact-btn', hero.cta_contact);
  setAttr('hero-linkedin', 'href', meta.linkedin);
  setAttr('hero-github', 'href', meta.github);
  setAttr('hero-email', 'href', `mailto:${meta.email}`);
  setText('hero-email-text', meta.email);

  const photo = document.getElementById('hero-photo-frame');
  if (photo && hero.photo) {
    photo.src = hero.photo;
    photo.alt = hero.name;
  }
}

// ─── STACK ────────────────────────────────────────────────────────────────────

function renderStack() {
  const { stack } = data;
  setText('stack-title', stack.title);
  const container = document.getElementById('stack-grid');
  if (!container) return;
  container.innerHTML = stack.categories.map(cat => `
    <div class="stack-category">
      <div class="stack-category-label">${cat.label}</div>
      <div class="stack-items">
        ${cat.items.map(item => `
          <div class="stack-item" title="${item.name}">
            ${item.icon
              ? `<i class="${item.icon} colored" style="color:${item.color}; font-size:1.6rem;"></i>`
              : `<span class="stack-text-badge" style="color:${item.color}; border-color:${item.color};">${item.text || item.name}</span>`
            }
            <span class="stack-item-name">${item.name}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

function renderProjects() {
  const { projects } = data;
  setText('projects-title', projects.title);
  setText('projects-more-btn', projects.cta_more);

  const container = document.getElementById('projects-grid');
  if (!container) return;
  container.innerHTML = projects.items.map((p, i) => `
    <article class="project-card gradient-${p.gradient}" style="animation-delay:${i * 0.1}s">
      <div class="project-icon">${p.icon}</div>
      <div class="project-header">
        <h3>${p.title}</h3>
        <span class="stack-badge">${p.stack_label}</span>
        <div class="project-stack">
          ${p.stack.map(s => `<span class="tech-tag">${s}</span>`).join('')}
        </div>
      </div>
      <ul class="project-achievements">
        ${p.achievements.map(a => `<li><span class="check-icon">✓</span>${a}</li>`).join('')}
      </ul>
    </article>
  `).join('');
}

// ─── EXPERIENCE ───────────────────────────────────────────────────────────────

function renderExperience() {
  const { experience } = data;
  setText('experience-title', experience.title);
  const container = document.getElementById('experience-list');
  if (!container) return;
  container.innerHTML = experience.items.map(exp => `
    <div class="exp-card">
      <div class="exp-header">
        <div>
          <span class="exp-role">${exp.role}</span>
          <span class="exp-separator">·</span>
          <span class="exp-company">${exp.company}</span>
        </div>
        <span class="exp-period">${exp.period}</span>
      </div>
      <ul class="exp-achievements">
        ${exp.achievements.map(a => `<li><span class="check-icon">✓</span>${a}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

// ─── SKILLS ───────────────────────────────────────────────────────────────────

function renderSkills() {
  const { skills } = data;
  setText('skills-title', skills.title);
  const container = document.getElementById('skills-list');
  if (!container) return;
  container.innerHTML = skills.items.map(skill => `
    <div class="skill-item">
      <span class="skill-check">✓</span>
      <span>${skill}</span>
    </div>
  `).join('');
}

// ─── EDUCATION TIMELINE ───────────────────────────────────────────────────────
// JSON structure expected:
// education.timeline = [
//   { year, color, type?, achievements: [{ icon, type, title, institution, details, tags }] }
// ]

let _tlIndex = 0;          // active year-node index
let _achIndex = 0;         // active achievement index within the year

function renderEducation() {
  const { education } = data;
  if (!education) return;

  setText('education-title', education.title);
  _tlIndex  = 0;
  _achIndex = 0;

  const years = education.timeline || [];
  if (!years.length) return;

  const container = document.getElementById('education-list');
  if (!container) return;

  // ── Year nodes on the rail ──────────────────────────────────────────────────
  const nodes = years.map((yr, i) => {
    const c        = tlColor(yr.color);
    const isFuture = yr.type === 'future';
    const count    = yr.achievements?.length || 0;
    const badge    = count > 1 ? `<span class="tl-node-badge">${count}</span>` : '';
    return `
      <div class="tl-node${isFuture ? ' tl-node--future' : ''}"
           data-index="${i}" style="--node-color:${c}"
           onclick="tlGoTo(${i},0)" role="button" tabindex="0"
           aria-label="${yr.year}: ${count} conquista${count !== 1 ? 's' : ''}">
        <div class="tl-node-dot">
          <span class="tl-node-icon">${yr.achievements?.[0]?.icon || '📌'}</span>
          ${badge}
        </div>
        <span class="tl-node-year">${yr.year}</span>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="tl-rail-wrap">
      <div class="tl-line"></div>
      <div class="tl-nodes" id="tl-nodes">${nodes}</div>
    </div>

    <div class="tl-detail" id="tl-detail">
      <button class="tl-arrow tl-arrow--left"  id="tl-prev" onclick="tlNav(-1)" aria-label="Anterior">&#8592;</button>
      <div class="tl-card-wrap" id="tl-card-wrap"></div>
      <button class="tl-arrow tl-arrow--right" id="tl-next" onclick="tlNav(1)"  aria-label="Próximo">&#8594;</button>
    </div>`;

  tlGoTo(0, 0);

  // keyboard support
  container.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') tlNav(1);
    if (e.key === 'ArrowLeft')  tlNav(-1);
  });
}

// ── Navigate year nodes (dir = ±1 over ALL achievements across years) ──────────
function tlNav(dir) {
  const years = data?.education?.timeline;
  if (!years) return;

  const yr  = years[_tlIndex];
  const len = yr.achievements?.length || 1;

  // try to move within current year's achievements first
  const nextAch = _achIndex + dir;
  if (nextAch >= 0 && nextAch < len) {
    tlGoTo(_tlIndex, nextAch);
  } else {
    // move to adjacent year
    const nextYear = _tlIndex + dir;
    if (nextYear >= 0 && nextYear < years.length) {
      // land on last achievement when going left, first when going right
      const landAch = dir > 0 ? 0 : (years[nextYear].achievements?.length || 1) - 1;
      tlGoTo(nextYear, landAch);
    }
  }
}

// ── Go to a specific year node + achievement index ──────────────────────────────
function tlGoTo(yearIndex, achIndex = 0) {
  const years = data?.education?.timeline;
  if (!years) return;

  _tlIndex  = Math.max(0, Math.min(yearIndex, years.length - 1));
  const yr  = years[_tlIndex];
  const len = yr.achievements?.length || 1;
  _achIndex = Math.max(0, Math.min(achIndex, len - 1));

  // ── update rail nodes ──
  document.querySelectorAll('.tl-node').forEach((n, i) =>
    n.classList.toggle('active', i === _tlIndex)
  );

  // ── update arrows: disabled only at absolute ends ──
  const isFirstYear = _tlIndex === 0;
  const isLastYear  = _tlIndex === years.length - 1;
  const prev = document.getElementById('tl-prev');
  const next = document.getElementById('tl-next');
  if (prev) prev.disabled = isFirstYear && _achIndex === 0;
  if (next) next.disabled = isLastYear  && _achIndex === len - 1;

  // ── render card ──
  tlRenderCard(yr, _achIndex);

  // scroll active node into view on mobile
  const activeNode = document.querySelector('.tl-node.active');
  if (activeNode) activeNode.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
}

// ── Render the detail card for a year + achievement ────────────────────────────
function tlRenderCard(yr, achIdx) {
  const wrap = document.getElementById('tl-card-wrap');
  if (!wrap) return;

  const c        = tlColor(yr.color);
  const isFuture = yr.type === 'future';
  const ach      = yr.achievements?.[achIdx] || {};
  const years    = data?.education?.timeline || [];
  const totalAch = yr.achievements?.length || 1;

  // ── achievement sub-nav dots (within this year) ──
  const achDots = totalAch > 1
    ? `<div class="tl-ach-nav">
        ${yr.achievements.map((a, i) => `
          <button class="tl-ach-dot${i === achIdx ? ' active' : ''}"
                  style="${i === achIdx ? '--dot-color:'+c : ''}"
                  onclick="tlGoTo(${_tlIndex},${i})"
                  aria-label="${a.title}">
          </button>`).join('')}
       </div>`
    : '';

  // ── year progress bar across all year nodes ──
  const yearDots = years.map((y, i) => {
    const yc = tlColor(y.color);
    return `<span class="tl-dot${i === _tlIndex ? ' active' : ''}"
                  style="${i === _tlIndex ? '--dot-color:'+yc : ''}"
                  onclick="tlGoTo(${i},0)"
                  title="${y.year}"></span>`;
  }).join('');

  wrap.innerHTML = `
    <div class="tl-card${isFuture ? ' tl-card--future' : ''}" style="--card-color:${c}">

      <div class="tl-card-top">
        <span class="tl-card-icon">${ach.icon || '📌'}</span>
        <div class="tl-card-meta">
          <span class="tl-card-year" style="color:${c}">${yr.year}</span>
          <span class="tl-card-type">${ach.type || ''}</span>
        </div>
        ${isFuture ? `<span class="tl-future-badge">Em andamento</span>` : ''}
        ${totalAch > 1 ? `<span class="tl-count-badge" style="border-color:${c};color:${c}">${achIdx + 1}/${totalAch}</span>` : ''}
      </div>

      <h3 class="tl-card-title">${ach.title || ''}</h3>
      ${ach.institution ? `<p class="tl-card-institution">🏛 ${ach.institution}</p>` : ''}
      ${ach.details     ? `<p class="tl-card-details">${ach.details}</p>` : ''}

      ${ach.tags?.length ? `
        <div class="tl-card-tags">
          ${ach.tags.map(t => `<span class="tl-tag" style="border-color:${c};color:${c}">${t}</span>`).join('')}
        </div>` : ''}

      ${achDots}

      <div class="tl-card-progress">${yearDots}</div>
    </div>`;

  // fade-in animation
  requestAnimationFrame(() => {
    const card = wrap.querySelector('.tl-card');
    if (!card) return;
    card.style.cssText += 'opacity:0;transform:translateY(10px);';
    requestAnimationFrame(() => {
      card.style.cssText += 'transition:opacity .3s ease,transform .3s ease;opacity:1;transform:translateY(0);';
    });
  });
}

// ── Color helper ────────────────────────────────────────────────────────────────
function tlColor(key) {
  return { green:'var(--neon-green)', purple:'var(--neon-purple)', cyan:'var(--neon-cyan)' }[key]
      || 'var(--neon-green)';
}


// ─── CONTACT ──────────────────────────────────────────────────────────────────

function renderContact() {
  const { contact, meta } = data;
  setText('contact-title', contact.title);
  setText('contact-subtitle', contact.subtitle);
  setText('contact-cta-btn', contact.cta);
  setAttr('contact-email-link', 'href', `mailto:${meta.email}`);
  setAttr('contact-linkedin-link', 'href', meta.linkedin);
  setAttr('contact-cta-btn', 'href', `mailto:${meta.email}`);
}

// ─── AI CHAT ──────────────────────────────────────────────────────────────────

function renderAIChat() {
  const { ai_chat } = data;
  setText('chat-trigger-label', ai_chat.trigger_label);
  setText('chat-modal-title', ai_chat.title);
  setText('chat-modal-subtitle', ai_chat.subtitle);
  setAttr('chat-input', 'placeholder', ai_chat.placeholder);

  const suggestionsEl = document.getElementById('chat-suggestions');
  if (suggestionsEl) {
    suggestionsEl.innerHTML = ai_chat.suggestions.map(s => `
      <button class="chat-suggestion" onclick="sendSuggestion('${s.replace(/'/g, "\\'")}')">
        ${s} <span>›</span>
      </button>
    `).join('');
  }

  // Show greeting if no history
  if (chatHistory.length === 0) {
    addBotMessage(ai_chat.greeting);
  }
}

// ─── CHAT FUNCTIONALITY ───────────────────────────────────────────────────────

function toggleChat() {
  const modal = document.getElementById('chat-modal');
  const overlay = document.getElementById('chat-overlay');
  const isOpen = modal.classList.contains('open');

  if (isOpen) {
    modal.classList.remove('open');
    overlay.classList.remove('active');
  } else {
    modal.classList.add('open');
    overlay.classList.add('active');
    renderAIChat();
  }
}

function closeChat() {
  document.getElementById('chat-modal').classList.remove('open');
  document.getElementById('chat-overlay').classList.remove('active');
}

function sendSuggestion(text) {
  hideSuggestions();
  sendMessage(text);
}

function hideSuggestions() {
  const el = document.getElementById('chat-suggestions');
  if (el) el.style.display = 'none';
}

function addUserMessage(text) {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-message user';
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addBotMessage(text) {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-message bot';
  div.innerHTML = parseMd(text);
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-message bot typing-indicator';
  div.id = 'typing-indicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function parseMd(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

async function sendMessage(userText) {
  if (!userText?.trim()) return;
  hideSuggestions();
  addUserMessage(userText);
  chatHistory.push({ role: 'user', content: userText });

  const input = document.getElementById('chat-input');
  if (input) input.value = '';

  showTyping();

  // Placeholder for n8n webhook — replace N8N_WEBHOOK_URL with your actual endpoint
  const N8N_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/portfolio-chat';

  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        history: chatHistory.slice(-10),
        lang: currentLang,
        context: buildContext()
      })
    });

    hideTyping();

    if (!res.ok) throw new Error('Webhook error');
    const json = await res.json();
    const reply = json.reply || json.message || json.output || 'Resposta não disponível.';
    addBotMessage(reply);
    chatHistory.push({ role: 'assistant', content: reply });

  } catch (err) {
    hideTyping();
    console.error('Chat error:', err);
    addBotMessage(getFallbackMessage(userText));
  }
}

function buildContext() {
  if (!data) return {};
  return {
    name: data.hero.name,
    role: data.hero.role,
    bio: data.hero.bio,
    stack: data.stack.categories.flatMap(c => c.items.map(i => i.name)),
    projects: data.projects.items.map(p => p.title),
    email: data.meta.email
  };
}

function getFallbackMessage(question) {
  const q = question.toLowerCase();
  if (!data) return 'Serviço temporariamente indisponível.';
  const { hero, meta } = data;

  if (q.includes('contact') || q.includes('contato') || q.includes('email')) {
    return `Você pode entrar em contato pelo email **${meta.email}** ou pelo LinkedIn.`;
  }
  if (q.includes('technolog') || q.includes('tecnolog') || q.includes('stack')) {
    const techs = data.stack.categories.flatMap(c => c.items.map(i => i.name)).join(', ');
    return `${hero.name} trabalha com: **${techs}**.`;
  }
  if (q.includes('project') || q.includes('projeto')) {
    const projs = data.projects.items.map(p => p.title).join(', ');
    return `Projetos em destaque: **${projs}**.`;
  }
  return `Sou o assistente do **${hero.name}**. ${hero.bio} Como posso te ajudar?`;
}

function handleChatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    sendMessage(input.value.trim());
  }
}

// ─── LANG SWITCHER ────────────────────────────────────────────────────────────

function updateLangSwitcher() {
  LANGS.forEach(lang => {
    const btn = document.getElementById(`lang-${lang}`);
    if (btn) {
      btn.classList.toggle('active', lang === currentLang);
    }
  });
}

// ─── SCROLL ANIMATIONS ────────────────────────────────────────────────────────

function animateOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, value);
}

// ─── NAV SCROLL ───────────────────────────────────────────────────────────────

function setupEventListeners() {
  // Sticky nav
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('main-nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Mobile menu
  const burger = document.getElementById('burger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      burger.classList.toggle('active');
    });
    mobileMenu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') mobileMenu.classList.remove('open');
    });
  }

  // Chat input
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', handleChatKeydown);
  }

  // Chat send button
  const sendBtn = document.getElementById('chat-send-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const input = document.getElementById('chat-input');
      sendMessage(input?.value?.trim());
    });
  }

  // Overlay click
  const overlay = document.getElementById('chat-overlay');
  if (overlay) overlay.addEventListener('click', closeChat);

  // Smooth scroll for anchor links
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// ─── START ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);
