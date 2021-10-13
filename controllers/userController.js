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
  if (emailExist) return res.status(400).send({ success: false, message: "Email already exist!" });

  try {
    const newUser = await createUserObj(req);
    const savedUser = await User.create(newUser);
    return res.status(200).send({ success: true, message: "User created successfully!", user: savedUser });
  } catch (err) {
    return res.status(400).send({ success: false, message: "User Creation Failed!", error: err });
  }
};

// login
exports.logIn = async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const foundUser = await User.findOne({ email: req.body.email }); //returns the first document that matches the query criteria or null
  if (!foundUser) return res.status(400).send({ success: false, message: "invalid Email" });

  try {
    const isMatch = await bcrypt.compareSync(req.body.password, foundUser.password);
    if (!isMatch) return res.status(400).send({ success: false, message: "Password Invalid" });

    // create and assign jwt
    const token = await jwt.sign({ _id: foundUser._id }, JWT_KEY);

    return res.status(200).header("auth-token", token).send({ success: true, "auth-token": token, userId: foundUser._id });
  } catch (error) {
    return res.status(400).send({ success: false, message: error });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    if(req.body.password!=null){
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    } //encrypt the password before updating
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, { $set: req.body }, { new: true });

    if (!updatedUser) {
      return res.status(400).send({ message: "Could not update user" });
    }
    return res.status(200).send({ message: "User updated successfully", updatedUser });

  } catch (error) {
    return res.status(400).send({ error: "An error has occurred, unable to update user" + error });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.userId); // the `await` is very important here!

    if (!deletedUser) {
      return res.status(400).send({ message: "Could not delete user" });
    }
    return res.status(200).send({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    return res.status(400).send({ error: "An error has occurred, unable to delete user" });
  }
};

exports.data = async (req, res) => {
  const data= await User.findById(req.params.userId)
  return res.json({
    status: true,
    message: {
      title: "User Authentication",
      description: data,
    },
  });
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
