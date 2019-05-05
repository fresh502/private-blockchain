const SHA256 = require('crypto-js/sha256');
const { Block } = require('./block');

class Blockchain {
  constructor(dao) {
    this.dao = dao;
  }

  async addBlock(data) {
    const block = new Block(data);
    block.height = await this.getBlocksHeight();
    block.time = new Date().getTime().toString().slice(0, -3);
    if (block.height > 0) {
      const previousBlock = await this.getBlockByHeight(block.height - 1);
      block.previousBlockHash = previousBlock.hash;
    }
    block.hash = SHA256(JSON.stringify(block)).toString();
    return this.dao.addBlock(block.height, block);
  }

  async getBlocksHeight() {
    const count = await this.dao.getBlocksCount();
    return isNaN(count) ? 0 : count
  }

  async getBlockByHeight(height) {
    return this.dao.getBlockByHeight(height);
  }
}

module.exports = (dao) => { return new Blockchain(dao) };
