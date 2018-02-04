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

async function clearAll() {
  store = {};
}

/**
 * save a product
 * @param data
 * @returns {Promise<void>}
 */
async function save(data) {
  store[data.id] = data;
  persistDeffered();
}

async function list() {
  return Object.values(store);
}

async function getById(id) {
  return store[id];
}

/**
 * @private
 * buffer store saving
 */
function persistDeffered() {
  if (!persistTimeout) {
    persistTimeout = setTimeout(() => {
      persistTimeout = null;
      if (persistInProgress) {
        persistDeffered();
      } else {
        persistInProgress = true;
        persist().then(() => {
          persistInProgress = false;
        }).catch((err) => {
          console.error('persist fail', err);
          process.exit(1);
        });
      }
    }, persistDelay);
  }
}

/**
 * @private
 * save store to file
 * @returns {Promise<any>}
 */
async function persist() {
  return new Promise(function (resolve, reject) {
    fs.writeFile(filePath, JSON.stringify(store), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {init, clearAll, save, list, getById};