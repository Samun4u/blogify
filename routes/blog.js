const { Router } = require("express");
const multer  = require('multer');
const path = require("path");

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads`));
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName)
    }
  })

const upload = multer({ storage: storage })

const Blog = require("../models/blog");
const Comment = require("../models/comment");

router.get("/add-new",(req,res) => {
    return res.render("addBlog",{
        user: req.user
    })
})

router.post("/",upload.single("coverImage"),async (req,res) => {
    const { title, body } = req.body;
   const blog = await Blog.create({
      title,
      body,
      coverImageURL: `/uploads/${req.file.filename}`,
      createdBy: req.user._id
    });
    return res.redirect(`/blog/${blog._id}`);
})

router.get("/:id",async(req,res) => {
   const blog = await Blog.findById(req.params.id).populate("createdBy");
   const comments = await Comment.find({blogId: blog._id}).sort({createdAt:-1}).populate("createdBy");
   return res.render("blog",{
      user: req.user,
      blog: blog,
      comments: comments
   })
})

router.post("/comment/:blogId",async(req,res) => {
    await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id
    });

    return res.redirect(`/blog/${req.params.blogId}`);
})

module.exports = router;    