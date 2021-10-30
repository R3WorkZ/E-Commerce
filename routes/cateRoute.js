const router = require('express').Router();
const cateController = require('../controllers/cateController')
const { verifyAdmin } = require("../middleware/verifyToken"); 

router.post('/', verifyAdmin, cateController.createCategory);

router.get('/show', verifyAdmin, cateController.getCategories);

module.exports = router;