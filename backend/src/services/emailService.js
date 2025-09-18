const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

let transporter;
try {
  transporter = nodemailer.createTransport(
    SMTP_USER
      ? {
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: SMTP_PORT === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS }
        }
      : { jsonTransport: true }
  );
} catch (err) {
  console.error('Erro ao configurar transporter:', err.message || err);
}

async function sendConfirmationEmail(email, token) {
  const confirmLink = `${APP_URL}/api/usuarios/confirmacao?token=${token}`;
  const mailOptions = {
    from: SMTP_USER ? SMTP_USER : 'no-reply@connexa.local',
    to: email,
    subject: 'Confirme seu cadastro Connexa',
    text: `Olá,\n\nClique no link para confirmar seu cadastro: ${confirmLink}\n\nSe você não solicitou, ignore este email.`,
    html: `<p>Olá,</p><p>Clique no link para confirmar seu cadastro: <a href="${confirmLink}">${confirmLink}</a></p>`
  };

  if (!transporter) throw new Error('Transporter de email não configurado');
  const info = await transporter.sendMail(mailOptions);
  return info;
}

module.exports = { sendConfirmationEmail };
