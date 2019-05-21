class BlockController {
  constructor(app, dao) {
    this.app = app;
    this.initService();
    this.initModel(dao);
    this.postRequestValidation();
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
          return next(new Error('Body should not be empty'));
        }
        const requestValidation = await this.service.addRequestValidation(address, new Date().getTime().toString().slice(0,-3))
        res.json(requestValidation)
      } catch (e) {
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
}

module.exports = (app, dao) => { return new BlockController(app, dao) };
