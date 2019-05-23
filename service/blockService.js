const hex2ascii = require('hex2ascii')
const dao = require('../dao/levelSandbox')();

class BlockService {
  constructor(mempoolService) {
    this.mempoolService = mempoolService;
    this.initModel(dao);
  }

  initModel(dao) {
    this.model = require('../model/blockchain')(dao);
  }

  async addBlock(address, { dec, ra, story }) {
    this.mempoolService.verifyAddressRequest(address);
    const block = await this.model.addBlock({
      address,
      star: {
        ra,
        dec,
        story: Buffer(story).toString('hex')
      }
    })
    this.mempoolService.removeValidation(address)
    return block
  }

  async getBlockByHash(hash) {
    const block = await this.model.getBlockByHash(hash);
    if (block) block.body.star.storyDecoded = hex2ascii(block.body.star.story);
    return block
  }

  async getBlocksByAddress(address) {
    const blocks = await this.model.getBlocksByAddress(address);
    blocks.forEach(block => {
      block.body.star.storyDecoded = hex2ascii(block.body.star.story);
    });
    return blocks
  }

  async getBlockByHeight(height) {
    const block = await this.model.getBlockByHeight(height);
    if (block) block.body.star.storyDecoded = hex2ascii(block.body.star.story);
    return block
  }
}

module.exports = (mempoolService) => { return new BlockService(mempoolService) };
