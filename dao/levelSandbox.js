const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {
  constructor() {
    this.db = level(chainDB);
  }

  getLevelDBData(key){
    return new Promise((resolve, reject) => {
      this.db.get(key, (err, value) => {
        if (err) return reject(err);
        resolve(value);
      })
    })
  }

  addLevelDBData(key, value) {
    return new Promise((resolve, reject) => {
      this.db.put(key, value, (err) => {
        if (err) return reject(err);
        resolve(value);
      })
    })
  }

  getBlocksCount() {
    return new Promise((resolve, reject) => {
      let i = 0;
      this.db.createReadStream()
        .on('data', (data) => {
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

module.exports.LevelSandbox = LevelSandbox;
