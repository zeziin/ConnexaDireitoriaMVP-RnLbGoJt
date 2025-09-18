const grupoModel = require('../models/grupoModel');

async function create(req, res) {
  try {
    const { titulo, descricao } = req.body || {};
    if (!titulo || String(titulo).trim() === '') return res.status(400).json({ error: 'Título é obrigatório.' });
    const result = await grupoModel.createGroup({ titulo: String(titulo).trim(), descricao: String(descricao || '').trim() });
    return res.status(201).json({ message: 'Grupo criado.', codigo: result.codigo });
  } catch (err) {
    console.error('Erro criando grupo:', err.message || err);
    return res.status(500).json({ error: 'Erro criando grupo.' });
  }
}

async function list(req, res) {
  try {
    const groups = await grupoModel.listGroups();
    // separar em públicos e meus (sem autenticação retornamos tudo como public)
    return res.json({ myGroups: [], publicGroups: groups });
  } catch (err) {
    console.error('Erro listando grupos:', err.message || err);
    return res.status(500).json({ error: 'Erro listando grupos.' });
  }
}

async function join(req, res) {
  try {
    const { codigo, usuario_email } = req.body || {};
    if (!codigo) return res.status(400).json({ error: 'Código é obrigatório.' });
    // usuario_email é opcional; em um sistema real viria do token/ sessão
    const email = usuario_email || null;
    const result = await grupoModel.joinGroup(codigo, email);
    if (!result.joined) return res.status(404).json({ error: result.reason || 'Não foi possível entrar no grupo.' });
    return res.json({ message: 'Entrou no grupo.', grupo: result.grupo });
  } catch (err) {
    console.error('Erro ao entrar no grupo:', err.message || err);
    return res.status(500).json({ error: 'Erro ao entrar no grupo.' });
  }
}

module.exports = { create, list, join };
