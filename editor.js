(() => {
  'use strict';
  const STORAGE = 'padmakar-portfolio-draft-v1';
  const original = JSON.parse(JSON.stringify(window.PORTFOLIO));
  let data = JSON.parse(JSON.stringify(original));
  let storageAvailable = true;
  try { const draft = localStorage.getItem(STORAGE); if (draft) data = JSON.parse(draft); }
  catch (_) { storageAvailable = false; }
  const tabs = [ ['profile','Profile'],['projects','Projects'],['experience','Experience'],['skills','Skills'],['certifications','Certifications'],['education','Education'],['sections','Sections & more'] ];
  let currentTab = 'profile';
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arr = v => Array.isArray(v) ? v : [];
  const panel = document.getElementById('editor-panel');
  const status = document.getElementById('editor-status');
  function get(path) { return path.split('.').reduce((v,k)=>v?.[k], data); }
  function set(path,value) {
    const keys = path.split('.');
    if (keys.some(k=>['__proto__','constructor','prototype'].includes(k))) return;
    let target = data;
    for (const key of keys.slice(0,-1)) target = target[key];
    target[keys.at(-1)] = value;
  }
  function save(message) {
    try { localStorage.setItem(STORAGE,JSON.stringify(data)); storageAvailable = true; }
    catch (_) { storageAvailable = false; }
    status.classList.remove('error');
    status.textContent = message || (storageAvailable ? 'Draft saved in this browser.' : 'Browser storage is unavailable. Download content.js to keep your changes.');
  }
  function field(label,path,value,options={}) {
    const id = `field-${path.replaceAll('.','-')}`;
    const format = options.format || '';
    const display = format==='paragraphs' ? arr(value).join('\n\n') : format==='lines' ? arr(value).join('\n') : format==='tags' ? arr(value).join(', ') : value ?? '';
    const attrs = `id="${esc(id)}" data-path="${esc(path)}" data-format="${esc(format)}"${options.help ? ` aria-describedby="${esc(id)}-help"` : ''}`;
    return `<div class="field"><label for="${esc(id)}">${esc(label)}</label>${options.textarea ? `<textarea ${attrs} rows="${options.rows || 3}">${esc(display)}</textarea>` : `<input ${attrs} type="${options.type || 'text'}" value="${esc(display)}">`}${options.help ? `<p class="field-help" id="${esc(id)}-help">${esc(options.help)}</p>` : ''}</div>`;
  }
  function controls(collection,index,length,remove=true) {
    return `<div class="item-controls"><button type="button" class="small-button" data-action="up" data-collection="${collection}" data-index="${index}" aria-label="Move entry up"${index===0?' disabled':''}>↑</button><button type="button" class="small-button" data-action="down" data-collection="${collection}" data-index="${index}" aria-label="Move entry down"${index===length-1?' disabled':''}>↓</button>${remove?`<button type="button" class="small-button" data-action="remove" data-collection="${collection}" data-index="${index}">Remove</button>`:''}</div>`;
  }
  function itemWrap(collection,index,title,content) {
    return `<article class="editor-item"><div class="editor-item-top"><h3>${esc(title)}</h3>${controls(collection,index,arr(get(collection)).length)}</div>${content}</article>`;
  }
  function list(collection,render,label) {
    const values=arr(get(collection));
    return (values.length ? values.map(render).join('') : `<p class="editor-empty">Nothing added yet. Add your real details below.</p>`) + `<button type="button" class="add-item" data-action="add" data-collection="${collection}">+ ${esc(label)}</button>`;
  }
  const headers = {
    profile:['Your introduction','Write a short introduction and add the links you want visitors to use. Blank links stay hidden.'],
    projects:['Projects worth sharing','Add your own projects. Include the problem, your contribution, and a concrete outcome when available.'],
    experience:['Your experience','Include full-time roles, internships, freelance work, or relevant research.'],
    skills:['Skills & tools','Group relevant skills by category. Separate the skills in each group with commas.'],
    certifications:['Certifications & learning','Add completed credentials and their verification links.'],
    education:['Education','Add your real institutions, programs, and relevant academic details.'],
    sections:['Sections & more','Choose what appears, change the order, or create a section for something uniquely yours.']
  };
  function renderProfile() {
    const p=data.profile;
    return field('Full name','profile.name',p.name) + field('Headline / tagline','profile.tagline',p.tagline) +
      `<div class="field-grid">${field('Professional role (optional)','profile.role',p.role)}${field('Location (optional)','profile.location',p.location)}</div>` +
      field('About you','profile.about',p.about,{textarea:true,format:'paragraphs',rows:6,help:'Separate paragraphs with an empty line. Only include your actual background.'}) +
      `<div class="field-grid">${field('Email','profile.email',p.email,{type:'email'})}${field('GitHub URL','profile.github',p.github)}${field('LinkedIn URL','profile.linkedin',p.linkedin)}${field('Résumé file or URL','profile.resume',p.resume,{help:'For example: assets/resume.pdf. Upload the actual file separately.'})}</div>` +
      field('Profile photo file or URL','profile.portrait',p.portrait,{help:'For example: assets/profile.jpg. A monogram appears until a photo is provided.'});
  }
  function renderProjects() {
    return list('projects',(p,i)=>itemWrap('projects',i,`Project ${i+1}`,field('Project title',`projects.${i}.title`,p.title)+
      `<div class="field-grid">${field('Category',`projects.${i}.category`,p.category,{help:'Examples: Web, Data, Mobile. Filters appear for multiple categories.'})}${field('Technologies',`projects.${i}.tech`,p.tech,{format:'tags',help:'Comma-separated list.'})}</div>`+
      field('Short description',`projects.${i}.description`,p.description,{textarea:true})+
      `<div class="field-grid">${field('Screenshot file or URL',`projects.${i}.image`,p.image,{help:'For example: assets/project-name.jpg.'})}${field('Screenshot description',`projects.${i}.imageAlt`,p.imageAlt)}</div>`+
      `<div class="field-grid">${field('Live demo URL',`projects.${i}.demo`,p.demo)}${field('Source code URL',`projects.${i}.code`,p.code)}</div>`+
      field('The challenge (optional)',`projects.${i}.challenge`,p.challenge,{textarea:true})+
      field('Your approach (optional)',`projects.${i}.solution`,p.solution,{textarea:true})+
      field('The result (optional)',`projects.${i}.impact`,p.impact,{textarea:true,help:'Keep metrics factual. These three fields create a project story dialog.'})), 'Add project');
  }
  function renderExperience() {
    return list('experience',(e,i)=>itemWrap('experience',i,`Experience ${i+1}`,
      `<div class="field-grid">${field('Role',`experience.${i}.role`,e.role)}${field('Company / organization',`experience.${i}.company`,e.company)}${field('Dates',`experience.${i}.period`,e.period,{help:'For example: Jan 2025 – Jun 2026.'})}${field('Location (optional)',`experience.${i}.location`,e.location)}</div>`+
      field('Contributions / achievements',`experience.${i}.bullets`,e.bullets,{textarea:true,format:'lines',rows:5,help:'One bullet per line. Explain your work and its impact.'})+
      field('Technologies (optional)',`experience.${i}.tech`,e.tech,{format:'tags'})), 'Add experience');
  }
  function renderSkills() {
    return list('skills',(g,i)=>itemWrap('skills',i,`Skill group ${i+1}`,field('Category',`skills.${i}.category`,g.category,{help:'For example: Languages, Data & analytics, or Cloud & tools.'})+field('Skills',`skills.${i}.items`,g.items,{format:'tags',help:'Separate each skill with a comma.'})), 'Add skill group');
  }
  function renderCertifications() {
    return list('certifications',(c,i)=>itemWrap('certifications',i,`Certification ${i+1}`,field('Certification name',`certifications.${i}.name`,c.name)+
      `<div class="field-grid">${field('Issuer',`certifications.${i}.issuer`,c.issuer)}${field('Issue date',`certifications.${i}.date`,c.date)}${field('Expiration (optional)',`certifications.${i}.expires`,c.expires)}${field('Credential ID (optional)',`certifications.${i}.credentialId`,c.credentialId)}</div>`+
      field('Public verification URL',`certifications.${i}.url`,c.url)), 'Add certification');
  }
  function renderEducation() {
    return list('education',(e,i)=>itemWrap('education',i,`Education ${i+1}`,field('School / institution',`education.${i}.school`,e.school)+field('Degree / program',`education.${i}.degree`,e.degree)+
      `<div class="field-grid">${field('Dates',`education.${i}.period`,e.period)}${field('Location (optional)',`education.${i}.location`,e.location)}</div>`+
      field('Relevant details (optional)',`education.${i}.details`,e.details,{textarea:true,help:'Coursework, honors, activities, or a GPA you want to share.'})), 'Add education');
  }
  function renderSections() {
    return `<div class="field"><label for="accent">Accent color</label><select id="accent" data-path="settings.accent"><option value="rose"${data.settings.accent==='rose'?' selected':''}>Rose — inspired by the reference</option><option value="sage"${data.settings.accent==='sage'?' selected':''}>Sage</option><option value="blue"${data.settings.accent==='blue'?' selected':''}>Blue</option></select></div>`+
      `<div class="toggle-row"><label for="show-empty"><input id="show-empty" type="checkbox" data-path="settings.showEmptySections"${data.settings.showEmptySections?' checked':''}> Show empty sections</label></div><p class="field-help">Turn this off to hide sections until you’ve added content.</p>`+
      `<h3>Section visibility & order</h3>`+arr(data.sections).map((s,i)=>`<div class="toggle-row"><label for="section-${i}"><input id="section-${i}" type="checkbox" data-path="sections.${i}.enabled"${s.enabled!==false?' checked':''}>${esc(s.label)}</label><div class="section-tools">${controls('sections',i,data.sections.length,false)}</div></div>`).join('')+
      `<h3>Custom sections</h3><p class="panel-description">Add awards, publications, open source contributions, volunteering, writing, or talks.</p>`+
      arr(data.customSections).map((c,i)=>`<article class="editor-item"><div class="editor-item-top"><h3>Custom section ${i+1}</h3><button type="button" class="small-button" data-action="remove-section" data-index="${i}">Remove section</button></div>`+
        field('Section title',`customSections.${i}.title`,c.title)+field('Introduction (optional)',`customSections.${i}.description`,c.description,{textarea:true})+
        list(`customSections.${i}.items`,(item,j)=>itemWrap(`customSections.${i}.items`,j,`Entry ${j+1}`,field('Title',`customSections.${i}.items.${j}.title`,item.title)+field('Details',`customSections.${i}.items.${j}.description`,item.description,{textarea:true})+
          `<div class="field-grid">${field('Link (optional)',`customSections.${i}.items.${j}.url`,item.url)}${field('Link label',`customSections.${i}.items.${j}.linkLabel`,item.linkLabel)}</div>`), 'Add entry')+`</article>`).join('')+
      `<button type="button" class="add-item" data-action="add-section">+ Add custom section</button>`;
  }
  const renderers={profile:renderProfile,projects:renderProjects,experience:renderExperience,skills:renderSkills,certifications:renderCertifications,education:renderEducation,sections:renderSections};
  function render() {
    document.getElementById('editor-tabs').innerHTML=tabs.map(([id,label])=>`<button type="button" role="tab" id="tab-${id}" aria-controls="editor-panel" aria-selected="${id===currentTab}" tabindex="${id===currentTab?0:-1}" data-tab="${id}">${label}</button>`).join('');
    panel.setAttribute('aria-labelledby',`tab-${currentTab}`);
    panel.innerHTML=`<h2>${headers[currentTab][0]}</h2><p class="panel-description">${headers[currentTab][1]}</p>${renderers[currentTab]()}`;
  }
  document.getElementById('editor-tabs').addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(t){currentTab=t.dataset.tab;render();document.getElementById(`tab-${currentTab}`).focus();}});
  document.getElementById('editor-tabs').addEventListener('keydown',e=>{
    const index=tabs.findIndex(([id])=>id===currentTab);
    let next;
    if(['ArrowDown','ArrowRight'].includes(e.key))next=(index+1)%tabs.length;
    if(['ArrowUp','ArrowLeft'].includes(e.key))next=(index-1+tabs.length)%tabs.length;
    if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;
    if(next!==undefined){e.preventDefault();currentTab=tabs[next][0];render();document.getElementById(`tab-${currentTab}`).focus();}
  });
  panel.addEventListener('input',e=>{
    const target=e.target;
    const path=target.dataset.path;
    if(!path)return;
    let value=target.type==='checkbox'?target.checked:target.value;
    if(target.dataset.format==='tags')value=target.value.split(',').map(s=>s.trim()).filter(Boolean);
    if(target.dataset.format==='lines')value=target.value.split('\n').map(s=>s.trim()).filter(Boolean);
    if(target.dataset.format==='paragraphs')value=target.value.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
    set(path,value);
    if(path.match(/^customSections\.\d+\.title$/)){
      const c=data.customSections[Number(path.split('.')[1])];
      const s=data.sections.find(s=>s.id===c.id);if(s)s.label=value||'New section';
    }
    save();
  });
  const defaults={
    projects:()=>({title:'',category:'',description:'',tech:[],image:'',imageAlt:'',demo:'',code:'',challenge:'',solution:'',impact:''}),
    experience:()=>({role:'',company:'',period:'',location:'',bullets:[],tech:[]}),
    skills:()=>({category:'',items:[]}),
    certifications:()=>({name:'',issuer:'',date:'',expires:'',credentialId:'',url:''}),
    education:()=>({school:'',degree:'',period:'',location:'',details:''})
  };
  panel.addEventListener('click',e=>{
    const b=e.target.closest('[data-action]');if(!b)return;
    const action=b.dataset.action,index=Number(b.dataset.index),collection=b.dataset.collection;
    const items=collection?get(collection):null;
    if(action==='add'){
      if(!Array.isArray(items))return;
      items.push(defaults[collection]?defaults[collection]():{title:'',description:'',url:'',linkLabel:'Learn more'});
    } else if(action==='remove'){
      if(!Array.isArray(items))return;items.splice(index,1);
    } else if(action==='up'||action==='down'){
      const next=index+(action==='up'?-1:1);
      if(!Array.isArray(items)||next<0||next>=items.length)return;
      [items[index],items[next]]=[items[next],items[index]];
    } else if(action==='add-section'){
      const id=`custom-${Date.now().toString(36)}`;
      data.customSections.push({id,title:'New section',description:'',enabled:true,items:[]});
      data.sections.push({id,label:'New section',enabled:true});
    } else if(action==='remove-section'){
      const section=data.customSections[index];if(!section)return;
      data.sections=data.sections.filter(s=>s.id!==section.id);data.customSections.splice(index,1);
    }
    save();render();
    if(action==='add'&&collection){
      const input=[...panel.querySelectorAll('[data-path]')].find(el=>el.dataset.path.startsWith(`${collection}.${items.length-1}.`));
      input?.focus();
    }
  });
  function errors() {
    const out=[];
    if(!String(data.profile.name||'').trim())out.push('Add your name in Profile.');
    for(const [collection,key,label] of [['projects','title','project title'],['experience','role','experience role'],['skills','category','skill category'],['certifications','name','certification name'],['education','school','school name']]){
      arr(data[collection]).forEach((item,i)=>{if(!String(item[key]||'').trim())out.push(`Add a ${label} for entry ${i+1}, or remove the empty entry.`);});
    }
    arr(data.customSections).forEach(c=>{if(!c.title?.trim())out.push('Give every custom section a title.');arr(c.items).forEach((item,i)=>{if(!item.title?.trim())out.push(`Add a title for entry ${i+1} in ${c.title}.`);});});
    const email=String(data.profile.email||'').trim();
    if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))out.push('Use a valid email address in Profile.');
    const urls=[];
    ['github','linkedin','resume','portrait'].forEach(k=>urls.push([`Profile ${k}`,data.profile[k]]));
    arr(data.projects).forEach((p,i)=>['image','demo','code'].forEach(k=>urls.push([`Project ${i+1} ${k}`,p[k]])));
    arr(data.certifications).forEach((c,i)=>urls.push([`Certification ${i+1} verification`,c.url]));
    arr(data.customSections).forEach(c=>arr(c.items).forEach(i=>urls.push([`${c.title} link`,i.url])));
    urls.forEach(([label,v])=>{
      if(!v)return;
      try{const parsed=new URL(String(v),location.href);if(!['https:','http:'].includes(parsed.protocol)||/[\u0000-\u0020\\]/.test(String(v)))out.push(`${label}: use a web URL or a relative file path without spaces.`);}
      catch(_){out.push(`${label}: check the URL or file path.`);}
    });
    return out;
  }
  function validate() {
    const list=errors();
    if(list.length){status.classList.add('error');status.textContent=list.join(' ');status.scrollIntoView({block:'center',behavior:'smooth'});return false;}
    return true;
  }
  document.getElementById('preview-draft').addEventListener('click',()=>{
    if(!validate())return;save();
    if(!storageAvailable){status.classList.add('error');status.textContent='Draft preview needs browser storage. Download content.js instead, replace the local file, and open the portfolio.';return;}
    location.href='./index.html?draft=1';
  });
  document.getElementById('download-content').addEventListener('click',()=>{
    if(!validate())return;
    save();
    const text='/* Portfolio content. Generated with the portfolio editor. */\nwindow.PORTFOLIO = '+JSON.stringify(data,null,2)+';\n';
    const blob=new Blob([text],{type:'text/javascript;charset=utf-8'}),href=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=href;a.download='content.js';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1000);
    status.textContent='content.js downloaded. Replace the existing content.js in your website and commit it to publish your changes.';
  });
  document.getElementById('reset-draft').addEventListener('click',()=>{
    if(!confirm('Discard the draft saved in this browser and return to the website’s current content?'))return;
    data=JSON.parse(JSON.stringify(original));
    try{localStorage.removeItem(STORAGE);}catch(_){}
    render();status.classList.remove('error');status.textContent='Browser draft discarded. The published website has not changed.';
  });
  render();
  if(!storageAvailable)status.textContent='Browser storage is unavailable. You can edit and download content.js; draft preview may be unavailable.';
})();
