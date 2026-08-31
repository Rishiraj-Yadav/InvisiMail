import formData from 'form-data';
import Mailgun from 'mailgun.js';

const apiKey = process.env.MAILGUN_API_KEY;

if (!apiKey) {
  throw new Error('MAILGUN_API_KEY is not configured');
}

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: apiKey,
  url: process.env.MAILGUN_API_URL || 'https://api.eu.mailgun.net',
});

export { mg };