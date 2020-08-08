require('dotenv').config();

const HarmonySite = require('harmonysite');
const updateMailChimp = require('./src/updateMailChimp');

const harmonysite = new HarmonySite('https://www.hcamusic.org');
const username = process.env.HARMONYSITE_USERNAME;
const password = process.env.HARMONYSITE_PASSWORD;
const activeMemberGrouping = 3;

const main = async () => {
  await harmonysite.login(username, password);
  const members = await harmonysite.members.list(activeMemberGrouping);

  await updateMailChimp(members);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
