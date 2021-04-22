const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const Author = require('../models/author');
const book = require('../models/book');

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

router.get('/:id', async (req, res) => {

    try {
        const book = await Book.findById(req.params.id).populate('author');

        res.render('books/show', {
            book: book
        })
    } catch {
        res.redirect('/');
    }
});

//Edit Book Route
router.get('/:id/edit', async (req, res) => {

    try {
        const book = await Book.findById(req.params.id);
    
        renderEditPage(res, book)
    } catch {
        res.redirect('/')
    }
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
        res.redirect(`books/${newBook.id}`);
    } catch {
        renderNewPage(res, book, true);
    }
})

router.put('/:id', async (req, res) => {

   let book;

    try {
        book = await Book.findById(req.params.id);
        
        book.title = req.body.title,
        book.description = req.body.description,
        book.publishedDate = req.body.publishedDate,
        book.pageCount = req.body.pageCount,
        book.author = req.body.author

        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover)
        }
        await book.save();

        res.redirect(`/books/${book.id}`);
    } catch {

        if (book != null) {
            renderNewPage(res, book, true);
        } else {
            res.redirect('/')
        }
    }
})

router.delete('/:id', async (req, res) => {

    let book;

    try {

        book = await Book.findByIdAndDelete(req.params.id);

        res.direct('/books');

    } catch {
        if (book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove book'
            });
        } else {
            res.redirect('/');
        }
    }
})

async function renderNewPage(res, book, hasError = false) {

    console.log('Rendering new page')

    renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {

    console.log('rendering edit page')

    renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {

    console.log('Form at start of function: ', form);
    try {
        const authors = await Author.find();
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) {
            console.log('Form upon error handle: ', form);
            if (form == 'edit') {
                params.errorMessage = 'Error Updating Book'
            } else {
                params.errorMessage = 'Error creating book'
            }
        }
        res.render(`books/${form}`, params);
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
