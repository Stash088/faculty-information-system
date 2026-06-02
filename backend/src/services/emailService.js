/**
 * Email-сервис (nodemailer)
 * @module services/emailService
 */

const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.warn('[email] SMTP не настроен, письмо не отправлено:', subject);
    return { sent: false, reason: 'SMTP not configured' };
  }

  try {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const info = await t.sendMail({ from, to, subject, html, text });
    console.log('[email] Отправлено:', info.messageId);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] Ошибка отправки:', error.message);
    return { sent: false, reason: error.message };
  }
}

async function sendWelcome({ email, firstName, lastName }) {
  const subject = 'Добро пожаловать в Информационную систему ИТНиЦТ';
  const html = `
    <h2>Здравствуйте, ${firstName} ${lastName}!</h2>
    <p>Вы успешно зарегистрированы в Информационной системе Института точных наук и цифровых технологий.</p>
    <p>Для входа используйте ваш email и пароль.</p>
  `;
  const text = `Здравствуйте, ${firstName} ${lastName}!\n\nВы зарегистрированы в ИС ИТНиЦТ.`;
  return sendMail({ to: email, subject, html, text });
}

async function sendPasswordReset({ email, firstName, resetUrl }) {
  const subject = 'Восстановление пароля — ИС ИТНиЦТ';
  const html = `
    <h2>Здравствуйте, ${firstName}!</h2>
    <p>Для восстановления пароля перейдите по ссылке:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Ссылка действительна 1 час.</p>
    <p>Если вы не запрашивали восстановление — проигнорируйте это письмо.</p>
  `;
  const text = `Здравствуйте, ${firstName}!\n\nДля восстановления пароля перейдите по ссылке: ${resetUrl}\n\nСсылка действительна 1 час.`;
  return sendMail({ to: email, subject, html, text });
}

module.exports = {
  getTransporter,
  sendMail,
  sendWelcome,
  sendPasswordReset,
};