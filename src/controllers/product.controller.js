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
    const csvParser = csv({objectMode: true, delimiter: ';',columns:true}).on('data', function (data) {
      productService.create(data);
    });
    fs.createReadStream(csvFilePath).pipe(csvParser);

  } catch (error) {
    next(error);
  }

  {
    cu.resOk(res);
  }
}

module.exports = {initFromCsv};