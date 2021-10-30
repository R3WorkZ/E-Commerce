const router = require("express").Router();
const userController = require("../controllers/userController");
const { verifyUser } = require("../middleware/verifyToken");

router.post("/", userController.signUp); //create user a/c

router.post("/login", userController.logIn); //login to user a/c

router.get("profile/:userId", verifyUser, userController.profile) //view a/c data

router.patch('/:userId', verifyUser, userController.updateUser); //update a/c data

router.delete('/:userId', verifyUser, userController.deleteUser); //delete user a/c

router.get("/viewallusers", verifyUser, userController.viewAllUsers); //view all users

module.exports = router;
