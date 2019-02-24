const crypto = require('crypto');
const Mailchimp = require('mailchimp-api-v3');
const _ = require('lodash');

const mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY);
const listId = process.env.MAILCHIMP_LIST_ID;

module.exports = async choirGeniusMembers => {
  console.log('Updating MailChimp');

  const chorusMembers = choirGeniusMembers.filter(member =>
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

  const emailsToUpdate = chorusMembers.map(member => {
    const subscriberHash = crypto
      .createHash('md5')
      .update(member.email)
      .digest('hex');

    return {
      method: 'put',
      path: `/lists/${listId}/members/${subscriberHash}`,
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
  });

  const emailsToRemove = _.difference(listMemberEmails, chorusMemberEmails).map(
    email => ({
      method: 'delete',
      path: `/lists/${listId}/members/${listMembersMap[email].id}`
    })
  );

  const batchActions = emailsToUpdate.concat(emailsToRemove);

  if (batchActions.length > 0) {
    console.log(
      `Adding/Updating ${emailsToUpdate.length}, removing ${
        emailsToRemove.length
      }`
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

  console.log('MailChimp up to date!');
};