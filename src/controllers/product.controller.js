const fs = require('fs');
const csv = require('csv-streamify');

const productService = require('../services/product.service');
const cu = require('./utils');



/**
 * initialize products repo from csv file. Require param "file" to locate CSV file to load on FS
 *
 * CSV file must have :
 *  * ";" as delimiter
 *  * and header line with, at least, this column : id;title;gender_id;composition;sleeve;photo;url
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function initFromCsv(req, res, next) {
  const csvFilePath = req.query.file;
  if (!csvFilePath) {
    return cu.res4xx(res, 400, 'query string param named "file" is required');
  }

  if (!fs.existsSync(csvFilePath)) {
    return cu.res4xx(res, 400, 'file "' + csvFilePath + '" does not exist');
  }

  try {
    await productService.clearAll();

    const csvParser = csv({
      objectMode: true,
      delimiter: ';',
      columns: true,
      newline: '\r\n'
    }).on('data', function (data) {
      const product = {
        id: data.id,
        title: data.title,
        gender_id: data.gender_id,
        composition: data.composition,
        sleeve: data.sleeve,
        photo: 'http:' + data.photo,
        url: data['url']
      };
      productService.create(product);
    });
    const end = new Promise(function (resolve, reject) {
      csvParser.on('end', resolve);
      csvParser.on('error', reject);
    });
    fs.createReadStream(csvFilePath).pipe(csvParser);

    await end;
  } catch (error) {
    next(error);
  }

  {
    cu.resOk(res, {
      total: await productService.countAll()
    });
  }
}

/**
 * Compute main color of each product, for which it's unknown, via Google Cloud Vision API and persist it.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|void>}
 */
async function loadMainColors(req, res, next) {
  const limit = req.query.limit === undefined ? null : parseInt(req.query.limit, 10);
  if (null !== limit && (isNaN(limit) || limit <= 0)) {
    return cu.res4xx(res, 400, 'query string param named "limit" have to be a number > 0');
  }

  try {
    const noQueued = await productService.loadAndUpdateColors(limit);
    cu.resOk(res, {noColorLoaded: noQueued});
  } catch (error) {
    next(error);
  }
}

/**
 * Suggest to N product which have the same color as the requested product
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function suggestByColor(req, res, next) {
  const productId = req.params.id;
  const product = await productService.getById(productId);
  if (!product) {
    return cu.res4xx(res, 400, 'product "' + productId + '" is unknown');
  }

  const limit = req.query.limit === undefined ? 10 : parseInt(req.query.limit, 10);
  if (isNaN(limit) || limit <= 0) {
    return cu.res4xx(res, 400, 'query string param named "limit" have to be a number > 0');
  }

  let products;
  try {
    products = await productService.listByNearestColor(product, limit);
  } catch (error) {
    next(error);
  }

  cu.resOk(res, products);
}

module.exports = {initFromCsv, loadMainColors, suggestByColor};