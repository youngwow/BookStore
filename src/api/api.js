const express = require('express');
const router = express.Router();
const Book = require('../../models/book');
const Author = require('../../models/author');
const User = require('../../models/user');

router.get('/books', async (req, res) => {
    try {
        const books = await Book.find({});
        res.json(books);
    } catch (e) {
        console.error(e);
    }
});