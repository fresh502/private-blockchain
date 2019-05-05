function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function clientErrorHandler(err, req, res, next) {
  if (res.statusCode >= 400 && res.statusCode < 500)  {
    return res.end(err.message);
  }
  next(err);
}

function serverErrorHandler(err, req, res, next) {
  res.status(500).end('Server internal error');
}

module.exports = {
  logErrors,
  clientErrorHandler,
  serverErrorHandler
};
