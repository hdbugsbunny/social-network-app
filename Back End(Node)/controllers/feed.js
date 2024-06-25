const { validationResult } = require("express-validator");

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
  res.status(201).json({
    message: "Post created successfully",
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: { name: "Harshit" },
      createdAt: new Date(),
    },
  });
};
