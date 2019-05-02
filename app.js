const express = require('express');
const bodyParser = require('body-parser');

class BlockAPI {
  constructor() {
    this.app = express();
    this.initExpress();
    this.initExpressMiddleware();
    this.initController();
    this.start();
  }

  initExpress() {
    this.app.set('port', 8000);
  }

  initExpressMiddleware() {
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
  }

  initController() {
    require('./controller/block')(this.app);
  }

  start() {
    const port = this.app.get('port');
    this.app.listen(port, () => {
      console.log(`Server listening for port: ${port}`);
    })
  }
}

new BlockAPI();
