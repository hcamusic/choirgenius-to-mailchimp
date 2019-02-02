const fs = require('fs-extra');
const csvjson = require('csvjson');
const _ = require('lodash');

module.exports = async file => {
  const fileData = await fs.readFile(file, 'utf8');

  const csvData = await csvjson.toObject(fileData, {
    quote: '"'
  });

  return csvData.map(cgUser => {
    const user = {};

    Object.entries(cgUser).forEach(([key, value]) => {
      if (value) {
        user[_.camelCase(key)] = value;
      }
    });

    user.roles = user.roles ? user.roles.split(',') : [];

    return user;
  });
};
