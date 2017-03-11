const path = require('path');
const express = require('express');
const app = express();

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/sounds', express.static(path.join(__dirname, 'sounds')));
app.use('/', express.static(path.join(__dirname, 'html')));

app.use(require('webpack-dev-middleware')(require('webpack')({
  entry: './js/app.js',
  output: {
    path: '/',
    filename: 'bundle.js'
  },
  devtool: 'inline-source-map'
}), {
  noInfo: false,
  quit: false,
  lazy: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: true,
  },
  publicPath: '/',
  index: 'index.html',
  serverSideRender: false,
  stats: {
    colors: true
  }
}));

app.listen(9001, function() {
  console.log('Listening on port 9001.');
})