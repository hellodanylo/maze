const mustache = require('mustache');
const $ = require('jquery');

const template = `
  <h1>{{percent}}%</h1>
`;

class ProgressBar {
  constructor(element) {
    this.element = element;
  }

  update(percent) {
    this.element.html(mustache.render(template, {percent}));
  }

  fail() {
    this.element.html(mustache.render(template, {percent: ':(....'}));
  }
}

module.exports = ProgressBar;