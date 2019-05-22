const bitcoinMessage = require('bitcoinjs-message');

class MempoolService {
  constructor() {
    this.timeoutRequestsWindowTime = 5 * 60 * 1000;
    this.mempool = [];
    this.mempoolValid = [];
  }

  addRequestValidation(address, currentTime) {
    let requestValidation = this._getRequestValidation(address);
    if (!requestValidation) {
      const request = {
        walletAddress: address,
        requestTimeStamp: currentTime
      };
      this.mempool.push(request);
      this._setTimeoutToRemoveValidationRequest(address);

      requestValidation = this._getRequestValidation(address);
    }

    const message = this._setMessage(requestValidation)
    const validationWindow = this._setValidationWindow(requestValidation, currentTime)
    return { ...requestValidation, message, validationWindow }
  }

  validateRequestByWallet(address, signature, currentTime) {
    const requestValidation = this._getRequestValidation(address)
    if (!requestValidation) throw new Error('No request validation')
    const message = this._setMessage(requestValidation)
    const validationWindow = this._setValidationWindow(requestValidation, currentTime)

    const isValid = bitcoinMessage.verify(message, address, signature)
    if (!isValid) throw new Error('Invalid message')

    const ret = {
      register: true,
      status: {
        address,
        requestTimeStamp: requestValidation.requestTimeStamp,
        message,
        validationWindow,
        messageSignature: true
      }
    }
    this.mempoolValid.push(ret)
    return ret
  }

  verifyAddressRequest(address) {
    const validateRequest = this.mempoolValid.find(({ status: { address: walletAddress } }) =>  address === walletAddress );
    if (!validateRequest) throw new Error('Not verified address request')
  }

  _getRequestValidation(address) {
    const requestValidation = this.mempool.find(({ walletAddress }) =>  address === walletAddress );
    return requestValidation || null
  }

  _setTimeoutToRemoveValidationRequest(address) {
    setTimeout(() => {
      const reqIdx = this.mempool.findIndex(({ walletAddress }) =>  address === walletAddress );
      this.mempool.splice(reqIdx, 1)
      this.mempoolValid.splice(reqIdx, 1)
    }, this.timeoutRequestsWindowTime)
  }

  _setMessage(request) {
    const messageSuffix = 'starRegistry';
    const { walletAddress, requestTimeStamp } = request
    return `${walletAddress}:${requestTimeStamp}:${messageSuffix}`
  }

  _setValidationWindow(requestValidation, currentTime) {
    const { requestTimeStamp } = requestValidation;
    const timeElapse = currentTime - requestTimeStamp;
    return (this.timeoutRequestsWindowTime / 1000) - timeElapse
  }
}

module.exports = () => { return new MempoolService() };
