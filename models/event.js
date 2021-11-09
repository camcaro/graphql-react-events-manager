const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    // has to be the same as the graphql schema, although they are not related
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Event', eventSchema);