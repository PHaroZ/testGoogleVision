const fs = require('fs');

const productService = require('../services/product.service');
const cu = require('./utils');

/**
 * initialize products repo from csv file. Require param "file" to locate CSV file to load on FS
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


  {
    cu.resOk(res);
  }
}

module.exports = {initFromCsv};