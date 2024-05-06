require("dotenv").config();
const express = require("express");
const app = express();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const port = 4000;
const users = require("./mockDB");

app.use(express.json());

/* Generate new accessToken for the user without making the user have to login again. 
It just makes sures the intergrity of the app, or 
when the user switches to another server that requres the access token that may have expired
*/
let refreshToken = [];

app.post("/getnewToken", (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);

  if (!refreshToken.includes(token)) return res.sendStatus(403);

  jwt.verify(token, process.env.REFRESH_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });

    res.status(200).json({ accessToken });
  });
});

// Delete the refresh token -- the user has to login again to get the refresh token
app.delete("/logout", (req, res) => {
  const loggedUserRefreshToken = req.body.token;

  refreshToken = refreshToken.filter(
    (token) => token !== loggedUserRefreshToken
  );
});

app.post("/login", (req, res) => {
  const { username } = req.body;
  const user = { name: username };
  /* 
  Authentication happens here using authentication service of your choice
  */
  // Generate token
  const accessToken = generateAccessToken(user);
  const getRefreshToken = generateRefreshToken(user);
  refreshToken.push(getRefreshToken);
  res.json({ accessToken: accessToken, refreshToken: getRefreshToken });
  console.log(refreshToken);
});

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN, {
    expiresIn: "5000s",
  });
};
const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN);
};

app.listen(port, () => {
  console.log(`Auth Server ${port}`);
});

app.get("/users", (req, res) => {
  res.json(users);
});


//Testing the connection to the Auth Server

axios
  .get("http://localhost:4000/users")
  .then((res) => {
    console.log(res.data, "from Auth Server");
  })
  .catch((err) => {
    console.log(err);
  });
