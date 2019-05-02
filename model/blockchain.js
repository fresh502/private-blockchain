const SHA256 = require('crypto-js/sha256');
const { LevelSandbox } = require('../dao/levelSandbox');
const { Block } = require('./block');

class Blockchain {
  constructor() {
    this.levelSandbox = new LevelSandbox();
  }

  async addBlock(newBlock, isGenesis) {
    const height = await this.getBlocksHeight();
    if (height === 0 && isGenesis) await this.addBlock(new Block("First block in the chain - Genesis block"), true);

    newBlock.height = height;
    newBlock.time = new Date().getTime().toString().slice(0, -3);
    if (newBlock.height > 0) {
      const previousBlock = await this.getBlock(newBlock.height - 1);
      newBlock.previousBlockHash = previousBlock.hash;
    }
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    return this.levelSandbox.addLevelDBData(newBlock.height, JSON.stringify(newBlock));
  }

  async getBlocksHeight() {
    const count = await this.levelSandbox.getBlocksCount();
    return isNaN(count) ? 0 : count
  }

  async getBlock(blockHeight) {
    return JSON.parse(await this.levelSandbox.getLevelDBData(blockHeight));
  }

  async validateBlock(blockHeight) {
    const block = await this.getBlock(blockHeight);
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
    const block = await this.getBlock(blockHeight);
    const previousBlock = await this.getBlock(previousBlockHeight);

    if (block.previousBlockHash !== previousBlock.hash) {
      console.log(`Block #${previousBlockHeight} and Block #${blockHeight} links invalid`);
      return false;
    }
    return true
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

}

// for test
(async () => {
  try {
    const myBlockChain = new Blockchain();

    (function theLoop (i) {
      setTimeout(async () => {
        const blockTest = new Block("Test Block - " + (i + 1));
        const block = await myBlockChain.addBlock(blockTest);
        console.log('======== block =========');
        console.log(block);
        console.log('========================');
          i++;
          if (i < 10) theLoop(i);
          if (i === 10) {
            await myBlockChain.validateChain();
          }
      }, 1000);
    })(0);
  } catch (e) {
    console.error(e);
  }
})();
