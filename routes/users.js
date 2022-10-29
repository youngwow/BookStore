const express = require('express');
const router = express.Router();

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });
const isLoggedIn = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};

router.get("/profile", isLoggedIn, (req, res) => {
  res.render("users/profile.ejs", { user: req.user });
});

module.exports = router;
