const User = require("../models/user");

exports.getUserStatus = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("User Not Found!");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: "User Status Fetched Successfully!",
        status: user.status,
      });
    })
    .catch((error) => {
      if (!error.statusCode) error.statusCode = 500;
      next(error);
    });
};

exports.updateUserStatus = (req, res, next) => {
  const { status } = req.body;
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("User Not Found!");
        error.statusCode = 404;
        throw error;
      }
      user.status = status;
      return user.save();
    })
    .then(() => {
      res.status(200).json({
        message: "User Status Updated Successfully!",
        status,
      });
    })
    .catch((error) => {
      if (!error.statusCode) error.statusCode = 500;
      next(error);
    });
};
