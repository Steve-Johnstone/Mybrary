const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const Author = require('../models/author');

//All books route
router.get('/', async (req, res) => {

    let query = Book.find();

    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }

    if (req.query.publishedBefore != null && req.query.title != '') {
        query = query.lte('publishedDate', req.query.publishedBefore);
    }

    if (req.query.publishedAfter != null && req.query.title != '') {
        query = query.gte('publishedDate', req.query.publishedAfter);
    }

    try {
        const books = await query.exec();

        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/');
    }
})

//New book route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
   
})

//Create new book route
router.post('/', async (req, res) => {
    
    const book = new Book ({
        title: req.body.title,
        author: req.body.author,
        publishedDate: new Date(req.body.publishedDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    });

    saveCover(book, req.body.cover);

    try {
        const newBook = await book.save();
        //res.redirect(`books/${newBook.id}`)
        res.redirect(`books`);
    } catch {
        renderNewPage(res, book, true);
    }
})

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find();
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) {
            params.errorMessage = 'Error creating book'
        }
        res.render('books/new', params);
    } catch {
        res.redirect('/books');
    }
}

function saveCover(book, encodedCover) {
    if (encodedCover == null) {
        return
    }
    const cover = JSON.parse(encodedCover);

    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type
    }

}

module.exports = router;
