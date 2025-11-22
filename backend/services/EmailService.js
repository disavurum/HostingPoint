const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.enabled = false;
    this.init();
  }

  init() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    // Only initialize if SMTP is configured
    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      this.enabled = true;
      logger.info('Email service initialized');
    } else {
      logger.warn('Email service not configured - emails will be logged only');
    }
  }

  async sendEmail(to, subject, html, text = null) {
    const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@hostingpoint.net';

    const mailOptions = {
      from: smtpFrom,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if no text provided
    };

    if (!this.enabled) {
      logger.info('Email would be sent (SMTP not configured):', {
        to,
        subject,
        preview: text || html.substring(0, 100)
      });
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully:', { to, subject, messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Failed to send email:', { to, subject, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email, forumName, forumUrl) {
    const subject = `Hoş Geldiniz - ${forumName} Forumunuz Hazır!`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HostingPoint</h1>
          </div>
          <div class="content">
            <h2>Forumunuz Hazır! 🎉</h2>
            <p>Merhaba,</p>
            <p><strong>${forumName}</strong> adlı Discourse forumunuz başarıyla kuruldu ve kullanıma hazır!</p>
            <p>Forumunuza aşağıdaki linkten erişebilirsiniz:</p>
            <p style="text-align: center;">
              <a href="${forumUrl}" class="button">Foruma Git</a>
            </p>
            <p><strong>Forum URL:</strong> <a href="${forumUrl}">${forumUrl}</a></p>
            <p>İyi forumlar!</p>
            <p>HostingPoint Ekibi</p>
          </div>
          <div class="footer">
            <p>Bu email HostingPoint tarafından otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(email, subject, html);
  }

  async sendDeploymentFailedEmail(email, forumName, error) {
    const subject = `Forum Kurulumu Başarısız - ${forumName}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #d32f2f; color: #fff; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .error { background: #ffebee; padding: 15px; border-left: 4px solid #d32f2f; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HostingPoint</h1>
          </div>
          <div class="content">
            <h2>Forum Kurulumu Başarısız</h2>
            <p>Merhaba,</p>
            <p><strong>${forumName}</strong> adlı forumunuzun kurulumu sırasında bir hata oluştu.</p>
            <div class="error">
              <strong>Hata:</strong> ${error}
            </div>
            <p>Lütfen tekrar deneyin veya destek ekibimizle iletişime geçin.</p>
            <p>HostingPoint Ekibi</p>
          </div>
          <div class="footer">
            <p>Bu email HostingPoint tarafından otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();

