require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const port = 3001;
const users = require("./mockDB");

app.use(express.json());

app.get("/user-logged-in", authenticateToken, (req, res) => {
  // Return only the posts of the user that is logged in
  const user = users.filter((post) => post.username === req.user.name)
  res.json(user);
});

function authenticateToken(req, res, next) {
  // const token = req.body.token;

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);

    // set user to req.user so that it can be accessed in the next middleware
    req.user = user;
    console.log("Success");
    next();
  });
}

app.listen(port, () => {
  console.log(`Main Server at ${port}`);
});
