const express = require('express');
const categoryController = require('../controllers/categoryController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { categorySchema } = require('../validators/schemas');

const router = express.Router();

router.use(auth);

router.post('/', validate(categorySchema), categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.put('/:id', validate(categorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
