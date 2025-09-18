const express = require('express');
const path = require('path');

const app = express();

// Diagnostics: capture unexpected exits and unhandled errors to help debug
process.on('exit', (code) => {
  console.log(`process.exit event, code=${code}`);
});
process.on('uncaughtException', (err) => {
  console.error('uncaughtException:', err && (err.stack || err.message) || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection:', reason && (reason.stack || reason.message) || reason);
});

// Middleware para JSON
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));

// Rotas
const usuariosRouter = require('./src/routes/usuarios');
app.use('/api/usuarios', usuariosRouter);
// Rotas de grupos
const gruposRouter = require('./src/routes/grupos');
app.use('/api/grupos', gruposRouter);

// Rota de health-check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Rota mínima de verificação rápida (retorna texto 'ok')
app.get('/status', (req, res) => res.send('ok'));

// Servir a página principal no root para facilitar testes no navegador
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Fallback: para rotas não conhecidas do frontend, servir index (útil para SPA)
app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    return res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  }
  next();
});

// Inicialização do servidor com tratamento de erro
if (require.main === module) {
  const port = parseInt(process.env.PORT, 10) || 3000;
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Porta ${port} já está em uso.`);
      console.error('No Windows PowerShell execute:');
      console.error(`  netstat -aon | findstr :${port}`);
      console.error('  Stop-Process -Id <PID> -Force');
      process.exit(1);
    } else {
      console.error('Erro no servidor:', err);
      process.exit(1);
    }
  });
}

module.exports = app;
