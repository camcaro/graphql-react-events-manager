const exp = require('constants');
//const e = require('express');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event.js'); 

const app = express();

app.use(express.json());

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find()
                .then(events => {
                    return events.map(event => {
                        console.log(event._doc._id.toString()); // No need to parse like this at below return
                        return { ...event._doc };
                    });
                })
                .catch(err => {
                    console.log(err);
                    throw(err);
                });
        },
        createEvent: args => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price, //+ before args converts to number in case it was not
                date: new Date(args.eventInput.date) 
            });
            return event
                .save()
                .then(result => {
                    console.log(result);
                    return {  ...result._doc };
                }).catch(err => {
                    console.log(err);
                    throw err;
                }); 
        }
    },
    graphiql: true
}));

// Replaced mongo_db_admin:<password> with env variables + database name
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD
}@cluster0.mvjis.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
).then(() => {
    app.listen(3000);  
}).catch(err => {
    console.log(err);
}); 


