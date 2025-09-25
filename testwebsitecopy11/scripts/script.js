document.addEventListener('DOMContentLoaded', function() {
  /* --- Sample in-memory demo drivers (frontend only) --- */
  const drivers = [
    { id: 1, name: "Thabo Mahlangu", license: "ABC123GP", phone: "0711234567", model: "Toyota Avanza", colour: "White", reports: 1, incidents: [{date: "2025-01-14", desc: "Reckless driving and late arrival."}] },
    { id: 2, name: "Zinhle Dlamini", license: "XYZ789NW", phone: "0729876543", model: "Hyundai i20", colour: "Silver", reports: 2, incidents: [{date: "2024-12-01", desc: "Unprofessional behaviour."},{date:"2025-02-02",desc:"Route deviation without notice."}] },
    { id: 3, name: "Sizwe Nkosi", license: "JSK441GP", phone: "0735550011", model: "Volkswagen Polo", colour: "Blue", reports: 0, incidents: [] }
  ];

  /* Shortcuts */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  /* Page navigation */
  function showPage(id){
    $$('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  /* Only attach nav button listeners if they exist */
  const navButtons = $$('.nav-btn');
  if (navButtons.length > 0) {
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(btn.dataset.target);
      });
    });
  }

  /* Quick search - Only run if quick search exists */
  const quickSearchBtn = $('#quickSearchBtn');
  if (quickSearchBtn) {
    quickSearchBtn.addEventListener('click', () => {
      const q = $('#quickSearch').value.trim();
      if (!q) return showQuickResult("Type something to search.");
      const found = findDriver(q);
      if (!found) showQuickResult("❌ No results.");
      else showQuickResult(renderProfileHTML(found));
    });
  }

  function showQuickResult(html){ 
    const quickResult = $('#quickResult');
    if (quickResult) {
      quickResult.classList.remove('hidden'); 
      quickResult.innerHTML = html; 
    }
  }

  /* Verify search - Only run if verify page elements exist */
  const searchBtn = $('#searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  const clearSearch = $('#clearSearch');
  if (clearSearch) {
    clearSearch.addEventListener('click', () => { 
      const searchInput = $('#searchInput');
      const verifyResult = $('#verifyResult');
      if (searchInput) searchInput.value = '';
      if (verifyResult) verifyResult.innerHTML = ''; 
    });
  }

  function performSearch(){
    const searchInput = $('#searchInput');
    const verifyResult = $('#verifyResult');
    if (!searchInput || !verifyResult) return;
    
    const q = searchInput.value.trim();
    if (!q) {
      verifyResult.innerHTML = '<div class="result-box muted">Enter a name, license, or phone.</div>';
      return;
    }
    const d = findDriver(q);
    verifyResult.innerHTML = d ? renderProfileHTML(d) : '<div class="result-box">❌ Not found.</div>';
    if(d) attachProfileHandlers(d.id);
  }

  /* Matching logic */
  function findDriver(q){
    const lc = q.toLowerCase();
    return drivers.find(d => 
      d.name.toLowerCase().includes(lc) || 
      d.license.toLowerCase().includes(lc) || 
      d.phone.includes(q)
    );
  }

  /* Render profile */
  function renderProfileHTML(d){
    const incidents = d.incidents.length 
      ? d.incidents.map(i => `<li><b>${i.date}</b>: ${i.desc}</li>`).join('') 
      : '<li class="muted">No incidents</li>';

    return `<article class="profile">
      <div class="avatar">${d.name.split(' ').map(n => n[0]).join('')}</div>
      <div class="meta">
        <h3>${d.name}</h3>
        <ul class="info">
          <li>License: ${d.license}</li>
          <li>Phone: ${d.phone}</li>
          <li>Model: ${d.model}</li>
          <li>Colour: ${d.colour}</li>
          <li>Reports: ${d.reports}</li>
        </ul>
        <strong>Incident history</strong>
        <ul>${incidents}</ul>
        <ul class="actions">
          <li><button class="btn primary" data-action="confirm" data-id="${d.id}">Yes — correct</button></li>
          <li><button class="btn outline" data-action="mismatch" data-id="${d.id}">No — mismatch</button></li>
        </ul>
      </div>
    </article>`;
  }

  /* Profile buttons */
  function attachProfileHandlers(id){
    const buttons = $$('[data-action]');
    buttons.forEach(btn => {
      btn.onclick = () => {
        if(btn.dataset.action === 'confirm') showSternModal();
        if(btn.dataset.action === 'mismatch'){ 
          showPage('report'); 
          const licenseInput = $('#r_license');
          const driver = drivers.find(d => d.id == id);
          if (licenseInput && driver) licenseInput.value = driver.license; 
        }
      };
    });
  }

  /* Modal */
  function showSternModal(){
    const modal = $('#sternModal');
    const modalCancel = $('#modalCancel');
    const modalConfirm = $('#modalConfirm');
    
    if (!modal || !modalCancel || !modalConfirm) return;
    
    modal.classList.remove('hidden');
    modalCancel.onclick = () => { 
      modal.classList.add('hidden'); 
      alert('Cancel the ride if unsafe.'); 
    };
    modalConfirm.onclick = () => { 
      modal.classList.add('hidden'); 
      alert('Confirmed. Stay aware.'); 
    };
  }

  /* Report form - Only run if report page exists */
  const submitReport = $('#submitReport');
  if (submitReport) {
    submitReport.addEventListener('click', handleReportSubmit);
  }

  function handleReportSubmit(e){
    e.preventDefault();
    const name = $('#r_name')?.value.trim();
    const phone = $('#r_phone')?.value.trim();
    const license = $('#r_license')?.value.trim();
    const model = $('#r_model')?.value.trim();
    const colour = $('#r_colour')?.value.trim();
    const desc = $('#r_desc')?.value.trim();
    const reportMsg = $('#reportMsg');
    
    if(!name || !phone || !license || !model || !colour || !desc) {
      if (reportMsg) reportMsg.textContent = "Fill all fields.";
      return;
    }
    
    const now = new Date().toISOString().slice(0,10);
    let d = findDriver(license) || findDriver(phone) || findDriver(name);
    
    if(d){ 
      d.reports++; 
      d.incidents.push({date:now, desc}); 
    } else { 
      d = {
        id: Date.now(),
        name, phone, license, model, colour, 
        reports: 1, 
        incidents: [{date:now, desc}]
      }; 
      drivers.push(d); 
    }
    
    if (reportMsg) reportMsg.textContent = "Report submitted (demo).";
    
    setTimeout(() => { 
      const reportForm = $('#reportForm');
      const verifyResult = $('#verifyResult');
      
      if (reportForm) reportForm.reset();
      if (verifyResult) {
        verifyResult.innerHTML = renderProfileHTML(d); 
        attachProfileHandlers(d.id); 
      }
      showPage('verify'); 
    }, 800);
  }

  /* Only show home page if we're on a page with home section */
  const homePage = $('#home');
  if (homePage && homePage.classList.contains('active')) {
    showPage('home');
  }
});











