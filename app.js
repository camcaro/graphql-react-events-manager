const exp = require("constants");
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema");
const graphQlResolvers = require("./graphql/resolvers");

const app = express();

app.use(express.json());

app.use(
	"/graphql",
	graphqlHTTP({
		schema: graphQlSchema,
		rootValue: graphQlResolvers,
		graphiql: true
	})
);

// Replaced mongo_db_admin:<password> with env variables + database name
mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.mvjis.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
	)
	.then(() => {
		app.listen(3000);
	})
	.catch(err => {
		console.log(err);
	});
