require('dotenv').config();

const ChoirGenius = require('choirgenius');
const updateMailChimp = require('./src/updateMailChimp');

const choirGenius = new ChoirGenius('https://hcamusic.org');
const username = process.env.CHOIR_GENIUS_USERNAME;
const password = process.env.CHOIR_GENIUS_PASSWORD;

const main = async () => {
  await choirGenius.login(username, password);
  const members = await choirGenius.getMembers();
  const chorusMembers = members.filter(member =>
    member.roles.includes('Member')
  );

  console.log(chorusMembers);
  // await updateMailChimp(chorusMembers);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
