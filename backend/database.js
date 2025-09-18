const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, 'connexa.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Erro ao abrir DB:', err.message || err);
});

const createUsuariosTable = `CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  confirmado INTEGER DEFAULT 0,
  confirmation_token TEXT,
  criado_em TEXT
);`;

const createGruposTable = `CREATE TABLE IF NOT EXISTS grupos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descricao TEXT,
  codigo TEXT UNIQUE NOT NULL,
  publico INTEGER DEFAULT 1,
  criado_em TEXT
);`;

const createGrupoMembrosTable = `CREATE TABLE IF NOT EXISTS grupo_membros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grupo_id INTEGER NOT NULL,
  usuario_email TEXT,
  criado_em TEXT,
  UNIQUE(grupo_id, usuario_email),
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE
);`;

db.serialize(() => {
  db.run(createUsuariosTable, (err) => {
    if (err) console.error('Erro criando tabela usuarios:', err.message || err);
  });
  db.run(createGruposTable, (err) => {
    if (err) console.error('Erro criando tabela grupos:', err.message || err);
  });
  db.run(createGrupoMembrosTable, (err) => {
    if (err) console.error('Erro criando tabela grupo_membros:', err.message || err);
  });
});

module.exports = db;
