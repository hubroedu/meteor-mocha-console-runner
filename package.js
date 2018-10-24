Package.describe({
  name: 'hubroedu:mocha-console-runner',
  version: '0.3.0',
  summary: 'A mocha console reporter for running your package tests from the command line with spacejam.',
  git: 'https://github.com/hubroedu/meteor-mocha-console-runner.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
  testOnly: true
});

Package.onUse(function(api) {
  api.versionsFrom("1.3");
  api.use(["hubroedu:mocha@=2.4.5_5", 'ecmascript']);
  api.mainModule('ConsoleReporter.js', 'client');
  api.imply("hubroedu:mocha@=2.4.5_5");
});

Package.onTest(function(api) {

});
