const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 8080;

const feedRoutes = require("./routes/feed");

// app.use(bodyParser.urlencoded({ extended: true })); //* uses x-www-form-urlencoded
app.use(bodyParser.json()); //* uses application/json

//! FOR SOLVING CORS ORIGIN ERRORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
