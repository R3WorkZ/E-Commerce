const Category = require("../models/cateModel");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

exports.createCategory = async (req, res, next) => {
  const dbCategory = await Category.findOne({ name: req.body.name });
  if (dbCategory) return res.status(400).send({status: false, message: "category already exist"});

  const newCategory = new Category({ name: req.body.name });

  newCategory.save((error, savedCategory) => {
    if (error) {
      return res.status(400).send({status: false, message: "an error occurred",error: error});
    }
    return res.status(200).send({status: true,  message: "category was created", category: savedCategory });
  });
};

exports.getCategories = (req, res, next) => {
  Category.find({}, "name createdAt _id",(error, categories) => {
    if (error) return res.status(400).send({status: false, message: "an error occurred",error: error});
    return res.status(200).send({status: true, message: "showing category list", count: categories.length, categories, });
  });
};
