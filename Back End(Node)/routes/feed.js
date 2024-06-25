const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const feedController = require("../controllers/feed");

//* GET /feed/posts
router.get("/posts", feedController.getPosts);

//* GET /feed/posts/:postId
router.get("/posts/:postId", feedController.getPost);

//* POST /feed/createPost
router.post(
  "/createPost",
  [
    body("title").trim().isLength({ min: 7 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

module.exports = router;
