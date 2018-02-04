const productRepo = require('../repos/product.repo');
const colourProximity = require('colour-proximity');


/**
 * create & save a new product
 * @param data
 * @returns {Promise<void>}
 */
async function create(data) {
  await productRepo.save(data);
}

/**
 * update the main color of a product & compute its lab value
 * @param product
 * @returns {Promise<void>}
 */
async function updateMainColor(product, color) {
  product.color = [color.red, color.green, color.blue];
  product.colorLab = colourProximity.rgb2lab(product.color);
  await productRepo.save(product);
}

/**
 * count all products
 * @returns {Promise<void>}
 */
async function countAll() {
  const list = await productRepo.list();
  return list.length;
}

/**
 * return all products
 * @returns {Promise<void>}
 */
async function list() {
  return productRepo.list();
}

/**
 * clear all product
 * @returns {Promise<void>}
 */
async function clearAll() {
  return await productRepo.clearAll();
}

module.exports = {create, clearAll, countAll, list, updateMainColor};