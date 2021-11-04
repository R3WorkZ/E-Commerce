const router = require('express').Router();
const cateController = require('../controllers/cateController')
const { verifyAdmin } = require("../middleware/verifyToken"); 

router.post('/', verifyAdmin, cateController.createCategory);

router.get('/', verifyAdmin, cateController.getCategories);

router.patch('/', verifyAdmin, cateController.editCategories);

router.delete('/', verifyAdmin, cateController.deleteCategories);

module.exports = router;