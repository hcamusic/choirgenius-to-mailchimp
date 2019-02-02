require('dotenv').config();

const yargs = require('yargs');
const Mailchimp = require('mailchimp-api-v3');
const getChoirGeniusUsers = require('./src/getChoirGeniusUsers');
const _ = require('lodash');

const mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY);
const listId = process.env.MAILCHIMP_LIST_ID;

const argv = yargs.alias('f', 'file').argv;

const main = async () => {
  const { file } = argv;

  const cgUsers = await getChoirGeniusUsers(file);
  const chorusMembers = cgUsers.filter(member =>
    member.roles.includes('Member')
  );
  const chorusMemberMap = _.keyBy(chorusMembers, member => member.email);
  const chorusMemberEmails = Object.keys(chorusMemberMap);

  const listMembers = await mailchimp.get(`/lists/${listId}/members`, {
    count: 100
  });

  const listMembersMap = _.keyBy(
    listMembers.members,
    member => member.email_address
  );

  const listMemberEmails = Object.keys(listMembersMap);

  const emailsToAdd = _.difference(chorusMemberEmails, listMemberEmails).map(
    email => {
      const member = chorusMemberMap[email];

      return {
        method: 'post',
        path: `/lists/${listId}/members`,
        body: {
          email_address: member.email,
          status: 'subscribed',
          merge_fields: {
            'First Name': member.firstName,
            'Last Name': member.lastName,
            'Phone Number':
              member.mobilePhone || member.homePhone || member.workPhone,
            Birthday: member.birthday
          }
        }
      };
    }
  );

  const emailsToRemove = _.difference(listMemberEmails, chorusMemberEmails).map(
    email => ({
      method: 'delete',
      path: `/lists/${listId}/members/${listMembersMap[email].id}`
    })
  );

  const batchActions = emailsToAdd.concat(emailsToRemove);

  if (batchActions.length > 0) {
    console.log(
      `Adding ${emailsToAdd.length}, removing ${emailsToRemove.length}`
    );

    const results = await mailchimp.batch(batchActions);

    const errors = results
      .filter(result => result.errors)
      .map(result => result.errors);

    if (errors.length > 0) {
      console.log('Failed to update mailchimp list');
      console.error(errors);
      process.exit(1);
    }
  }

  console.log('Everything up to date!');
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
