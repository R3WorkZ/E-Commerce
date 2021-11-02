const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Admin = require("../models/adminModel");
const MASTER_KEY = process.env.MASTER_KEY;
const { registerValidation, loginValidation } = require("../middleware/validation");


// signup
exports.signUp = async (req, res, next) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExist = await Admin.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send({ success: false, message: "Email already exist!" });

  try {
    const newAdmin = await createAdmin(req);
    const savedAdmin = await newAdmin.save(); 
    const token = await jwt.sign({ _id: savedAdmin._id }, MASTER_KEY);
    
    return res.status(200).send({ success: true, message: "Admin A/C created successfully!", "auth-token": token, adminId:savedAdmin._id, user: savedAdmin  });
  } catch (error) {
    return res.status(400).send({ success: false, message: "Admin A/C  Creation Failed!", error: err });
  }
};

// login
exports.logIn = async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const foundAdmin = await Admin.findOne({ email: req.body.email }); //returns the first document that matches the query criteria or null
  if (!foundAdmin) return res.status(400).send({ success: false, message: "Invalid Email" });

  try {
    const isMatch = await bcrypt.compareSync(req.body.password, foundAdmin.password);
    if (!isMatch) return res.status(400).send({ success: false, message: "Invalid Password" });

    // create and assign jwt
    const token = await jwt.sign({ _id: foundAdmin._id }, MASTER_KEY);
    
    return res.status(200).header("auth-token", token).send({success: true, "auth-token": token, userId: foundAdmin._id });
  } catch (error) {
    return res.status(400).send({ success: false, message: error });
  }
};

// Fetch Profile
exports.profile = async (req, res) => {
  try{
    const profileData = await Admin.findById({_id:req.params.userId});
    if(!profileData){
      return res.status(400).send({ success:false, message: "Admin Not Found" });
    }
    return res.status(200).send(profileData);
  }
  catch(error){
    
    return res.status(400).send({ success: false, message:"Error",error:error });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  try {

    if(req.body.password!=null){
      req.body.password = await bcrypt.hashSync(req.body.password, 10);//encrypt the password before updating
    } 
    const emailExist = await Admin.findOne({ email: req.body.email });
    if (emailExist){ 
      return res.status(400).send({ success: false, message: "A User with the same Email already exists! Try another one." });
    }
    const updatedAdmin = await Admin.findByIdAndUpdate(req.params.userId, { $set: req.body }, { new: true });

    if (!updatedAdmin) {
      return res.status(400).send({ success: false, message: "Could not update. Retry." });
    }
    return res.status(200).send({success: true, message: "Successfully updated", updatedAdmin});

  } catch (error) {
    return res.status(400).send({ success: false, message: "An error has occured, unable to update", error: error });
  }
};

// Delete Admin
exports.deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete({ _id: req.params.userId}); // the `await` is very important here!

    if (!deletedAdmin) {
      return res.status(400).send({success: false, message: "Could not delete admin" });
    }
    return res.status(200).send({success: true, message: "Admin deleted successfully", user: deletedAdmin});
  } catch (error) {
    return res.status(400).send({ success: false, message: "An error has occurred, unable to delete Admin", error: error });
  }
};

exports.viewAllAdmins = async (req, res) => {
  try{
    const allAdmin = await Admin.find();
    return res.status(200).send(allAdmin);
  }catch (error){
    return res.status(400).send({ success: false, message: ''+error });
  }
};


async function createAdmin(req) {
  const hashPassword = await bcrypt.hashSync(req.body.password, 10);
  return new Admin({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashPassword,
    phone: req.body.phone,
  });
}