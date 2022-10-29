const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const User = require('../models/user');
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
    //saveCover(book, req.body.cover);
    try {
        if (req.body.cover != null && req.body.cover !== ''){
            saveCover(book, req.body.cover);
        }
        const newBook = await book.save();
        res.redirect(`books/${newBook.id}`);
    } catch (e) {
        console.error(e);
        await renderNewPage(res, book, true);
    }
});
// Show Book
router.get('/:id', async (req, res) => {
    let book;
    let bookTakenByUser;
    let user;
    let isAdmin;
    let dateReturn;
    try {
        book = await Book.findById(req.params.id).populate('author').exec();
        if (!book.isTaken){
            bookTakenByUser = await User.findById(book.takenByUser);
            dateReturn = book.dateReturn;
        }
        if (req.user != null){
            user = await User.findById(req.user._id);
            isAdmin = user.isAdmin;
        } else{
            isAdmin = false;
        }
        res.render('books/show',
            {
                book: book,
                user: bookTakenByUser,
                isAdmin: isAdmin,
                dateReturn: dateReturn
            });
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
    let user;
    try {
        let book = await Book.findById(req.params.id);
        if (req.user != null){
            user = await User.findById(req.user._id);
            book.isTaken = false;
            book.takenByUser = user._id;
            book.dateReturn = new Date();
            book.dateReturn.setMonth(book.dateReturn.getMonth() + 1);
            await book.save();
        }
        res.redirect(`/books/${book.id}`);
    } catch {
        // if (user == null){
        //     //
        // }
        res.redirect('/');
    }
});
// return book
router.put('/return/:id', async (req, res) => {
    try{
        let book = await Book.findById(req.params.id);
        let user = await User.findById(req.user._id);
        // console.log(book.takenByUser.toString());
        // console.log(user._id.toString());
        if (book.takenByUser.toString() === user._id.toString()) {
            book.isTaken = true;
            book.takenByUser = null;
            book.DateReturn = null;
            await book.save();
        }
        // else{
        //     // TODO: render with error
        // }
        res.redirect(`/books/${book.id}`);
    } catch (e) {
        console.error(e);
        res.redirect('/')
    }
})

// Delete Book
router.delete('/:id', async (req, res)  => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        //let result = confirm('Are you sure?');
        // if (result){
        //     await book.remove();
        // }
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
