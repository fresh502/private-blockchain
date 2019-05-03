const level = require('level');
const Sandbox = require('./sandbox');
const chainDB = '../chaindata';

class LevelSandbox extends Sandbox {
  constructor() {
    super();
    this.db = level(chainDB);
  }

  getBlockByHeight(height){
    return new Promise((resolve, reject) => {
      this.db.get(height, (err, value) => {
        if (err) {
          if (err.name === 'NotFoundError') return resolve();
          return reject(err);
        }
        resolve(JSON.parse(value));
      })
    })
  }

  addBlock(height, block) {
    return new Promise((resolve, reject) => {
      const value = JSON.stringify(block);
      this.db.put(height, value, (err) => {
        if (err) return reject(err);
        resolve(block);
      })
    })
  }

  getBlocksCount() {
    return new Promise((resolve, reject) => {
      let i = 0;
      this.db.createReadStream()
        .on('data', () => {
          i++;
        })
        .on('error', (err) => {
          reject(err);
        })
        .on('close', () => {
          resolve(i);
        })
    })
  }
}

module.exports = () => { return new LevelSandbox() };
