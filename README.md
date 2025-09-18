# Connexa MVP

Projeto backend mínimo para o sprint Connexa.

Como usar

1. Instale dependências:

```powershell
npm install
```

2. Configure variáveis de ambiente (veja `.env.example`)

3. Inicie o servidor:

```powershell
npm start
```

Endpoints principais
- POST /api/usuarios/cadastro — cria novo usuário (email institucional obrigatório)
- GET /api/usuarios/confirmacao?token=... — confirma email via token

TASK-005: Cadastro com email institucional
-----------------------------------------
Descrição rápida da interface gerada
- Página: `frontend/cadastro.html` — formulário de cadastro com os campos:
	- Nome completo (opcional)
	- Email institucional (ex.: aluno@universidade.edu.br)
	- Senha
	- Confirmação de senha

Funcionalidades implementadas no frontend
- Validação do email ao digitar: exige domínio `@universidade.edu.br`.
- Validação de senha: mínimo 8 caracteres, pelo menos uma letra maiúscula, uma minúscula e um número.
- Validação de confirmação de senha: as duas senhas devem coincidir.
- Mensagens de erro claras e helpers inline (`emailHelp`, `senhaHelp`, `senhaConfirmHelp`) para feedback imediato.
- Envio do formulário para o endpoint `POST /api/usuarios/cadastro` com payload JSON { nome, email, senha }.

Funcionalidades já existentes no backend relacionadas à TASK-005
- `backend/src/controllers/usuariosController.js` — `cadastrar` já valida o domínio e a força da senha, verifica duplicidade com `usuarioModel.findByEmail`, faz hash da senha (bcrypt) e persiste no banco.
- `backend/src/models/usuarioModel.js` — persistência e consultas ao SQLite (`database/connexa.db`).
- `backend/src/services/emailService.js` — envia email de confirmação; usa `jsonTransport` quando variáveis SMTP não estão configuradas (útil para desenvolvimento).

Como testar manualmente
1. Inicie o servidor:
```powershell
npm start
```
2. Abra no navegador: `http://localhost:3000/frontend/cadastro.html`
3. Preencha o formulário com um email institucional válido e senha forte.
4. Ao submeter, você deverá ver mensagem de sucesso. Verifique o banco `database/connexa.db` ou logs do servidor para confirmar inserção.

Notas
- As validações são feitas no cliente e no servidor — não confie apenas no frontend.
- Se quiser, posso adicionar verificação em tempo real de disponibilidade de email (checagem AJAX) e proteção por rate-limit no endpoint.

Notas técnicas
- Use as variáveis SMTP_* para envio real de email. Sem SMTP configurado, o serviço utiliza jsonTransport (apenas logs).
