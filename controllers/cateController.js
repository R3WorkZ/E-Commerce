const Category = require("../models/cateModel");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

exports.createCategory = async (req, res, next) => {
  const dbCategory = await Category.findOne({ name: req.body.name });
  if (dbCategory) return res.status(400).send({status: false, message: "Category already exist!"});

  const newCategory = new Category({ name: req.body.name });

  newCategory.save((error, savedCategory) => {
    if (error) {
      return res.status(400).send({status: false, message: "Something went wrong!",error: error});
    }
    return res.status(200).send({status: true,  message: "Category created Successfully!", category: savedCategory });
  });
};

exports.getCategories = (req, res, next) => {
  Category.find({}, "name createdAt _id",(error, categories) => {
    if (error) return res.status(400).send({status: false, message: "Something went wrong!",error: error});
    return res.status(200).send({status: true, message: "showing category list!", count: categories.length, categories, });
  });
};

exports.editCategories = async (req, res, next) => {
  try {
    const cateExists = await Category.findOne({ name: req.body.name });
    if (cateExists){ 
      return res.status(400).send({ success: false, message: "Category already exist!! Try another." });
    }
    const updatedCategory = await Category.findByIdAndUpdate(req.body.name, { $set: req.body }, { new: true });

    if (!updatedUser) {
      return res.status(400).send({success: false, message: "Could not update category!" });
    }
    return res.status(200).send({success: true, message: "Successfully updated!", updatedCategory });

  } catch (error) {
    return res.status(400).send({success: false, message: "Something went wrong!", error: error });
  }
};

exports.deleteCategories = async (req, res, next) => {
  try {
    const deletedCategory = await Category.findOneAndDelete(req.body.name); // the `await` is very important here!

    if (!deletedCategory) {
      return res.status(400).send({success: false, message: "Could not delete category" });
    }
    return res.status(200).send({success: true, message: "Category deleted successfully", user: deletedUser });
  } catch (error) {
    return res.status(400).send({success: false, message: "Something went wrong!", error:error });
  }
};
