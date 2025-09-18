document.addEventListener('DOMContentLoaded', () => {
  const signinForm = document.getElementById('signinForm');
  const signupForm = document.getElementById('signupForm');
  const signinStatus = document.getElementById('signinStatus');
  const signupStatus = document.getElementById('signupStatus');

  function show(el, msg, type='success'){
    el.innerHTML = '';
    const d = document.createElement('div');
    d.className = 'status ' + (type === 'error' ? 'error' : 'success');
    d.textContent = msg;
    el.appendChild(d);
  }

  // Signin: placeholder (autenticação não implementada)
  signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
  // IDs in login.html are si_email and si_senha
  const email = document.getElementById('si_email').value;
  const senha = document.getElementById('si_senha').value;
    try {
      const resp = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const data = await resp.json();
      if (!resp.ok) {
        show(signinStatus, data.error || 'Falha ao autenticar.', 'error');
        return;
      }
      show(signinStatus, data.message || 'Autenticado.', 'success');
      // salvar usuário no localStorage para sessão simples e redirecionar para home
      try{
        localStorage.setItem('connexa_user', JSON.stringify(data.user));
      }catch(e){ /* ignore storage errors */ }
      // pequena pausa para o usuário ver a mensagem, depois redireciona
      setTimeout(() => { window.location.href = '/'; }, 500);
    } catch (err) {
      show(signinStatus, 'Erro de conexão ao servidor.', 'error');
      console.error(err);
    }
  });

  // Signup: redireciona para página de cadastro (frontend) or call API
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // preferir uso do fluxo de cadastro dedicado
    window.location.href = '/frontend/cadastro.html';
  });
});
