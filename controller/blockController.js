class BlockController {
  constructor(app) {
    this.app = app;
    this.initService();
    this.postRequestValidation();
    this.postValidationRequest()
    this.postBlock();
    this.getBlockByHash();
    this.getBlocksByAddress();
    this.getBlockByHeight();
  }

  initService() {
    this.mempoolService = require('../service/mempoolService')();
    this.blockService = require('../service/blockService')(this.mempoolService);
  }

  postRequestValidation() {
    this.app.post('/requestValidation', async (req, res, next) => {
      try {
        const { body: { address } } = req;
        if (!address || address === '') {
          res.status(400);
          return next(new Error('Address should not be empty'));
        }
        const requestValidation = this.mempoolService.addRequestValidation(address, this._getCurrentTime())
        res.json(requestValidation)
      } catch (e) {
        next(e)
      }
    })
  }

  postValidationRequest() {
    this.app.post('/message-signature/validate', async (req, res, next) => {
      try {
        const { body: { address, signature } } = req
        if (!address || !signature || address === '' || signature === '') {
          res.status(400)
          return next(new Error('Address or Signature should not be empty'));
        }
        const validRequest = this.mempoolService.validateRequestByWallet(address, signature, this._getCurrentTime())
        res.json(validRequest)
      } catch (e) {
        if (e.message === 'No request validation' || e.message === 'Invalid message') res.status(400);
        next(e)
      }
    })
  }

  postBlock() {
    this.app.post('/block', async (req, res, next) => {
      try {
        const { body: { address, star: { dec, ra, story } } } = req;

        if (!address || address === '') {
          res.status(400);
          return next(new Error('Address should not be empty'));
        }

        if (!dec || dec === '' || !ra || ra === '' || !story || story === '') {
          res.status(400);
          return next(new Error('Star properties should not be empty'));
        }

        if (!this._isASCII(story) || story.length > 250) {
          res.status(400)
          return next(new Error('Star story supports only ASCII text, limited to 250 words'))
        }

        const block = await this.blockService.addBlock(address, { dec, ra, story });
        res.json(block);
      } catch (e) {
        if (e.message === 'Not verified address request') res.status(400);
        next(e);
      }
    })
  }

  getBlockByHash() {
    this.app.get('/stars/hash:hash', async (req, res, next) => {
      try {
        const hash = req.params.hash.slice(1)
        if (!hash || hash === '') {
          res.status(400);
          return next(new Error('Hash parameter should be string text'));
        }

        const block = await this.blockService.getBlockByHash(hash);
        if (!block) {
          res.status(404);
          return next(new Error('No hash exists'));
        }
        res.json(block);
      } catch (e) {
        next(e);
      }
    })
  }

  getBlocksByAddress() {
    this.app.get('/stars/address:address', async (req, res, next) => {
      try {
        const address = req.params.address.slice(1)
        if (!address || address === '') {
          res.status(400);
          return next(new Error('Address parameter should be string text'));
        }

        const block = await this.blockService.getBlocksByAddress(address);
        if (!block) {
          res.status(404);
          return next(new Error('No Address exists'));
        }
        res.json(block);
      } catch (e) {
        next(e);
      }
    })
  }

  getBlockByHeight() {
    this.app.get('/block/:height', async (req, res, next) => {
      try {
        const height = parseInt(req.params.height);
        if (isNaN(height)) {
          res.status(400);
          return next(new Error('Height parameter should be integer'));
        }

        const block = await this.blockService.getBlockByHeight(height);
        if (!block) {
          res.status(404);
          return next(new Error('Height parameter is out of bounds.'));
        }
        res.json(block);
      } catch (e) {
        next(e);
      }
    })
  }

  _getCurrentTime() {
    return new Date().getTime().toString().slice(0,-3)
  }

  _isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
  }
}

module.exports = (app) => { return new BlockController(app) };
