const productRepo = require('../repos/product.repo');

/**
 * create & save a new product
 * @param data
 * @returns {Promise<void>}
 */
async function create(data) {
  await productRepo.save(data);
}

/**
 * count all product
 * @returns {Promise<void>}
 */
async function countAll() {
  const list = await productRepo.list();
  return list.length;
}

/**
 * clear all product
 * @returns {Promise<void>}
 */
async function clearAll() {
  return await productRepo.clearAll();
}

module.exports = {create, clearAll, countAll};