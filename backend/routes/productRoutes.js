const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// POST /api/products -> Add a product
router.post('/', productController.addProduct);

// GET /api/products -> Get all products
router.get('/', productController.getAllProducts);

// GET /api/products/my -> Get logged-in user's products
router.get('/my', productController.getMyProducts);

// DELETE /api/products/:id -> Delete a product
router.delete('/:id', productController.deleteProduct);

// PUT /api/products/:id -> Edit a product
router.put('/:id', productController.editProduct);

module.exports = router;
