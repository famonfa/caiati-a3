import * as nodemailer from 'nodemailer';

export class Mailer {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });
  }

  async sendNotification(success = true) {

    const mailOptions = success ? {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: 'Prenotami Booking Page Available! 🎉',
      html: `
        <h1>Prenotami Booking Page Available!</h1>
        <p>The booking page you've been waiting for is now accessible.</p>
        <p>URL: https://prenotami.esteri.it/Services/Booking/224</p>
        <p>Please visit the page as soon as possible!</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `
    } : {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: 'Prenotami Scraper Failed ❌',
      html: `
        <h1>Prenotami Scraper Failed</h1>
        <p>The scraper encountered an error while trying to access the booking page.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Notification email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}