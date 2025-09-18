const db = require('../../database');

function findByEmail(email) {
  return new Promise((resolve, reject) => {
    // incluir senha_hash e nome para permitir autenticação
    const sql = 'SELECT id, nome, email, senha_hash, confirmado FROM usuarios WHERE email = ? LIMIT 1';
    db.get(sql, [email], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function createUser(user) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO usuarios (nome, email, senha_hash, confirmado, confirmation_token, criado_em)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [user.nome, user.email, user.senha_hash, user.confirmado, user.confirmation_token, user.criado_em];
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}

function confirmByToken(token) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE usuarios SET confirmado = 1, confirmation_token = NULL WHERE confirmation_token = ?`;
    db.run(sql, [token], function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}

module.exports = { findByEmail, createUser, confirmByToken };
