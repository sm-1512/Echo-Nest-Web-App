import { Router } from "express";
import User from "../models/user.js";

const router = Router();

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password.",
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        error: "Email already in use. Please log in.",
      });
    }

    // Create the user if no duplicate is found
    await User.create({ fullName, email, password });
    return res.redirect("/signin");
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).send("Something went wrong. Please try again.");
  }
});

export default router;
