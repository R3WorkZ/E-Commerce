const express = require("express");
const { date } = require("joi");
const router = express.Router();
const multer = require("multer");
const ProdController = require("../controllers/prodController");
const { verifyAdmin } = require("../middleware/verifyToken");

const ImageModel = require("../models/imageModel")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `${req.body.name}_dt$${Date.now()}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: fileFilter,
}).single("productImage");

const fileSizeFormatter = (bytes) => {
  if(bytes===0){
    return '0 bytes';
  }
  const decimal = 2; //0.00
  const sizes = ['Bytes','KB','MB','GB','TB','PB','EB','YB','ZB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat ((bytes/Math.pow(1024, index)).toFixed(decimal)) + ' ' + sizes[index];
}

// router.post("/",verifyAdmin, upload.single("productImage"), ProdController.createProduct);
router.post("/",verifyAdmin,ProdController.createProduct, (req,res)=>{
  upload(req,res,(err)=>{
    if(err){
      console.log(err)
    }
    else
    {
      const newImage = new ImageModel({
      name: req.body.name,
      imgType: "products",
      image:{
        data:req.file.filename,
        contentType:"image/jpg || image/png"
      }

    })
    newImage.save()
    .then(()=>res.send('Success')).catch(err=>console.log(err));
  }
  })
});

router.get("/show", ProdController.getProducts);

module.exports = router;
