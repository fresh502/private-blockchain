class Sandbox {
  getBlockByHeight(height){
    throw new Error('Override');
  }

  addBlock(height, block) {
    throw new Error('Override');
  }

  getBlocksCount() {
    throw new Error('Override');
  }
}

module.exports = Sandbox;
