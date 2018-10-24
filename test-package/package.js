// Using the "wrapper package" version format
Package.describe({
  name: "test-package",
  summary: "Test package for the mocha package"
});


Package.onUse(function (api) {
  api.versionsFrom('1.3');

  api.use([
    'meteor',
    'mongo',
    "ecmascript"
  ]);

});

Package.onTest(function (api) {
  api.use([
    'hubroedu:mocha@2.4.5_3',
    'hubroedu:mocha-console-runner@=0.2.2',
    'ecmascript',
    'test-package'
  ]);

  api.addFiles('mocha-tests.js');
  api.addFiles('mocha-globals-tests.js');
});
