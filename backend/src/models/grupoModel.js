const db = require('../../database');
const { randomBytes } = require('crypto');

function generateCode() {
  return randomBytes(3).toString('hex').toUpperCase(); // 6 chars
}

function createGroup({ titulo, descricao, publico = 1 }) {
  return new Promise((resolve, reject) => {
    const codigo = generateCode();
    const sql = `INSERT INTO grupos (titulo, descricao, codigo, publico, criado_em) VALUES (?, ?, ?, ?, ?)`;
    const params = [titulo, descricao, codigo, publico, new Date().toISOString()];
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, codigo });
    });
  });
}

function findByCodigo(codigo) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM grupos WHERE codigo = ? LIMIT 1';
    db.get(sql, [codigo], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function joinGroup(codigo, usuario_email) {
  return new Promise(async (resolve, reject) => {
    try {
      const grupo = await findByCodigo(codigo);
      if (!grupo) return resolve({ joined: false, reason: 'Grupo não encontrado' });
      const sql = `INSERT OR IGNORE INTO grupo_membros (grupo_id, usuario_email, criado_em) VALUES (?, ?, ?)`;
      db.run(sql, [grupo.id, usuario_email, new Date().toISOString()], function(err) {
        if (err) return reject(err);
        resolve({ joined: true, grupo });
      });
    } catch (err) {
      reject(err);
    }
  });
}

function listGroups() {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id, titulo, descricao, codigo, publico FROM grupos ORDER BY id DESC`;
    db.all(sql, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

module.exports = { createGroup, findByCodigo, joinGroup, listGroups };
