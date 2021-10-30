const router = require("express").Router();
const adminController = require("../controllers/adminController");
const userController = require("../controllers/userController");
const { verifyAdmin } = require("../middleware/verifyToken");

router.post("/", adminController.signUp) //create admin a/c

router.post("/login", adminController.logIn) //login to admin a/c

router.get("/profile/:userId", verifyAdmin, adminController.profile) //view a/c data

router.patch('/:userId',verifyAdmin, adminController.updateAdmin); //update a/c data

router.delete('/:userId',verifyAdmin, adminController.deleteAdmin); //delete admin a/c

router.get("/viewalladmins", verifyAdmin, adminController.viewAllAdmins) //view all admins

router.get("/viewallusers", verifyAdmin, userController.viewAllUsers) //view all users

router.delete('/user/:userId',verifyAdmin, userController.deleteUser); //delete user a/c

module.exports = router;
