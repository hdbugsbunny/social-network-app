const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "This is the first post!",
        imageUrl: "images/Dragon Ball 1.jpeg",
        creator: { name: "Harshit" },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed, Entered Data is Incorrect!",
      errors: errors.array(),
    });
  }
  const { title, content } = req.body;
  // TODO: Create a post in the database
  const newPost = new Post({
    title,
    content,
    imageUrl: "images/Dragon Ball 1.jpg",
    creator: { name: "Harshit" },
  });
  newPost
    .save()
    .then((result) => {
      console.log("🚀 ~ .then ~ result:", result);
      res.status(201).json({
        message: "Post created successfully",
        post: result,
      });
    })
    .catch((error) => {
      console.log("🚀 ~ error:", error);
    });
};
