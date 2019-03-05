var soap = require('soap');

module.exports = async chorusMembers => {
  const oneCall = await soap.createClientAsync(
    'https://api.onecallnow.com/WebServiceSource/3.2/Soap.svc?wsdl'
  );

  const login = await oneCall.LoginWithPasswordAsync({
    Service: 1,
    GroupKey: '340246',
    Password: 'HCAmus1c'
  });

  const LoginToken = login[0].LoginWithPasswordResult.LoginToken;

  const subgroupInfo = await oneCall.RetrieveSubgroupInfoAsync({
    LoginToken,
    GetCounts: true
  });

  console.log(JSON.stringify(subgroupInfo, null, 2));
};

module.exports().catch(console.log);
