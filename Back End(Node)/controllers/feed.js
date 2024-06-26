const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems = 0;
  Post.countDocuments()
    .then((count) => {
      totalItems += count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({
        message: "All Posts Fetched Successfully!",
        posts,
        totalItems,
      });
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
  if (!req.file) {
    const error = new Error("No Image Provided!");
    error.statusCode = 422;
    throw error;
  }
  const { path: imageUrl } = req.file;
  const { title, content } = req.body;
  const newPost = new Post({
    title,
    content,
    imageUrl,
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

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, Entered Data is Incorrect!");
    error.statusCode = 422;
    throw error;
  }
  const { postId } = req.params;
  const { title, content, image } = req.body;
  let imageUrl = image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("No Image Provided!");
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error(`Post With ${postId} Not Found!`);
        error.statusCode = 404;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        const filePath = path.join(__dirname, "..", post.imageUrl);
        fs.unlink(filePath, (err) => {
          console.log("🚀 ~ fs.unlink ~ err:", err);
        });
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then((updatedPost) => {
      res
        .status(200)
        .json({ message: "Post Updated Successfully!", post: updatedPost });
    })
    .catch((error) => {
      if (!error.statusCode) error.statusCode = 500;
      next(error);
    });
};

exports.deletePost = (req, res, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error(`Post With ${postId} Not Found!`);
        error.statusCode = 404;
        throw error;
      }
      //TODO: Check LoggedIn User
      const filePath = path.join(__dirname, "..", post.imageUrl);
      fs.unlink(filePath, (err) => {
        console.log("🚀 ~ fs.unlink ~ err:", err);
      });
      return Post.findByIdAndDelete(postId);
    })
    .then((deletedPost) => {
      console.log("🚀 ~ .then ~ deletedPost:", deletedPost);
      res.status(200).json({ message: "Post Deleted Successfully!" });
    })
    .catch((error) => {
      if (!error.statusCode) error.statusCode = 500;
      next(error);
    });
};
