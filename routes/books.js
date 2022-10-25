const express = require('express');

const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];


/* All books Route */
router.get('/', async (req, res) => {
    let query = Book.find();
    if (req.query.title != null && req.query.title !== ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore !== ''){
        query = query.lte('publishDate', req.query.publishedBefore);
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter !== ''){
        query = query.gte('publishDate', req.query.publishedAfter);
    }
    switch (req.query.all_books) {
        case "only":
            query = query.find({isTaken: {$eq: true}})
            break;
        case "soon":
            query = query.find({isTaken: {$eq: false}})
            break;
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
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        description: req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        author: req.body.author
    });
    saveCover(book, req.body.cover);

    try {
        const newBook = await book.save();
        res.redirect(`books/${newBook.id}`);
    } catch {
        await renderNewPage(res, book, true);
    }
});
// Show Book
router.get('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id).populate('author').exec();
        res.render('books/show', {book: book});
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        await renderEditPage(res, book);
    } catch {
        res.redirect('/');
    }
});
// Update New Book
router.put('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.description = req.body.description;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.author = req.body.author;
        if (req.body.cover != null && req.body.cover !== ''){
            saveCover(book, req.body.cover);
        }
        await book.save();
        res.redirect(`/books/${book.id}`);
    } catch {
        if (book != null){
            await renderEditPage(res, book, true);
        } else{
            res.redirect('/');
        }
    }
});
// Take Book
router.put('/take/:id', async (req, res) => {
    try {
        let book = await Book.findById(req.params.id);
        book.isTaken = !book.isTaken;
        await book.save();
        res.redirect(`/books/${book.id}`);
    } catch {
        res.redirect('/');
    }
});

// Delete Book
router.delete('/:id', async (req, res)  => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect('/books');
    } catch  {
        if (book == null){
            res.redirect('/');
        } else{
            res.render('/authors/show', {book: book,
                errorMessage: 'Could not remove book'})
        }
    }
});

async function renderNewPage(res, book, hasError = false) {
    await renderFormPage(res, book, 'new', hasError);
}

async function renderEditPage(res, book, hasError = false){
    await renderFormPage(res, book, 'edit', hasError);
}

async function renderFormPage(res, book, form, hasError = false){
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        };
        if (hasError){
            if (form === 'edit'){
                params.errorMessage = `Error Updating Book`;
            } else {
                params.errorMessage = `Error Creating Book`;
            }
        }
        res.render(`books/${form}`, params);
    } catch {
        res.redirect('books');
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded);
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}

module.exports = router;
