const express = require('express');
const router = express.Router();

const productController = require('../controllers/product.controller');

router.get('/product/suggestByColor/:id', productController.suggestByColor);

module.exports = router;