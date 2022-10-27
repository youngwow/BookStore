const mongoose = require('mongoose');
const path = require('path');
const coverImageBasePath = 'uploads/bookCovers';

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    coverImage: {
        type: Buffer,
        required: true
    },
    coverImageType: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    },
    isTaken: {
        type: Boolean,
        required: true,
        default: true  // TODO: fix to false and then fix other things due to that
    },
    takenByUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    dateReturn: {
        type: Date,
        required: false
    }
});

bookSchema.virtual('coverImagePath').get(function() {
    if (this.coverImage != null && this.coverImageType != null) {
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
});


module.exports = mongoose.model('Book', bookSchema);
