class mempool {
  constructor() {
    this.timeoutRequestsWindowTime = 5 * 60 * 1000;
    this.mempool = [];
    this.timeoutRequests = [];
  }

  addRequestValidation(address, requestTimeStamp) {
    let requestValidation = this._getRequestValidation(address, requestTimeStamp);
    if (requestValidation) return requestValidation;

    const request = {
      walletAddress: address,
      requestTimeStamp
    };
    this.mempool.push(request);
    this._setTimeoutToRemoveValidationRequest(address);

    requestValidation = this._getRequestValidation(address, requestTimeStamp);
    return requestValidation
  }

  _getRequestValidation(address, requestTimeStamp) {
    const request = this.mempool.find(({ walletAddress }) =>  address === walletAddress );
    if (!request) return null;
    const message = this._setMessage(request);
    const validationWindow = this._setValidationWindow(request, requestTimeStamp);
    return { ...request, message, validationWindow }
  }

  _setTimeoutToRemoveValidationRequest(address) {
    setTimeout(() => {
      const reqIdx = this.mempool.findIndex(({ walletAddress }) =>  address === walletAddress );
      this.timeoutRequests.push(this.mempool.splice(reqIdx, 1)[0])
    }, this.timeoutRequestsWindowTime)
  }

  _setMessage(request) {
    const messageSuffix = 'starRegistry';
    const { walletAddress, requestTimeStamp } = request
    return `${walletAddress}:${requestTimeStamp}:${messageSuffix}`
  }

  _setValidationWindow(request, requestTimeStamp) {
    const { requestTimeStamp: prevRequestTimestamp } = request;
    const timeElapse = requestTimeStamp - prevRequestTimestamp;
    return (this.timeoutRequestsWindowTime / 1000) - timeElapse
  }
}

module.exports = () => { return new mempool() };