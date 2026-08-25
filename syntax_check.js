try {
  const code = require('fs').readFileSync('app.js', 'utf8');
  const vm = require('vm');
  new vm.Script(code);
} catch (e) {
  console.error(e);
}
