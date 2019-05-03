class BlockController {
  constructor(app, dao) {
    this.app = app;
    this.initModel(dao);
    this.getBlockByHeight();
    this.postNewBlock();
  }

  initModel(dao) {
    this.model = require('../model/blockchain')(dao);
  }

  getBlockByHeight() {
    this.app.get('/block/:height', async (req, res) => {
      const height = parseInt(req.params.height);
      if (isNaN(height)) return res.status(400).end('Height parameter must be integer');

      const block = await this.model.getBlockByHeight(height);
      if (!block) return res.status(404).end('Height parameter is out of bounds.');

      res.json(block);
    })
  }

  postNewBlock() {
    this.app.post('/block', async (req, res) => {
      const { body: { body } } = req;

      if (!body || body === '') return res.status(400).end('Body should not be empty');

      const block = await this.model.addBlock(body);
      res.json(block);
    })
  }
}

module.exports = (app, dao) => { return new BlockController(app, dao) };
