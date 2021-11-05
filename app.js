const exp = require('constants');
const express = require('express');
//const bodyParser = require('body-parser'); now deprecated
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

//app.use(bodyParser.json()); express now able to parse json
app.use(express.json());

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String!): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return ['Coding this app', 'Sailing', 'Studying for that interview'];
        },
        createEvent: (args) => {
            const eventName = args.name;
            return eventName;
        }
    },
    graphiql: true
}));

app.listen(3000); 

