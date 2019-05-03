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

  async validateChain() {
    const height = await this.getBlocksHeight();
    const validatePromises = [];
    for (let i = 0; i < height; i++) {
      validatePromises.push(this.validateBlock(i));
      validatePromises.push(this.validateBlockLinks(i));
    }
    const results = await Promise.all(validatePromises);
    if (!results.includes(false)) console.log('No errors detected');
  }

  async validateBlock(blockHeight) {
    const block = await this.getBlockByHeight(blockHeight);
    const blockHash = block.hash;
    block.hash = '';
    const validBlockHash = SHA256(JSON.stringify(block)).toString();

    if (blockHash !== validBlockHash) {
      console.log(`Block #${blockHeight} invalid hash:\n${blockHash}<>${validBlockHash}`);
      return false;
    }
    return true;
  }

  async validateBlockLinks(blockHeight) {
    if (blockHeight === 0) return true;

    const previousBlockHeight = blockHeight - 1;
    const block = await this.getBlockByHeight(blockHeight);
    const previousBlock = await this.getBlockByHeight(previousBlockHeight);

    if (block.previousBlockHash !== previousBlock.hash) {
      console.log(`Block #${previousBlockHeight} and Block #${blockHeight} links invalid`);
      return false;
    }
    return true
  }

}

module.exports = (dao) => { return new Blockchain(dao) };
