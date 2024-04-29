require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const port = 3000;
const users = require("./mockDB");

app.use(express.json());

app.get("/posts", authenticateToken, (req, res) => {
  res.json(users.filter((post) => post.username === req.user.name));
});

function authenticateToken(req, res, next) {
  const token = req.body.token;

  //   const authHeader = req.headers["authorization"];
  //   const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post("/login", (req, res) => {
  const { username } = req.body;
  const user = { name: username };

  /* 

  Authentication happens here using authentication service of your choice
    ....
  */

  // Generate token
  jwt.sign(user, process.env.ACCESS_TOKEN, function (err, token) {
    console.log(token);
    res.json({ token });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
