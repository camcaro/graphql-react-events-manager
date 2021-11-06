const exp = require('constants');
const e = require('express');
const express = require('express');
//const bodyParser = require('body-parser'); now deprecated
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

const events = []; // temporary, later we'll use a database

//app.use(bodyParser.json()); express now able to parse json
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
            return events;
        },
        createEvent: (args) => {
            const event = {
                _id: Math.random().toString(),
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price, //+ before args converts to number in case it was not
                date: args.eventInput.date
            };
            events.push(event);
            return event;
        }
    },
    graphiql: true
}));

app.listen(3000); 

