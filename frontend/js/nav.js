document.addEventListener('DOMContentLoaded', () => {
  // Foca o input correspondente (create -> #titulo, join -> #codigo)
  function focusTarget(action) {
    const id = action === 'create' ? 'titulo' : 'codigo';
    const el = document.getElementById(id);
    if (el) {
      try { el.focus({ preventScroll: false }); } catch (e) { el.focus(); }
      try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
      return true;
    }
    return false;
  }

  // Se a URL possui hash, tenta focar (quando navegamos para home#create etc.)
  if (location.hash === '#create') focusTarget('create');
  if (location.hash === '#join') focusTarget('join');

  // Delegação: um único handler para toda a nav-list
  // Prefer handlers por id quando disponíveis
  const byIdHandler = (id, action) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', (ev) => {
      const handled = focusTarget(action);
      if (handled) { ev.preventDefault(); ev.stopPropagation(); return; }
      // se não existe, navega para home com hash
      ev.preventDefault(); window.location.href = '/' + (action === 'create' ? '#create' : '#join');
    });
  };
  byIdHandler('nav-create', 'create');
  byIdHandler('nav-join', 'join');

  // Fallback delegação (caso markup seja diferente)
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest && ev.target.closest('.nav-list a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const text = (a.textContent || '').toLowerCase();
    let action = null;
    if (href.indexOf('#create') !== -1) action = 'create';
    else if (href.indexOf('#join') !== -1) action = 'join';
    else if (/\bcriar\b/.test(text)) action = 'create';
    else if (/\bentrar\b/.test(text)) action = 'join';
    if (!action) return;
    const handled = focusTarget(action);
    if (handled) { ev.preventDefault(); ev.stopPropagation(); return; }
    ev.preventDefault(); window.location.href = '/' + (action === 'create' ? '#create' : '#join');
  });

  // Mostrar usuário autenticado no navbar (se existir)
  function renderAuth() {
    try{
      const cur = JSON.parse(localStorage.getItem('connexa_user') || 'null');
      const navList = document.querySelector('.nav-list');
      if (!navList) return;
      const existing = navList.querySelector('.nav-user');
      if (existing) existing.remove();
      const li = document.createElement('li');
      li.className = 'nav-user';
      if (cur && cur.nome) {
        li.innerHTML = `<span class="nav-username">${cur.nome}</span> <button id="logoutBtn" class="btn-link">Sair</button>`;
      } else {
        li.innerHTML = `<a href="/frontend/login.html">Login / Registrar</a>`;
      }
      navList.appendChild(li);
      const btn = document.getElementById('logoutBtn');
      if (btn) btn.addEventListener('click', () => { localStorage.removeItem('connexa_user'); renderAuth(); window.location.href = '/'; });
    }catch(e){ /* ignore */ }
  }
  renderAuth();
});
