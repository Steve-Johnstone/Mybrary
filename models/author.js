const mongoose = require('mongoose');
const Book = require('./book');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('remove', function(next) {
    Book.find({ author: this.id }, (err, books) => {
        if (err) {
            console.log('General error')
            next(err)
        } else if (books.length > 0) {
            console.log('Author has books')
            next(new Error('This author has books still'))
        } else {
            console.log('Not finding authors books')
            next()
        }
    })
})

module.exports = mongoose.model('Author', authorSchema);
