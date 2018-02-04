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
 * @param color color in rgb as [r, g, b] where r, g, and b are an int between 0 and 255
 * @returns {Promise<void>}
 */
async function updateMainColor(product, color) {
  product.color = color ? [color.red, color.green, color.blue] : null;
  product.colorLab = color ? colourProximity.rgb2lab(product.color) : null;
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
 * return a product by it's id
 * @returns {Promise<void>}
 */
async function getById(id) {
  return productRepo.getById(id);
}

/**
 * clear all product
 * @returns {Promise<void>}
 */
async function clearAll() {
  return await productRepo.clearAll();
}

module.exports = {create, clearAll, countAll, list, updateMainColor, getById};