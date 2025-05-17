const {google} = require('googleapis');
const path = require('path');
const key = require(process.env.SA_KEY_PATH);
const auth = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/admin.directory.user','https://www.googleapis.com/auth/gmail.settings.basic','https://www.googleapis.com/auth/gmail.modify'],
  process.env.DELEGATED_ADMIN_EMAIL
);

// Create a new user (Gmail account) in your domain
async function createProjectEmail(userName, password) {
  const service = google.admin({version:'directory_v1', auth});
  const res = await service.users.insert({
    requestBody: {
      primaryEmail: userName + '@' + key.domain,
      name: {givenName: userName, familyName: 'Homebuild'},
      password,
      changePasswordAtNextLogin: false
    }
  });
  return res.data;
}

// Send templated email
async function sendProjectEmail(to, subject, body) {
  const gmail = google.gmail({version:'v1', auth});
  const raw = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\n\r\n${body}`
  ).toString('base64').replace(/\+/g,'-').replace(/\//g,'_');
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
}

// List & parse emails to update project data
async function ingestEmails() {
  const gmail = google.gmail({version:'v1', auth});
  const list = await gmail.users.messages.list({userId:'me', maxResults:10});
  for(let msg of list.data.messages||[]) {
    const detail = await gmail.users.messages.get({userId:'me', id:msg.id});
    // parse detail.data.payload and update Task/BudgetItem metadata
  }
}

module.exports = { createProjectEmail, sendProjectEmail, ingestEmails };
