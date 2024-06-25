const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res
        .status(200)
        .json({ message: "All Posts Fetched Successfully!", posts });
    })
    .catch((error) => {
      if (!error.statusCode) error.statusCode = 500;
      next(error);
    });
};

exports.getPost = (req, res, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error(`Post With ${postId} Not Found!`);
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Post Fetched Successfully!", post });
    })
    .catch((error) => {
      if (!error.statusCode) error.statusCode = 500;
      next(error);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, Entered Data is Incorrect!");
    error.statusCode = 422;
    throw error;
  }
  const { title, content } = req.body;
  const newPost = new Post({
    title,
    content,
    imageUrl: "images/Dragon Ball 1.jpeg",
    creator: { name: "Harshit" },
  });
  newPost
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully",
        post: result,
      });
    })
    .catch((error) => {
      if (!error.statusCode) error.statusCode = 500;
      next(error);
    });
};
