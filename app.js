import 'dotenv/config'
import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { checkForAuthenticationCookie } from "./middlewares/auth.js";
import userRoute from "./routes/user.js";
import blogRoute from "./routes/blog.js";
import Blog from "./models/blog.js";
import session from 'express-session';
import methodOverride from 'method-override';


const app = express();
const PORT = process.env.PORT || 8000;

mongoose
 
  .connect(process.env.MONGO_URL)
  .then((e) => console.log("MongoDb Connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static('public'));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));
app.use(methodOverride('_method'));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));


app.listen(PORT, () => {
  console.log(`Server Running on PORT: ${PORT}`);
});
