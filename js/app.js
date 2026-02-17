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

// ─── EDUCATION & CERTIFICATIONS ────────────────────────────────────────────────

function renderEducation() {
  const { education } = data;
  if (!education) return;

  setText('education-title', education.title);

  const container = document.getElementById('education-list');
  if (!container) return;

  container.innerHTML = education.items.map(item => `
    <div class="edu-card">
      <div class="edu-header">
        <span class="edu-type">${item.type_label || item.type || ''}</span>
        ${item.period ? `<span class="edu-period">${item.period}</span>` : ''}
      </div>
      <div class="edu-main">
        <div class="edu-course">${item.course || item.label || ''}</div>
        ${item.institution ? `<div class="edu-institution">${item.institution}</div>` : ''}
      </div>
      ${item.details ? `<p class="edu-details">${item.details}</p>` : ''}
      ${item.certificates && item.certificates.length
        ? `<ul class="edu-cert-list">
            ${item.certificates.map(c => `<li><span class="check-icon">✓</span>${c}</li>`).join('')}
          </ul>`
        : ''
      }
    </div>
  `).join('');
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
