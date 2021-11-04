const router = require('express').Router();
const cateController = require('../controllers/cateController')
const { verifyAdmin } = require("../middleware/verifyToken"); 

router.post('/', verifyAdmin, cateController.createCategory);

router.get('/', verifyAdmin, cateController.getCategories);

router.patch('/:cateId', verifyAdmin, cateController.editCategories);

router.delete('/:cateId', verifyAdmin, cateController.deleteCategories);

module.exports = router;