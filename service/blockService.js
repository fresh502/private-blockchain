const dao = require('../dao/levelSandbox')();

class BlockService {
  constructor(mempoolService) {
    this.mempoolService = mempoolService;
    this.initModel(dao);
  }

  initModel(dao) {
    this.model = require('../model/blockchain')(dao);
  }

  addBlock(address, { dec, ra, story }) {
    this.mempoolService.verifyAddressRequest(address);
    return this.model.addBlock({
      address,
      star: {
        ra,
        dec,
        story: Buffer(story).toString('hex')
      }
    })
  }
}

module.exports = (mempoolService) => { return new BlockService(mempoolService) };
