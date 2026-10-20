'use strict';

// Все проекты редактируются здесь. category: design или dimensional.
// section определяет книгу: design, volume или games.
// image: относительный путь, например './images/poster.jpg'; пустая строка — CSS-заглушка.
// Заполните title, description и пять полей details своим текстом.
const projects = [
  { id: 'design-1', title: 'Место для будущей работы', category: 'design', section: 'design', image: '', description: 'Здесь появится описание проекта.', details: { task: '', idea: '', role: '', process: '', result: '' } },
  { id: 'design-2', title: 'Место для будущей работы', category: 'design', section: 'design', image: '', description: 'Здесь появится описание проекта.', details: { task: '', idea: '', role: '', process: '', result: '' } },
  { id: 'volume-1', title: 'Место для будущей работы', category: 'dimensional', section: 'volume', image: '', description: 'Здесь появится описание проекта.', details: { task: '', idea: '', role: '', process: '', result: '' } },
  { id: 'games-1', title: 'Место для будущей работы', category: 'dimensional', section: 'games', image: '', description: 'Здесь появится описание проекта.', details: { task: '', idea: '', role: '', process: '', result: '' } }
];

// Контакты: заполните email и/или добавьте { label: 'Название', url: 'https://...' }.
const contacts = { email: '', socials: [] };
const categories = { design: 'Дизайн', dimensional: '3D / игры' };
const bookTitles = { about: '01 / Знакомство', design: '02 / Дизайн', volume: '03 / Объём', games: '04 / Игры и код', contact: '05 / На связи' };
const $ = (selector) => document.querySelector(selector);
const bookDialog = $('#book-dialog');
const projectDialog = $('#project-dialog');
const spread = $('#spread');
const desktop = window.matchMedia('(min-width: 801px)');
let pages = [];
let pageIndex = 0;
let bookOpener = null;
let projectOpener = null;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  $('.theme-toggle').setAttribute('aria-pressed', String(dark));
  $('.theme-toggle').setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
  $('.theme-label').textContent = dark ? 'Светлая тема' : 'Тёмная тема';
}
try {
  const saved = localStorage.getItem('daria-library-theme');
  applyTheme(saved === 'dark' || saved === 'light' ? saved : 'light');
} catch { applyTheme('light'); }
$('.theme-toggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('daria-library-theme', next); } catch { /* Тема работает и без хранилища. */ }
});

function closeMenu() {
  $('.menu-toggle').setAttribute('aria-expanded', 'false');
  $('#navigation').classList.remove('is-open');
}
$('.menu-toggle').addEventListener('click', () => {
  const expanded = $('.menu-toggle').getAttribute('aria-expanded') === 'true';
  $('.menu-toggle').setAttribute('aria-expanded', String(!expanded));
  $('#navigation').classList.toggle('is-open', !expanded);
});
$('#navigation').addEventListener('click', (event) => {
  if (event.target.closest('button, a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !bookDialog.open && !projectDialog.open && $('.menu-toggle').getAttribute('aria-expanded') === 'true') {
    closeMenu();
    $('.menu-toggle').focus();
  }
});
desktop.addEventListener('change', () => { closeMenu(); if (bookDialog.open) renderSpread(); });

function projectPreview(project, index) {
  const preview = element('div', 'project-preview');
  function placeholder() {
    preview.classList.remove('has-image');
    preview.replaceChildren(element('span', 'placeholder-number', String(index + 1).padStart(2, '0')), element('span', 'placeholder-label', 'Место для будущей работы'));
    preview.setAttribute('aria-hidden', 'true');
  }
  placeholder();
  if (project.image) {
    const image = element('img');
    image.alt = project.title;
    image.loading = 'lazy';
    image.addEventListener('load', () => { preview.removeAttribute('aria-hidden'); preview.classList.add('has-image'); preview.replaceChildren(image); }, { once: true });
    image.addEventListener('error', placeholder, { once: true });
    image.src = project.image;
  }
  return preview;
}

function projectCard(project) {
  const index = projects.indexOf(project);
  const card = element('article', 'project-card');
  const info = element('div', 'project-info');
  const copy = element('div');
  copy.append(element('span', 'project-category', categories[project.category] || project.category), element('h3', '', project.title), element('p', 'project-description', project.description));
  const button = element('button', 'project-more', 'Подробнее ↗');
  button.type = 'button';
  button.setAttribute('aria-label', `Подробнее: ${project.title}, ${categories[project.category] || project.category}, ${index + 1}`);
  button.addEventListener('click', () => openProject(project, button));
  info.append(copy, button);
  card.append(projectPreview(project, index), info);
  return card;
}

function renderProjects(filter = 'all') {
  const selected = projects.filter((project) => filter === 'all' || project.category === filter);
  $('#project-grid').replaceChildren(...selected.map(projectCard));
  $('#empty-state').hidden = selected.length > 0;
  $('#project-count').textContent = `Показано: ${selected.length} из ${projects.length}`;
  document.querySelectorAll('[data-filter]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
}
document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => renderProjects(button.dataset.filter)));
renderProjects();

