const fs = require('fs');
const csv = require('csv-streamify');
const nconf = require('nconf');
const RunQueue = require('run-queue');
const vision = require('@google-cloud/vision');

const productService = require('../services/product.service');
const cu = require('./utils');

const googleVisionClient = new vision.ImageAnnotatorClient({
  keyFilename: nconf.get('GOOGLE_APPLICATION_CREDENTIALS')
});


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
    })
    var end = new Promise(function (resolve, reject) {
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

async function loadMainColors(req, res, next) {
  const limit = req.query.limit === undefined ? null : parseInt(req.query.limit, 10);
  if (null !== limit && (isNaN(limit) || limit <= 0)) {
    return cu.res4xx(res, 400, 'query string param named "limit" have to be a number > 0');
  }

  try {

    const queue = new RunQueue({
      maxConcurrency: 10
    });
    let noQueued = 0;
    (await productService.list()).some(function (product, index) {
      if (!product.color) {
        queue.add(0, loadAndUpdateProductColor, [product]);
        noQueued++;
        if (noQueued >= limit) {
          return true;
        }
      }
    });

    await queue.run();
    cu.resOk(res);

  } catch (error) {
    next(error);
  }
}

async function loadAndUpdateProductColor(product) {
  return new Promise(function (resolve, reject) {
    try {
      googleVisionClient
        .imageProperties(product.photo)
        .then(results => {
          try {
            const color = results[0].imagePropertiesAnnotation.dominantColors.colors[0].color;
            productService.updateMainColor(product, color);
            resolve(product);
          } catch (error) {
            reject(error);
          }
        })
        .catch(err => {
          reject(err);
        });
    } catch (error) {
      //reject(error);
    }
  });
}

module.exports = {initFromCsv, loadMainColors};