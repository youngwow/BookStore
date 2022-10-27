const mongoose = require('mongoose');
const Book = require('./book')


const userSchema = new mongoose.Schema({
    id: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        required: [true, "email required"],
        unique: [true, "email already registered"],
    },
    firstName: String,
    lastName: String,
    source: {
        type: String,
        required: [true,
            "source not specified"]
    },
    lastVisited: {
        type: Date,
        default: new Date()
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

userSchema.pre('remove', function(next) {
    Book.find({ takenByUser: this.id }, (err, books) => {
        if (err) {
            next(err)
        } else if (books.length > 0) {
            next(new Error('This user has books still'))
        } else {
            next()
        }
    })
})

module.exports = mongoose.model('User', userSchema, 'User');