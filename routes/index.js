const express = require('express');
const router = express.Router();
const Book = require('../models/book')

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

module.exports = router;
