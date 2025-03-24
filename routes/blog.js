import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Blog from "../models/blog.js";
import Comment from "../models/comment.js";
import methodOverride from 'method-override';

const router = Router();
router.use(methodOverride('_method'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.resolve(`./public/uploads/${req.user._id}`);

    //check if directory exits, if not, then create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); //create nested directories if needed
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user, //To make the name of the user visible on the navbar when he is logged in.
  });
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.user._id}/${req.file.filename}`,
  });

  return res.redirect(`/blog/${blog._id}`);
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  

  res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

// Route to render the update page
router.get('/update/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).send('Blog Not Found');
    }
    res.render('update', { user: req.user, blog });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

router.post("/update/:id", async(req, res) => {
  try{
    const {title, body} = req.body;
    const updateData = {title, body};
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, {new:true});
    if(!updatedBlog) {
      return res.status(404).send('Blog Not Found');
    }
    res.redirect(`/blog/${req.params.id}`);
  } catch(error){
    res.status(500).send('Server Error')
  }
  
})

router.post('/delete/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).send('Blog not found');
  }

  // Check if the logged-in user created the blog
  if (req.user._id.toString() !== blog.createdBy.toString()) {
    return res.status(403).send('Not authorized to delete this blog');
  }

  await Blog.deleteOne({ _id: req.params.id });

  
  res.redirect('/');
});

export default router;
