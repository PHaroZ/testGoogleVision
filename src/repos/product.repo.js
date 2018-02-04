const fs = require('fs');
const nconf = require('nconf');

let store;
let persistTimeout;
let persistInProgress = false;
let filePath;
let persistDelay;

async function init() {
  filePath = nconf.get('repo:fs:filePath');
  persistDelay = nconf.get('repo:fs:persistDelay');

  return new Promise(function (resolve, reject) {
    if (fs.existsSync(filePath)) {
      let data;
      try {
        data = fs.readFileSync(filePath);
      } catch (err) {
        reject('fail to load file storage', err);
      }
      try {
        store = JSON.parse(data);
      } catch (err) {
        reject('fail to parse store file content', err);
      }
    } else {
      store = {};
    }
    resolve();
  });
}

/**
 * save a product
 * @param data
 * @returns {Promise<void>}
 */
async function save(data) {
  console.log('TODO save', data)
  //TODO
}

module.exports = {save};