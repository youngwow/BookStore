const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const Book = require('../models/book');
const uploadPath = path.join('public', Book.coverImageBasePath);
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
});

/* All books Route */
router.get('/', async (req, res) => {
    // let searchOptions = {};
    // if (req.query.title !== null && req.query.title !== ''){
    //     searchOptions.title = new RegExp(req.query.title, 'i');
    // }
    let query = Book.find();
    if (req.query.title != null && req.query.title !== ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore !== ''){
        //query = query.regex('title', new RegExp(req.query.title, 'i'));
        query = query.lte('publishDate', req.query.publishedBefore);
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter !== ''){
        //query = query.regex('title', new RegExp(req.query.title, 'i'));
        query = query.gte('publishDate', req.query.publishedAfter);
    }
    try {
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        });
    } catch {
        res.render('/');
    }
});

// New Book Route
router.get('/new', async (req, res) => {
    const newBook = new Book();
    await renderNewPage(res, newBook);
});

// Create New Book
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null; // rew.file?.filename
    const book = new Book({
        title: req.body.title,
        description: req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        author: req.body.author
    });
    try {
        const newBook = await book.save();
        // res.redirect(`books/${newBook.id})`);
        res.redirect('books');
    } catch {
        if (book.coverImageName != null){
            removeBookCover(book.coverImageName);
        }
        await renderNewPage(res, book, true);
    }
});

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err){
            console.error(err);
        }
    });
}

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        };
        if (hasError){
            params.errorMessage = 'Error Creating Book';
        }
        res.render('books/new', params);
    } catch {
        res.redirect('books');
    }
}

module.exports = router;