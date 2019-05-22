class BlockController {
  constructor(app, dao) {
    this.app = app;
    this.initService();
    this.initModel(dao);
    this.postRequestValidation();
    this.postValidationRequest()
    this.getBlockByHeight();
    this.postNewBlock();
  }

  initModel(dao) {
    this.model = require('../model/blockchain')(dao);
  }

  initService() {
    this.service = require('../service/mempool')();
  }

  postRequestValidation() {
    this.app.post('/requestValidation', async (req, res, next) => {
      try {
        const { body: { address } } = req;
        if (!address || address === '') {
          res.status(400);
          return next(new Error('Address should not be empty'));
        }
        const requestValidation = this.service.addRequestValidation(address, this._getCurrentTime())
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
        const validRequest = this.service.validateRequestByWallet(address, signature, this._getCurrentTime())
        res.json(validRequest)
      } catch (e) {
        if (e.message === 'No request validation' || e.message === 'Invalid message') {
          res.status(400)
          return next(e)
        }
        next(e)
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

        const block = await this.model.getBlockByHeight(height);
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

  postNewBlock() {
    this.app.post('/block', async (req, res, next) => {
      try {
        const { body: { body } } = req;

        if (!body || body === '') {
          res.status(400);
          return next(new Error('Body should not be empty'));
        }

        if (!isNaN(body)) {
          res.status(400);
          return next(new Error('Body should be string of text'));
        }

        const block = await this.model.addBlock(body);

        res.json(block);
      } catch (e) {
        next(e);
      }
    })
  }

  _getCurrentTime() {
    return new Date().getTime().toString().slice(0,-3)
  }
}

module.exports = (app, dao) => { return new BlockController(app, dao) };
