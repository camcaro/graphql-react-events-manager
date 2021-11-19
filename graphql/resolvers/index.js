const bcrypt = require("bcryptjs");

const Event = require("../../models/event.js");
const User = require("../../models/user.js");

const convertDate = obj => {
	return new Date(obj._doc.date).toISOString();
};

const events = eventIds => {
	return Event.find({ _id: { $in: eventIds } })
		.then(events => {
			return events.map(event => {
				return {
					...event._doc,
					date: convertDate(event),
					creator: user.bind(this, event._doc.creator)
				};
			});
		})
		.catch(err => {
			throw err;
		});
};

const user = userId => {
	// used to unpack (populate) the user object when referenced
	return User.findById(userId)
		.then(user => {
			return {
				...user._doc,
				createdEvents: events.bind(this, user._doc.createdEvents)
			};
		})
		.catch(err => {
			throw err;
		});
};

module.exports = {
	events: () => {
		return Event.find()
			.then(events => {
				return events.map(event => {
					//console.log("event id: " + event._doc._id.toString()); // No need to parse like this at below return
					return {
						...event._doc,
						date: convertDate(event),
						creator: user.bind(this, event._doc.creator)
					};
				});
			})
			.catch(err => {
				console.log(err);
				throw err;
			});
	},
	createEvent: args => {
		const event = new Event({
			title: args.eventInput.title,
			description: args.eventInput.description,
			price: +args.eventInput.price, //+ before args converts to number in case it was not
			date: new Date(args.eventInput.date),
			creator: "618ade5925183b056c5af594"
		});
		let createdEvent;
		return event
			.save()
			.then(result => {
				createdEvent = {
					...result._doc,
					date: convertDate(result),
					creator: user.bind(this, result._doc.creator)
				};
				return User.findById("618ade5925183b056c5af594");
			})
			.then(user => {
				if (!user) {
					throw new Error("User not found");
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
		return User.findOne({ email: args.userInput.email })
			.then(user => {
				if (user) {
					throw new Error("User exists already");
				}
				return bcrypt.hash(args.userInput.password, 12);
			})
			.then(hashedPassword => {
				const user = new User({
					email: args.userInput.email,
					password: hashedPassword // ***DO NOT store as plaintext!***
				});
				return user
					.save()
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
};
