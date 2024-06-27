const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.countDocuments();
    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "All Posts Fetched Successfully!",
      posts,
      totalItems,
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error(`Post With ${postId} Not Found!`);
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Post Fetched Successfully!", post });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
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
    creator: req.userId,
  });
  try {
    await newPost.save();
    const user = await User.findById(req.userId);
    user.posts.push(newPost);
    await user.save();
    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
      creator: { _id: user._id, username: user.name },
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
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
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error(`Post With ${postId} Not Found!`);
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error(`User is Not Authorized to Update ${postId}!`);
      error.statusCode = 403;
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
    const updatedPost = await post.save();
    res
      .status(200)
      .json({ message: "Post Updated Successfully!", post: updatedPost });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error(`Post With ${postId} Not Found!`);
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error(`User is Not Authorized to Delete ${postId}!`);
      error.statusCode = 403;
      throw error;
    }
    const filePath = path.join(__dirname, "..", post.imageUrl);
    fs.unlink(filePath, (err) => {
      console.log("🚀 ~ fs.unlink ~ err:", err);
    });
    await Post.findByIdAndDelete(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    res.status(200).json({ message: "Post Deleted Successfully!" });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
