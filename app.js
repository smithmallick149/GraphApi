const express = require('express');
const bodyPaser = require('body-parser');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

//models
const Event = require('./models/event');

const app = express();

app.use(bodyPaser.json());

app.use(
	'/graphql',
	graphqlHTTP({
		schema: buildSchema(`
    type Event {
      _id:ID!
      title:String!
      description:String!
      price:Float!
      date:String!
    }

    input  EventInput {
      title: String!
      description:String!
      price: Float!
      date: String!
    }
    type RootQuery {
      events: [Event!]!
    }
    type RootMutation {
      createEvent(eventInput:EventInput):Event
    }
      schema {
        query:RootQuery
        mutation:RootMutation
      }
    `),
		rootValue: {
			events: () => {
				return Event.find()
					.then((events) => {
						return events.map((event) => {
							return { ...event._doc, _id: event.id };
						});
					})
					.catch((err) => {
						throw err;
					});
			},
			//create event resolvers
			createEvent: (args) => {
				// const event = {
				// 	_id: Math.random().toString(),
				// 	title: args.eventInput.title,
				// 	description: args.eventInput.description,
				// 	price: +args.eventInput.price,
				// 	date: args.eventInput.date,
				// };
				const event = new Event({
					title: args.eventInput.title,
					description: args.eventInput.description,
					price: +args.eventInput.price,
					date: new Date(args.eventInput.date),
				});
				return event
					.save()
					.then((result) => {
						console.log(result);
						return { ...result._doc, _id: result._doc._id.toString() };
					})
					.catch((err) => {
						console.log(err);
						throw err;
					});
			},
		},
		graphiql: true,
	})
);

mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_URI}:${process.env.MONGO_PASSWORD}@cluster0.q6y0c.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
	)
	.then(() => {
		app.listen(3000);
		console.log('DB Connecteed');
	})
	.catch((err) => {
		console.log(err);
	});
