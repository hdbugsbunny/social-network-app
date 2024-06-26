const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/user");

exports.signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, Entered Data is Incorrect!");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { email, password, name } = req.body;
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({ email, name, password: hashedPassword });
      return user.save();
    })
    .then((newUser) => {
      res
        .status(201)
        .json({ message: "User Created Successfully!", userId: newUser._id });
    })
    .catch((error) => {
      if (!error.statusCode) error.statusCode = 500;
      next(error);
    });
};

exports.logIn = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, Entered Data is Incorrect!");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { email, password } = req.body;
  let loggedInUser;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        const error = new Error(`User With ${email} is Not Available!`);
        error.statusCode = 401;
        throw error;
      }
      loggedInUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isTrue) => {
      if (!isTrue) {
        const error = new Error("User Entered Wrong Password!");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loggedInUser.email,
          userId: loggedInUser._id.toString(),
        },
        "someSuperSecretSecret",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token, userId: loggedInUser._id.toString() });
    })
    .catch((error) => {
      if (!error.statusCode) error.statusCode = 500;
      next(error);
    });
};
