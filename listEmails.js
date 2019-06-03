require('dotenv').config();

const ChoirGenius = require('choirgenius');

const choirGenius = new ChoirGenius('https://hcamusic.org');
const username = process.env.CHOIR_GENIUS_USERNAME;
const password = process.env.CHOIR_GENIUS_PASSWORD;

const main = async () => {
  await choirGenius.login(username, password);
  const allMembers = await choirGenius.getMembers();
  const chorusMembers = allMembers.filter(member =>
    member.roles.includes('Member')
  );

  console.log(chorusMembers.map(member => member.email).join(', '))
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
