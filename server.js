const co = require('co');
const voter = require('./voter');

co(function*() {
  var voterInstance;
  voterInstance = new voter();
  console.log(voterInstance);
  yield voterInstance.start();
  // return yield voterInstance.start();
  return;
})["catch"](function(err) {
  console.log(err.stack);
});