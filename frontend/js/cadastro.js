document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form');
  const emailEl = document.getElementById('email');
  const senhaEl = document.getElementById('senha');
  const nomeEl = document.getElementById('nome');
  const emailHelp = document.getElementById('emailHelp');
  const senhaHelp = document.getElementById('senhaHelp');
  const senhaConfirmEl = document.getElementById('senhaConfirm');
  const senhaConfirmHelp = document.getElementById('senhaConfirmHelp');
  const statusEl = document.getElementById('status');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');

  const DOMAIN_RE = /^[A-Za-z0-9._%+-]+@universidade\.edu\.br$/;
  const PWD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  function setInvalid(el, msg){
    el.setAttribute('aria-invalid','true');
    const help = el === emailEl ? emailHelp : senhaHelp;
    if (help) { help.textContent = msg; help.style.color = 'var(--danger)'; }
  }
  function setValid(el, msg){
    el.setAttribute('aria-invalid','false');
    const help = el === emailEl ? emailHelp : senhaHelp;
    if (help) { help.textContent = msg; help.style.color = 'var(--muted)'; }
  }

  function validateEmail(){
    const v = (emailEl.value||'').trim().toLowerCase();
    if (!v) { setInvalid(emailEl,'Email é obrigatório.'); return false; }
    if (!DOMAIN_RE.test(v)) { setInvalid(emailEl,'Use seu email institucional @universidade.edu.br.'); return false; }
    setValid(emailEl,'Email válido.'); return true;
  }
  function validateSenha(){
    const v = senhaEl.value||'';
    if (!v) { setInvalid(senhaEl,'Senha é obrigatória.'); return false; }
    if (!PWD_RE.test(v)) { setInvalid(senhaEl,'Senha fraca: min 8 chars, 1 maiúsc., 1 min., 1 número.'); return false; }
    setValid(senhaEl,'Senha atende os requisitos.'); return true;
  }
  function validateSenhaConfirm(){
    const a = senhaEl.value || '';
    const b = senhaConfirmEl.value || '';
    if (!b) { senhaConfirmHelp.textContent = 'Confirme sua senha.'; senhaConfirmHelp.style.color = 'var(--danger)'; return false; }
    if (a !== b) { senhaConfirmHelp.textContent = 'As senhas não coincidem.'; senhaConfirmHelp.style.color = 'var(--danger)'; return false; }
    senhaConfirmHelp.textContent = 'Senhas conferem.'; senhaConfirmHelp.style.color = 'var(--muted)'; return true;
  }

  emailEl.addEventListener('input', validateEmail);
  senhaEl.addEventListener('input', validateSenha);
  if (senhaConfirmEl) senhaConfirmEl.addEventListener('input', validateSenhaConfirm);

  function showStatus(message, type='success'){
    statusEl.innerHTML = '';
    const d = document.createElement('div');
    d.className = 'status ' + (type==='error' ? 'error' : 'success');
    d.textContent = message;
    statusEl.appendChild(d);
    d.tabIndex = -1; d.focus();
  }

  function setLoading(is){
    if (is){ submitBtn.disabled = true; btnText.innerHTML = '<span class="spinner" aria-hidden="true"></span> Enviando...'; }
    else { submitBtn.disabled = false; btnText.textContent = 'Cadastrar'; }
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault(); statusEl.textContent = '';
  const okEmail = validateEmail(); const okPwd = validateSenha(); const okConfirm = validateSenhaConfirm();
  if (!okEmail || !okPwd || !okConfirm){ showStatus('Corrija os erros antes de enviar.', 'error'); return; }

    const payload = { nome: (nomeEl.value||'').trim(), email: (emailEl.value||'').trim().toLowerCase(), senha: senhaEl.value };

    try{
      setLoading(true);
      const res = await fetch('/api/usuarios/cadastro', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await res.json().catch(()=>({}));
      if (res.ok){ showStatus(data.message||'Cadastro realizado. Verifique seu email.','success'); form.reset(); emailHelp.textContent=''; senhaHelp.textContent=''; }
      else { const err = data && (data.error || data.message) ? (data.error||data.message) : ('Erro: '+res.status); showStatus(err,'error'); }
    }catch(err){ showStatus('Erro de rede. Tente novamente mais tarde.','error'); console.error(err); }
    finally{ setLoading(false); }
  });

  // initial validation
  validateEmail(); validateSenha();
});
