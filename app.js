(() => {
  'use strict';
  let data = window.PORTFOLIO;
  if (!data) return;
  const params = new URLSearchParams(location.search);
  if (params.get('draft') === '1') {
    try {
      const draft = localStorage.getItem('padmakar-portfolio-draft-v1');
      if (draft) { data = JSON.parse(draft); document.getElementById('draft-banner').hidden = false; }
    } catch (_) { /* The original content remains available if browser storage is blocked. */ }
  }
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arr = value => Array.isArray(value) ? value : [];
  const url = value => {
    const v = String(value ?? '').trim();
    if (!v || /[\u0000-\u0020\\]/.test(v)) return '';
    try { const parsed = new URL(v, location.href); return ['http:', 'https:'].includes(parsed.protocol) ? v : ''; }
    catch (_) { return ''; }
  };
  const link = (href, label, className = '', arrow = true) => {
    const safe = url(href);
    return safe ? `<a href="${esc(safe)}" class="${esc(className)}" target="_blank" rel="noopener noreferrer">${esc(label)}${arrow ? ' <span aria-hidden="true">↗</span>' : ''}</a>` : '';
  };
  const tagList = values => arr(values).filter(Boolean).length ? `<div class="tags">${arr(values).filter(Boolean).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : '';
  const initials = name => String(name || '').trim().split(/\s+/).filter(Boolean).map(s => s[0]).slice(0, 2).join('').toUpperCase() || 'PB';
  const profile = data.profile || {};
  const settings = data.settings || {};
  const name = profile.name || 'Padmakar Budda';
  const parts = name.trim().split(/\s+/);
  document.title = `${name} | Portfolio`;
  document.querySelector('meta[property="og:title"]').content = `${name} | Portfolio`;
  document.querySelector('meta[property="og:description"]').content = profile.tagline || '';
  document.querySelector('meta[name="description"]').content = `${name}’s personal portfolio: projects, experience, skills, certifications, and continued learning.`;
  document.body.dataset.accent = ['rose', 'sage', 'blue'].includes(settings.accent) ? settings.accent : 'rose';
  document.querySelector('.brand-name').textContent = name;
  document.getElementById('footer-name').textContent = name;
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('hero-title').innerHTML = `${esc(parts.shift().toUpperCase())}${parts.length ? ` <span>${esc(parts.join(' ').toUpperCase())}<span class="name-dot">.</span></span>` : '<span class="name-dot">.</span>'}`;
  document.getElementById('hero-tagline').textContent = profile.tagline || '';
  const role = document.getElementById('hero-role');
  if (profile.role) { role.textContent = profile.role; role.hidden = false; }
  const portrait = document.getElementById('hero-portrait');
  const portraitURL = url(profile.portrait);
  portrait.innerHTML = `${portraitURL ? `<img src="${esc(portraitURL)}" alt="Portrait of ${esc(name)}" width="98" height="98">` : ''}<span${portraitURL ? ' hidden' : ''}>${esc(initials(name))}</span>`;
  const portraitImage = portrait.querySelector('img');
  portraitImage?.addEventListener('error', () => { portraitImage.hidden = true; portrait.querySelector('span').hidden = false; });
  const gh = document.getElementById('hero-github');
  if (url(profile.github)) gh.href = url(profile.github); else gh.hidden = true;
  const sectionInfo = {
    projects: { title: 'A selection of <em>my work.</em>', description: 'Ideas explored, problems solved, and things brought to life.' },
    experience: { title: 'The journey <em>so far.</em>', description: 'Where I’ve contributed, collaborated, and grown.' },
    skills: { title: 'What I bring <em>to the table.</em>', description: 'The skills and tools behind the work.' },
    certifications: { title: 'Never stop <em>learning.</em>', description: 'Certifications, courses, and milestones along the way.' },
    education: { title: 'Building a <em>foundation.</em>', description: 'Education and the experiences that shape how I think.' }
  };
  const customSections = arr(data.customSections).filter(s => s && /^custom-[a-z0-9-]+$/.test(s.id));
  const known = new Set(['about', ...Object.keys(sectionInfo), ...customSections.map(s => s.id)]);
  const sections = arr(data.sections).filter(s => s && s.enabled !== false && known.has(s.id));
  const orderedIds = new Set(sections.map(s => s.id));
  customSections.filter(s => s.enabled !== false && !orderedIds.has(s.id)).forEach(s => sections.push({id:s.id,label:s.title,enabled:true}));
  const seen = new Set();
  const visible = sections.filter(s => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    if (s.id === 'about') return arr(profile.about).some(Boolean);
    const custom = customSections.find(c => c.id === s.id);
    if (custom?.enabled === false) return false;
    return settings.showEmptySections !== false || (custom ? arr(custom.items).length : arr(data[s.id]).length);
  });
  const heading = (s, number, title, description) => `<div class="section-heading"><span class="section-number" aria-hidden="true">${String(number).padStart(2,'0')}</span><div><h2 id="${esc(s.id)}-title">${title}</h2>${description ? `<p class="section-description">${esc(description)}</p>` : ''}</div></div>`;
  const emptyLine = (symbol, title, copy) => `<div class="empty-line"><span class="empty-symbol" aria-hidden="true">${symbol}</span><div><h3>${esc(title)}</h3><p>${esc(copy)}</p><span class="draft-label">Details to be added</span></div></div>`;
  const renderAbout = (s, i) => `<section id="about" class="about-section" aria-labelledby="about-title"><div class="section-shell about-layout"><div class="about-heading"><p class="eyebrow">${String(i).padStart(2,'0')} / A LITTLE INTRODUCTION</p><h2 id="about-title">A little about<br><em>me.</em></h2></div><div class="about-body">${arr(profile.about).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('')}<div class="about-meta">${profile.location ? `<span>${esc(profile.location)}</span>` : ''}${link(profile.github, 'Find me on GitHub')}${link(profile.resume, 'View résumé')}</div></div></div></section>`;
  const renderProjectCard = (p, index) => `<article class="project-card"><div class="project-art">${url(p.image) ? `<img src="${esc(url(p.image))}" alt="${esc(p.imageAlt || `${p.title} project preview`)}" loading="lazy" width="540" height="220"><span hidden aria-hidden="true">${esc(String(index + 1).padStart(2,'0'))}</span>` : `<span aria-hidden="true">${esc(String(index + 1).padStart(2,'0'))}</span>`}</div><div class="project-card-body">${p.category ? `<p class="project-category">${esc(p.category)}</p>` : ''}<h3>${esc(p.title)}</h3>${p.description ? `<p>${esc(p.description)}</p>` : ''}${tagList(p.tech)}<div class="project-links">${p.challenge || p.solution || p.impact ? `<button type="button" data-project-index="${index}">Read the story <span aria-hidden="true">↗</span></button>` : ''}${link(p.demo, 'Live demo')}${link(p.code, 'Source code')}</div></div></article>`;
  const projects = arr(data.projects).filter(p => p && p.title);
  const renderProjects = (s, i) => {
    const categories = [...new Set(projects.map(p => p.category).filter(Boolean))];
    return `<section id="projects" class="projects-section" aria-labelledby="projects-title"><div class="section-shell"><div class="section-topline">${heading(s,i,sectionInfo.projects.title,sectionInfo.projects.description)}${link(profile.github, 'All on GitHub', 'text-link')}</div>${categories.length > 1 ? `<div class="project-filters" role="group" aria-label="Filter projects by category"><button type="button" class="filter-button" data-category="" aria-pressed="true">All work</button>${categories.map(c => `<button type="button" class="filter-button" data-category="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join('')}</div>` : ''}${projects.length ? `<div class="project-grid" id="project-grid">${projects.map(renderProjectCard).join('')}</div><p class="sr-only" id="filter-status" role="status"></p>` : `<div class="empty-projects"><div class="empty-art" aria-hidden="true"><div class="art-window"><i></i><span>↗</span></div></div><div class="empty-project-copy"><span class="draft-label">A space for what’s next</span><h3>Every project<br>has a story.</h3><p>Project case studies and demos will appear here as they’re added.</p>${link(profile.github,'Explore my GitHub','text-link')}</div></div>`}</div></section>`;
  };
  const renderExperience = (s,i) => `<section id="experience" class="experience-section" aria-labelledby="experience-title"><div class="section-shell">${heading(s,i,sectionInfo.experience.title,sectionInfo.experience.description)}${arr(data.experience).length ? `<div class="timeline">${arr(data.experience).map(e => `<article class="timeline-entry"><div class="entry-date">${esc(e.period)}${e.location ? `<br>${esc(e.location)}` : ''}</div><div><h3>${esc(e.role)}</h3><p class="entry-company">${esc(e.company)}</p>${arr(e.bullets).filter(Boolean).length ? `<ul>${arr(e.bullets).filter(Boolean).map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}${tagList(e.tech)}</div></article>`).join('')}</div>` : emptyLine('↗','Meaningful work, thoughtfully documented.','Roles, contributions, and professional milestones will appear here.')}</div></section>`;
  const renderSkills = (s,i) => `<section id="skills" class="skills-section" aria-labelledby="skills-title"><div class="section-shell">${heading(s,i,sectionInfo.skills.title,sectionInfo.skills.description)}${arr(data.skills).length ? `<div class="skills-grid">${arr(data.skills).map(g => `<div class="skill-group"><h3>${esc(g.category)}</h3><div class="skill-pills">${arr(g.items).filter(Boolean).map(t => `<span class="skill-pill">${esc(t)}</span>`).join('')}</div></div>`).join('')}</div>` : `<div class="empty-skills"><div class="empty-skill-block"><span aria-hidden="true">01</span><h3>Technical skills</h3><p>Languages and core capabilities.</p></div><div class="empty-skill-block"><span aria-hidden="true">02</span><h3>Tools & platforms</h3><p>The tools used to get things done.</p></div><div class="empty-skill-block"><span aria-hidden="true">03</span><h3>Ways of working</h3><p>Collaboration and problem solving.</p></div></div><p class="empty-skills-note">Skills will be listed here once added.</p>`}</div></section>`;
  const renderCertifications = (s,i) => `<section id="certifications" class="certifications-section" aria-labelledby="certifications-title"><div class="section-shell">${heading(s,i,sectionInfo.certifications.title,sectionInfo.certifications.description)}${arr(data.certifications).length ? `<div class="credential-list">${arr(data.certifications).map(c => `<article class="credential-card"><span class="credential-icon" aria-hidden="true">✧</span><div><h3>${esc(c.name)}</h3><p>${[c.issuer,c.date].filter(Boolean).map(esc).join(' · ')}</p>${c.expires ? `<p>Expires: ${esc(c.expires)}</p>` : ''}${c.credentialId ? `<p>Credential: ${esc(c.credentialId)}</p>` : ''}${link(c.url,'Verify credential')}</div></article>`).join('')}</div>` : emptyLine('✧','A little more knowledge. A new perspective.','Completed certifications and links to verify each credential will appear here.')}</div></section>`;
  const renderEducation = (s,i) => `<section id="education" class="education-section" aria-labelledby="education-title"><div class="section-shell">${heading(s,i,sectionInfo.education.title,sectionInfo.education.description)}${arr(data.education).length ? `<div class="education-list">${arr(data.education).map(e => `<article class="education-card"><p class="school">${esc(e.school)}</p><h3>${esc(e.degree)}</h3><p>${[e.period,e.location].filter(Boolean).map(esc).join(' · ')}</p>${e.details ? `<p>${esc(e.details)}</p>` : ''}</article>`).join('')}</div>` : emptyLine('⌘','The foundations of a lifelong journey.','Education, relevant coursework, and academic milestones will appear here.')}</div></section>`;
  const renderCustom = (s,i) => {
    const c = customSections.find(c => c.id === s.id);
    if (!c) return '';
    return `<section id="${esc(c.id)}" class="custom-section" aria-labelledby="${esc(c.id)}-title"><div class="section-shell">${heading(s,i,esc(c.title),c.description)}${arr(c.items).length ? `<div class="custom-grid">${arr(c.items).map(item => `<article class="custom-item"><h3>${esc(item.title)}</h3>${item.description ? `<p>${esc(item.description)}</p>` : ''}${link(item.url,item.linkLabel || 'Learn more')}</article>`).join('')}</div>` : emptyLine('✦','More to share, soon.','Updates will appear here as they’re added.')}</div></section>`;
  };
  const renderers = {about:renderAbout,projects:renderProjects,experience:renderExperience,skills:renderSkills,certifications:renderCertifications,education:renderEducation};
  document.getElementById('sections').innerHTML = visible.map((s,i) => (renderers[s.id] || renderCustom)(s,i+1)).join('');
  document.getElementById('main-nav').innerHTML = visible.map(s => `<a href="#${esc(s.id)}">${esc(s.label || s.id)}</a>`).join('') + `${url(profile.resume) ? link(profile.resume,'Résumé') : ''}<a class="nav-contact" href="#contact">Let’s talk <span aria-hidden="true">↗</span></a>`;
  const explore = document.getElementById('explore-button');
  explore.href = visible.some(s => s.id === 'projects') ? '#projects' : (visible[0] ? `#${visible[0].id}` : '#contact');
  document.getElementById('scroll-link').href = visible[0] ? `#${visible[0].id}` : '#contact';
  const email = String(profile.email || '').trim();
  const emailLink = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `<a href="mailto:${esc(email)}">${esc(email)} <span aria-hidden="true">↗</span></a>` : '';
  document.getElementById('contact-links').innerHTML = emailLink + link(profile.linkedin,'LinkedIn') + link(profile.github,'GitHub');
  if (!emailLink && !url(profile.github) && !url(profile.linkedin)) document.querySelector('.contact-copy').textContent = 'Contact details will appear here when they’re added.';
  const nav = document.getElementById('main-nav');
  const menu = document.getElementById('menu-toggle');
  const closeMenu = () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); };
  menu.addEventListener('click',() => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded',String(open)); nav.classList.toggle('is-open',open); });
  nav.addEventListener('click',e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
  const activate = id => nav.querySelectorAll('a').forEach(a => { const active = a.getAttribute('href') === `#${id}`; a.classList.toggle('active',active); if (active) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); });
  const observer = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) activate(e.target.id); }); },{rootMargin:'-15% 0px -60% 0px',threshold:0});
  document.querySelectorAll('main section[id]').forEach(s => observer.observe(s));
  function wireImageFallbacks() { document.querySelectorAll('.project-art img').forEach(img => img.addEventListener('error',() => { img.hidden=true; const fallback=img.nextElementSibling; if(fallback)fallback.hidden=false; })); }
  wireImageFallbacks();
  document.querySelector('.project-filters')?.addEventListener('click',e => {
    const b = e.target.closest('button[data-category]');
    if (!b) return;
    document.querySelectorAll('.filter-button').forEach(button => button.setAttribute('aria-pressed',String(button === b)));
    const category = b.dataset.category;
    document.getElementById('project-grid').innerHTML = projects.map((p,i) => !category || p.category === category ? renderProjectCard(p,i) : '').join('');
    const count = projects.filter(p => !category || p.category === category).length;
    document.getElementById('filter-status').textContent = `${count} project${count === 1 ? '' : 's'} shown`;
    wireImageFallbacks();
  });
  const dialog = document.getElementById('project-dialog');
  document.getElementById('sections').addEventListener('click',e => {
    const b = e.target.closest('[data-project-index]');
    if (!b) return;
    const p = projects[Number(b.dataset.projectIndex)];
    if (!p) return;
    document.getElementById('dialog-content').innerHTML = `<h2 id="dialog-title">${esc(p.title)}</h2>${p.description ? `<p>${esc(p.description)}</p>` : ''}${tagList(p.tech)}${[['The challenge',p.challenge],['The approach',p.solution],['The result',p.impact]].filter(([,v])=>v).map(([k,v]) => `<h3>${esc(k)}</h3><p>${esc(v)}</p>`).join('')}<div class="project-links">${link(p.demo,'Live demo')}${link(p.code,'Source code')}</div>`;
    dialog.showModal();
  });
  document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e => { if(e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) dialog.close(); } });
})();
