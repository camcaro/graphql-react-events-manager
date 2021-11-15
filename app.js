const exp = require('constants');
//const e = require('express');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event.js'); 
const User = require('./models/user.js');

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

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
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
                date: new Date(args.eventInput.date),
                creator: '618ade5925183b056c5af594'
            });
            let createdEvent;
            return event
                .save()
                .then(result => {
                    createdEvent = { ...result._doc };
                    return User.findById('618ade5925183b056c5af594')
                })
                .then(user => {
                    if (!user) {
                        throw new Error('User not found');
                    }
                    user.createdEvents.push(event); // can add just the document id or the whole object
                    return user.save();
                })
                .then(result => {
                    return createdEvent;                    
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                }); 
        },
        createUser: args => {
            return User.findOne({ email: args.userInput.email }).then(user => {
             if (user) {
                 throw new Error('User exists already');
             }
             return bcrypt
                 .hash(args.userInput.password, 12)
            })
            .then(hashedPassword => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword // ***DO NOT store as plaintext!***
                });
                return user.save()
                    .then(result => {
                        return { ...result._doc, password: null };
                    })
                    .catch(err => {
                        throw err;
                    });
                })
                .catch(err => {
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


