const bcrypt = require("bcryptjs");
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
