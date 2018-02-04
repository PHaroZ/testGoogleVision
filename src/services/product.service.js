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
 * list products by nearest color
 * @param product ref product
 * @param limit number of result
 * @returns {Promise<*>}
 */
async function listByNearestColor(product, limit) {
  if (!product.colorLab) {
    return [];
  }

  const c1 = product.colorLab;
  const candidates = await productRepo.list();

  let maxProx = undefined;
  let results = [];
  candidates.forEach(candidate => {
    const c2 = candidate.colorLab;
    if (product.id !== candidate.id && c2) {
      // compute proximity, least is the best
      const prox = Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2) + Math.pow(c1[2] - c2[2], 2));
      let keepIt;
      if (results.length < limit) {
        // keep the first candidates until we reach the limit
        keepIt = true;
      } else {
        // now we must keep only which have a better proximity than leastProx
        if (prox < maxProx) {
          // first, we have to reject the product with the least proximity
          results.pop(); // throw away the last one
          keepIt = true;
        }
      }
      if (keepIt) {
        // add to result set
        results.push({prox: prox, product: candidate});
        // sort current result by prox ASC
        results.sort((a, b) => {
          return a.prox < b.prox ? -1 : (a.prox === b.prox ? 0 : 1);
        });
        maxProx = results[results.length - 1].prox;
      }
    }
  });
  return results.map(result => result.product);
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

module.exports = {create, clearAll, countAll, list, updateMainColor, getById, listByNearestColor};