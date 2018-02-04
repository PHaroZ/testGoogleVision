const express = require('express');
const router = express.Router();

const productController = require('../controllers/product.controller');

router.get('/product/initFromCsv', productController.initFromCsv);
router.get('/product/loadMainColors', productController.loadMainColors);

module.exports = router;