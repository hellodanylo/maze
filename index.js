const path = require('path');
const express = require('express');
const mustache = require('mustache');

const fs = require('fs');
const concat = require('concat-stream');
const co = require('co');

const DIST = 'dist';
const PORT = process.argv[2]||9000;
const PREFIX = process.argv[3]||'';
const ROOT_TEMPLATE = path.join(__dirname, 'html', 'index.html');

function fetch(path) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(path, {encoding: 'utf-8'});
    stream.on('error', reject);
    stream.pipe(concat(resolve));
  });
}

const app = express();
app.use('/', express.static(path.join(__dirname, DIST)));
app.get('/', (req, res) => {
  co(function*() {
    const template = yield fetch(ROOT_TEMPLATE);
    res.send(mustache.render(template, {PREFIX}));
  });
});

app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}.`);
});