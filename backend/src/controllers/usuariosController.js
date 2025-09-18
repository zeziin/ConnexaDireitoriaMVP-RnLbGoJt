const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const usuarioModel = require('../models/usuarioModel');
const emailService = require('../services/emailService');

const DOMAIN_REGEX = /^[A-Za-z0-9._%+-]+@universidade\.edu\.br$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

async function cadastrar(req, res) {
  try {
    const { email, senha, nome } = req.body || {};

    if (!email) return res.status(400).json({ error: 'Email é obrigatório.' });
    if (!DOMAIN_REGEX.test(email)) {
      return res.status(400).json({ error: 'Use seu email institucional @universidade.edu.br.' });
    }

    if (!senha) return res.status(400).json({ error: 'Senha é obrigatória.' });
    if (!PASSWORD_REGEX.test(senha)) {
      return res.status(400).json({
        error: 'Senha inválida. Deve ter ao menos 8 caracteres, incluir letra maiúscula, minúscula e número.'
      });
    }

    const existing = await usuarioModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Este email já está cadastrado.' });
    }

    const hashed = await bcrypt.hash(senha, 10);
    const confirmationToken = uuidv4();

    const user = {
      nome: nome || null,
      email,
      senha_hash: hashed,
      confirmado: 0,
      confirmation_token: confirmationToken,
      criado_em: new Date().toISOString()
    };

    const created = await usuarioModel.createUser(user);

    // enviar email (não bloqueante para o fluxo principal)
    emailService.sendConfirmationEmail(email, confirmationToken).catch((err) => {
      console.error('Falha ao enviar email de confirmação:', err.message || err);
    });

    return res.status(201).json({ message: 'Cadastro realizado. Verifique seu email para confirmar a conta.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno ao processar cadastro.' });
  }
}

async function confirmar(req, res) {
  try {
    const { token } = req.query || {};
    if (!token) return res.status(400).json({ error: 'Token de confirmação ausente.' });

    const result = await usuarioModel.confirmByToken(token);
    if (result.changes && result.changes > 0) {
      return res.json({ message: 'Email confirmado com sucesso.' });
    }
    return res.status(404).json({ error: 'Token inválido ou já utilizado.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao confirmar email.' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body || {};
    if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

    const user = await usuarioModel.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const match = await bcrypt.compare(senha, user.senha_hash);
    if (!match) return res.status(401).json({ error: 'Credenciais inválidas.' });

    // Retornar informação mínima do usuário (não expor senha)
    const payload = { id: user.id, nome: user.nome, email: user.email, confirmado: !!user.confirmado };
    return res.json({ message: 'Autenticado com sucesso.', user: payload });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro interno ao autenticar.' });
  }
}

module.exports = { cadastrar, confirmar, login };
