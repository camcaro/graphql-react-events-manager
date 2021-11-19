const bcrypt = require("bcryptjs");

const Event = require("../../models/event.js");
const User = require("../../models/user.js");

const convertDate = obj => {
	return new Date(obj._doc.date).toISOString();
};

const events = async eventIds => {
	try {
		const eventsReceived = await Event.find({ _id: { $in: eventIds } });
		return eventsReceived.map(event => {
			return {
				...event._doc,
				date: convertDate(event),
				creator: user.bind(this, event._doc.creator)
			};
		});
	} catch (err) {
		throw err;
	}
};

const user = async userId => {
	// used to unpack (populate) the user object when referenced
	try {
		const user = await User.findById(userId);
		return {
			...user._doc,
			createdEvents: events.bind(this, user._doc.createdEvents)
		};
	} catch (err) {
		throw err;
	}
};

module.exports = {
	events: async () => {
		try {
			const events = await Event.find();
			return events.map(event => {
				//console.log("event id: " + event._doc._id.toString()); // No need to parse like this at below return
				return {
					...event._doc,
					date: convertDate(event),
					creator: user.bind(this, event._doc.creator)
				};
			});
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	createEvent: async args => {
		const event = new Event({
			title: args.eventInput.title,
			description: args.eventInput.description,
			price: +args.eventInput.price, //+ before args converts to number in case it was not
			date: new Date(args.eventInput.date),
			creator: "618ade5925183b056c5af594"
		});
		let createdEvent;
		try {
			const result = await event.save();
			createdEvent = {
				...result._doc,
				date: convertDate(result),
				creator: user.bind(this, result._doc.creator)
			};
			const creator = await User.findById("618ade5925183b056c5af594");
			if (!creator) {
				throw new Error("User not found");
			}
			creator.createdEvents.push(event); // can add just the document id or the whole object
			await creator.save();
			return createdEvent;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	createUser: async args => {
		try {
			const existingUser = await User.findOne({ email: args.userInput.email });
			if (existingUser) {
				throw new Error("User exists already");
			}
			const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
			const user = new User({
				email: args.userInput.email,
				password: hashedPassword // ***DO NOT store as plaintext!***
			});
			const result = await user.save();
			return {
				...result._doc,
				password: null
			};
		} catch (err) {
			throw err;
		}
	}
};
