const SHA256 = require('crypto-js/sha256');
const { Block } = require('../model/block');

class Block {
  constructor(app) {
    this.app = app;
    this.getBlockByHeight();
    this.postNewBlock();
  }

  getBlockByHeight() {
    this.app.get('/api/block/:height', (req, res) => {

    })
  }

  postNewBlock() {
    this.app.post('/api/block', (req, res) => {

    })
  }
}

module.exports = (app) => { return new Block(app) };
