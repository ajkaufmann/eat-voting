var Sequelize, client, dbHost, dbName, dbPass, dbUser, importTable, model, models, name, path;

path = require('path');

Sequelize = require('sequelize');

dbName = process.env.EST_DB_NAME || 'Voting';

dbUser = process.env.EST_DB_USER || 'estuser';

dbPass = process.env.EST_DB_PASS || 'password';

dbHost = process.env.EST_DB_HOST || 'localhost';

client = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  logging: false,
  dialect: 'mysql',
  timezone: '+00:00'
});

importTable = function(name) {
  var _name;
  _name = name.split('.').join('/');
  return client["import"](path.join(__dirname, "./models/" + _name));
};

models = {
  Medic: importTable('medic'),
  Applicant: importTable('applicant')
};

for (name in models) {
  model = models[name];
  console.log("NAME: " + name);
  if (model.options.hasOwnProperty('associate')) {
    model.options.associate(models);
  }
  if (model.options.hasOwnProperty('overrideScopes')) {
    model.options.overrideScopes(models);
  }
}

module.exports = client;

// ---