function syncScrollLock() { document.body.classList.toggle('modal-open', bookDialog.open || projectDialog.open); }

function fillContacts(root) {
  const container = root.querySelector('#contact-links');
  if (!container) return;
  const links = [];
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacts.email)) {
    const link = element('a', '', contacts.email);
    link.href = `mailto:${contacts.email}`;
    links.push(link);
  }
  contacts.socials.forEach((social) => {
    try {
      const url = new URL(social.url);
      if (!['https:', 'http:'].includes(url.protocol)) return;
      const link = element('a', '', social.label);
      link.href = url.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      links.push(link);
    } catch { /* Незаполненные или некорректные ссылки не выводятся. */ }
  });
  container.replaceChildren(...links);
  root.querySelector('#contact-placeholder').hidden = links.length > 0;
}

function openBook(id, opener) {
  const template = document.getElementById(`pages-${id}`);
  if (!template) return;
  bookOpener = opener;
  pageIndex = 0;
  const content = template.content.cloneNode(true);
  content.querySelectorAll('[data-project-section]').forEach((container) => {
    container.replaceChildren(...projects.filter((project) => project.section === container.dataset.projectSection).map(projectCard));
  });
  fillContacts(content);
  pages = Array.from(content.children);
  $('#book-dialog-title').textContent = bookTitles[id];
  renderSpread();
  closeMenu();
  bookDialog.showModal();
  syncScrollLock();
  $('#close-book').focus();
}

function renderSpread(animate = false) {
  const perSpread = desktop.matches ? 2 : 1;
  pageIndex = Math.floor(pageIndex / perSpread) * perSpread;
  const visiblePages = pages.slice(pageIndex, pageIndex + perSpread);
  spread.replaceChildren(...visiblePages);
  $('#previous-page').disabled = pageIndex === 0;
  $('#next-page').disabled = pageIndex + perSpread >= pages.length;
  const start = pageIndex + 1;
  const end = Math.min(pageIndex + perSpread, pages.length);
  $('#page-status').textContent = `${perSpread === 2 ? `Страницы ${start}–${end}` : `Страница ${start}`} из ${pages.length}`;
  if (animate) {
    spread.classList.remove('turning');
    void spread.offsetWidth;
    spread.classList.add('turning');
  }
  bookDialog.scrollTop = 0;
}

function turnPage(direction) {
  const step = desktop.matches ? 2 : 1;
  const next = pageIndex + direction * step;
  if (next < 0 || next >= pages.length) return;
  pageIndex = next;
  renderSpread(true);
  // Если нажатая стрелка стала disabled, переводим фокус на другую стрелку.
  if (document.activeElement === $('#next-page') && $('#next-page').disabled) $('#previous-page').focus();
  if (document.activeElement === $('#previous-page') && $('#previous-page').disabled) $('#next-page').focus();
}
document.querySelectorAll('[data-book]').forEach((button) => button.addEventListener('click', () => openBook(button.dataset.book, button)));
$('#previous-page').addEventListener('click', () => turnPage(-1));
$('#next-page').addEventListener('click', () => turnPage(1));
$('#close-book').addEventListener('click', () => bookDialog.close());
bookDialog.addEventListener('keydown', (event) => {
  if (projectDialog.open) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); turnPage(event.key === 'ArrowRight' ? 1 : -1); }
});
bookDialog.addEventListener('close', () => {
  syncScrollLock();
  // Пункт мобильного меню к этому моменту скрыт: возвращаем фокус на кнопку меню.
  const target = bookOpener && bookOpener.getClientRects().length ? bookOpener : $('.menu-toggle');
  target?.focus();
});

function openProject(project, opener) {
  projectOpener = opener;
  const heading = element('h2', '', project.title);
  heading.id = 'project-title';
  const fields = element('dl');
  Object.entries({ task: 'Задача', idea: 'Идея', role: 'Моя роль', process: 'Процесс', result: 'Результат' }).forEach(([key, label]) => {
    fields.append(element('dt', '', label), element('dd', '', project.details?.[key] || 'Пока не заполнено.'));
  });
  $('#project-details').replaceChildren(projectPreview(project, projects.indexOf(project)), heading, element('p', 'project-category', categories[project.category] || project.category), element('p', '', project.description), fields);
  projectDialog.showModal();
  syncScrollLock();
  $('#close-project').focus();
}
$('#close-project').addEventListener('click', () => projectDialog.close());
projectDialog.addEventListener('close', () => { syncScrollLock(); projectOpener?.focus(); });
// Нативный dialog закрывается по Escape и удерживает фокус внутри открытого окна.
