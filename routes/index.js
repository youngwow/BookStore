const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const User = require('../models/user');
const passport = require("passport");

/* GET home page. */
router.get('/', async function(req, res, next) {
  let books;
  try{
    books = await Book.find().sort({createdAt: 'desc'}).limit(10).exec();
  } catch {
    books = []
  }
  res.render('index', { books: books});
});

router.get('/fail', function (req, res) {
  res.end('fail');
})

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/fail'  // TODO: fix
}));

module.exports = router;
