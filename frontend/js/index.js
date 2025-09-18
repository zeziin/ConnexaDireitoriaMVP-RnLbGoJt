document.addEventListener('DOMContentLoaded', () => {
  // Módulo de grupos — consome /api/grupos
  const createForm = document.getElementById('createForm');
  const joinForm = document.getElementById('joinForm');
  const myGroupsEl = document.getElementById('myGroups');
  const publicGroupsEl = document.getElementById('publicGroups');
  const createStatus = document.getElementById('createStatus');
  const joinStatus = document.getElementById('joinStatus');
  const refreshBtn = document.getElementById('refreshBtn');

  // Nav behavior is handled by frontend/js/nav.js (delegation) to keep logic centralized.

  function show(el, msg, type='success'){
    el.innerHTML='';
    const d = document.createElement('div');
    d.className = 'status ' + (type === 'error' ? 'error' : 'success');
    d.textContent = msg;
    el.appendChild(d);
  }

  async function fetchGroups(){
    try{
      const res = await fetch('/api/grupos');
      if (!res.ok) throw new Error('Nenhum endpoint de grupos disponível');
      const data = await res.json();
      renderGroups(data);
    }catch(err){
      publicGroupsEl.innerHTML = '<div class="hint">Nenhum serviço de grupos disponível.</div>';
    }
  }

  function renderGroups(data){
    myGroupsEl.innerHTML = '';
    publicGroupsEl.innerHTML = '';
    (data.myGroups||[]).forEach(g => {
      const div = document.createElement('div');
      div.className='group';
      div.innerHTML = `<div><strong>${escapeHtml(g.titulo)}</strong><div class="hint">${escapeHtml(g.descricao||'')}</div></div><div><button data-codigo="${escapeHtml(g.codigo)}">Entrar</button></div>`;
      myGroupsEl.appendChild(div);
    });
    (data.publicGroups||[]).forEach(g => {
      const div = document.createElement('div');
      div.className='group';
      div.innerHTML = `<div><strong>${escapeHtml(g.titulo)}</strong><div class="hint">${escapeHtml(g.descricao||'')}</div></div><div><button data-codigo="${escapeHtml(g.codigo)}">Entrar</button></div>`;
      publicGroupsEl.appendChild(div);
    });
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  createForm.addEventListener('submit', async function(e){
    e.preventDefault(); createStatus.textContent='';
    const titulo = document.getElementById('titulo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    if (!titulo) { show(createStatus,'Título é obrigatório.','error'); return; }
    try{
  const current = JSON.parse(localStorage.getItem('connexa_user') || 'null');
  const body = { titulo, descricao };
  if (current && current.email) body.usuario_email = current.email;
  const res = await fetch('/api/grupos',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const data = await res.json().catch(()=>({}));
      if (res.ok){ show(createStatus, data.message || 'Grupo criado. Código: ' + (data.codigo||'---')); fetchGroups(); createForm.reset(); }
      else { const errMsg = data && (data.error || data.message) ? (data.error || data.message) : 'Erro criando grupo.'; show(createStatus, errMsg, 'error'); }
    }catch(err){ show(createStatus,'Erro de rede ao criar grupo.','error'); }
  });

  joinForm.addEventListener('submit', async function(e){
    e.preventDefault(); joinStatus.textContent='';
    const codigo = document.getElementById('codigo').value.trim();
    if (!codigo){ show(joinStatus,'Código é obrigatório.','error'); return; }
    try{
  const current = JSON.parse(localStorage.getItem('connexa_user') || 'null');
  const body = { codigo };
  if (current && current.email) body.usuario_email = current.email;
  const res = await fetch('/api/grupos/entrar',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const data = await res.json().catch(()=>({}));
      if (res.ok){ show(joinStatus, data.message || 'Entrou no grupo.'); fetchGroups(); joinForm.reset(); }
      else { const errMsg = data && (data.error || data.message) ? (data.error || data.message) : 'Erro ao entrar no grupo.'; show(joinStatus, errMsg, 'error'); }
    }catch(err){ show(joinStatus,'Erro de rede ao entrar no grupo.','error'); }
  });

  refreshBtn.addEventListener('click', fetchGroups);

  document.addEventListener('click', async function(e){
    if (e.target && e.target.matches('.group button')){
      const codigo = e.target.getAttribute('data-codigo');
      if (!codigo) return;
      try{
    const current = JSON.parse(localStorage.getItem('connexa_user') || 'null');
    const body = { codigo };
    if (current && current.email) body.usuario_email = current.email;
    const res = await fetch('/api/grupos/entrar',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
        const data = await res.json().catch(()=>({}));
        if (res.ok){ alert(data.message || 'Entrou no grupo.'); fetchGroups(); }
        else alert(data.error || 'Erro ao entrar no grupo.');
      }catch(err){ alert('Erro de rede ao entrar no grupo.'); }
    }
  });

  // init
  fetchGroups();
});
