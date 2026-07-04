/**
 * Legal pages — loads Privacy Policy / Terms from JSON (LGPD)
 */

const LEGAL_LANGS = ['pt', 'en', 'es'];
let legalLang = 'pt';
let legalData = null;

const DOC_TYPE = document.body.dataset.doc; // 'privacy' | 'terms'

async function initLegal() {
  const saved = localStorage.getItem('lang') || detectLegalLang();
  await loadLegalContent(saved);
  setupLegalListeners();
}

function detectLegalLang() {
  const browser = navigator.language?.split('-')[0] || 'pt';
  return LEGAL_LANGS.includes(browser) ? browser : 'pt';
}

async function loadLegalContent(lang) {
  try {
    const res = await fetch(`data/legal.${lang}.json?v=${Date.now()}`);
    if (!res.ok) throw new Error(`Failed to load legal.${lang}.json`);
    legalData = await res.json();
    legalLang = lang;
    localStorage.setItem('lang', lang);
    renderLegalPage();
    updateLegalLangSwitcher();
  } catch (err) {
    console.error('Legal content load error:', err);
    if (lang !== 'pt') await loadLegalContent('pt');
  }
}

function interpolate(text, vars) {
  if (!text) return '';
  return text
    .replace(/\{controller_name\}/g, vars.controller_name)
    .replace(/\{controller_email\}/g, vars.controller_email)
    .replace(/\{controller_cnpj\}/g, vars.controller_cnpj || '')
    .replace(/\{site_url\}/g, vars.site_url)
    .replace(/\{site_name\}/g, vars.site_name)
    .replace(/\{year\}/g, vars.year);
}

function linkify(text) {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

function emailify(text, email) {
  return text.replace(
    email,
    `<a href="mailto:${email}">${email}</a>`
  );
}

function formatParagraph(text, meta) {
  const year = new Date().getFullYear();
  const vars = { ...meta, year };
  let out = interpolate(text, vars);
  out = emailify(out, meta.controller_email);
  out = linkify(out);
  return out;
}

function renderSection(section, meta) {
  let html = `<section class="legal-section"><h2>${section.heading}</h2>`;

  (section.paragraphs || []).forEach(p => {
    html += `<p>${formatParagraph(p, meta)}</p>`;
  });

  if (section.list?.length) {
    html += '<ul>';
    section.list.forEach(item => {
      html += `<li>${formatParagraph(item, meta)}</li>`;
    });
    html += '</ul>';
  }

  (section.paragraphs_after || []).forEach(p => {
    html += `<p>${formatParagraph(p, meta)}</p>`;
  });

  html += '</section>';
  return html;
}

function renderLegalPage() {
  if (!legalData) return;

  const doc = legalData[DOC_TYPE];
  if (!doc) return;

  const { meta, nav, footer } = legalData;
  document.documentElement.lang = legalData.lang;
  document.title = `${doc.title} — ${meta.site_name}`;

  const metaDesc = document.getElementById('legal-meta-desc');
  if (metaDesc) metaDesc.setAttribute('content', doc.subtitle);

  const logo = document.getElementById('legal-logo');
  if (logo) logo.textContent = 'CS.DEV';

  const backLink = document.getElementById('legal-back');
  if (backLink) {
    backLink.href = 'index.html';
    backLink.textContent = nav.back_home;
  }

  const navPrivacy = document.getElementById('legal-nav-privacy');
  const navTerms = document.getElementById('legal-nav-terms');
  if (navPrivacy) {
    navPrivacy.href = 'politica-de-privacidade.html';
    navPrivacy.textContent = nav.privacy;
    navPrivacy.classList.toggle('active', DOC_TYPE === 'privacy');
  }
  if (navTerms) {
    navTerms.href = 'termos-de-uso.html';
    navTerms.textContent = nav.terms;
    navTerms.classList.toggle('active', DOC_TYPE === 'terms');
  }

  const content = document.getElementById('legal-content');
  if (content) {
    const sections = doc.sections.map(s => renderSection(s, meta)).join('');
    content.innerHTML = `
      <header class="legal-header">
        <h1>${doc.title}</h1>
        <p class="legal-subtitle">${doc.subtitle}</p>
        <p class="legal-updated">${doc.last_updated}</p>
      </header>
      ${sections}
    `;
  }

  const footerEl = document.getElementById('legal-footer');
  if (footerEl) {
    footerEl.innerHTML = `
      <p>${formatParagraph(footer.text, meta)}</p>
      <nav class="legal-footer-links" aria-label="Legal">
        <a href="politica-de-privacidade.html"${DOC_TYPE === 'privacy' ? ' aria-current="page"' : ''}>${footer.privacy_link}</a>
        <span aria-hidden="true">·</span>
        <a href="termos-de-uso.html"${DOC_TYPE === 'terms' ? ' aria-current="page"' : ''}>${footer.terms_link}</a>
      </nav>
    `;
  }
}

function updateLegalLangSwitcher() {
  LEGAL_LANGS.forEach(lang => {
    const btn = document.getElementById(`legal-lang-${lang}`);
    if (btn) btn.classList.toggle('active', lang === legalLang);
  });
}

function setupLegalListeners() {
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('legal-nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

document.addEventListener('DOMContentLoaded', initLegal);
