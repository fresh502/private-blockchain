const express = require('express');
const bodyParser = require('body-parser');
const { logErrors, clientErrorHandler, serverErrorHandler } = require('./middleware/errorHandler');

class WebAPI {
  constructor() {
    this.app = express();
    this.initExpress();
    this.initExpressMiddleware();
    this.initController();
    this.initErrorHandler();
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
    require('./controller/blockController')(this.app);
  }

  initErrorHandler() {
    this.app.use(logErrors);
    this.app.use(clientErrorHandler);
    this.app.use(serverErrorHandler);
  }

  start() {
    const port = this.app.get('port');
    this.app.listen(port, () => {
      console.log(`Server listening for port: ${port}`);
    })
  }
}

new WebAPI();
