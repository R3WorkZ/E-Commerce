const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const User = require("../models/userModel");
const { registerValidation, loginValidation } = require("../middleware/validation");
const JWT_KEY = process.env.JWT_KEY;


// signup
exports.signUp = async (req, res, next) => {
  const { error, value } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExist = await User.findOne({ email: req.body.email }); //returns the first document that matches the query criteria or null
  if (emailExist) return res.status(400).send({ success: false, message: "Email already exists!" });

  try {
    const newUser = await createUserObj(req);
    const savedUser = await User.create(newUser);
    return res.status(200).send({ success: true, message: "User created successfully!", user: savedUser });
  } catch (err) {
    return res.status(400).send({ success: false, message: "User creation failed!", error: err });
  }
};

// login
exports.logIn = async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const foundUser = await User.findOne({ email: req.body.email }); //returns the first document that matches the query criteria or null
  if (!foundUser) return res.status(400).send({ success: false, message: "Invalid Email" });

  try {
    const isMatch = await bcrypt.compareSync(req.body.password, foundUser.password);
    if (!isMatch) return res.status(400).send({ success: false, message: " Invalid Password" });

    // create and assign jwt
    const token = await jwt.sign({ _id: foundUser._id }, JWT_KEY);

    return res.status(200).header("auth-token", token).send({ success: true, "auth-token": token, userId: foundUser._id });
  } catch (error) {
    return res.status(400).send({ success: false, message: error });
  }
};

// Fetch Profile
exports.profile = async (req, res) => {
  try{
    const profileData = await User.findById({_id:req.params.userId});
    if(!profileData){
      return res.status(400).send({ success:false, message: "User Not Found" });
    }
    return res.status(200).send(profileData);
  }
  catch(error){
    
    return res.status(400).send({ success: false, message: "Error",error:error });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    if(req.body.password!=null){
      req.body.password = bcrypt.hashSync(req.body.password, 10); //encrypt the password before updating
    }
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist){ 
      return res.status(400).send({ success: false, message: "A User with the same Email already exists! Try another one." });
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, { $set: req.body }, { new: true });

    if (!updatedUser) {
      return res.status(400).send({success: false, message: "Could not update user" });
    }
    return res.status(200).send({success: true, message: "Successfully updated", updatedUser });

  } catch (error) {
    return res.status(400).send({success: false, message: "An error has occurred, unable to update user", error: error });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.userId); // the `await` is very important here!

    if (!deletedUser) {
      return res.status(400).send({success: false, message: "Could not delete user" });
    }
    return res.status(200).send({success: true, message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    return res.status(400).send({success: false, message: "An error has occurred, unable to delete user", error:error });
  }
};

exports.viewAllUsers = async (req, res) => {
  try{
    const allUsers = await User.find();
    return res.status(200).send(allUsers);
  }catch (error){
    return res.status(400).send({ success: false, message: "Error", error: error });
  }
};

const createUserObj = async (req) => {
  return {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
  };
}
