const bcrypt = require("bcryptjs");

const Event = require("../../models/event.js");
const User = require("../../models/user.js");
const Booking = require("../../models/booking.js");

const convertDate = date => {
	return new Date(date).toISOString();
};

const events = async eventIds => {
	try {
		const eventsReceived = await Event.find({ _id: { $in: eventIds } });
		return eventsReceived.map(event => {
			return {
				...event._doc,
				date: convertDate(event._doc.date),
				creator: user.bind(this, event._doc.creator)
			};
		});
	} catch (err) {
		throw err;
	}
};

const singleEvent = async eventId => {
	try {
		const receivedEvent = await Event.findById(eventId);
		return {
			...receivedEvent._doc,
			date: convertDate(receivedEvent._doc.date),
			creator: user.bind(this, receivedEvent._doc.creator)
		};
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
					date: convertDate(event._doc.date),
					creator: user.bind(this, event._doc.creator)
				};
			});
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	bookings: async () => {
		try {
			const bookings = await Booking.find();
			// console.log({ ...bookings[0]._doc._id });
			return bookings.map(booking => {
				return {
					...booking._doc,
					event: singleEvent.bind(this, booking._doc.event),
					user: user.bind(this, booking._doc.user),
					createdAt: convertDate(booking._doc.createdAt),
					updatedAt: convertDate(booking._doc.updatedAt)
				};
			});
		} catch (err) {
			throw err;
		}
	},
	createEvent: async args => {
		const event = new Event({
			title: args.eventInput.title,
			description: args.eventInput.description,
			price: +args.eventInput.price, //+ before args converts to number in case it was not
			date: new Date(args.eventInput.date),
			creator: "6197d4453a971fbf18a09a4f"
		});
		let createdEvent;
		try {
			const result = await event.save();
			createdEvent = {
				...result._doc,
				date: convertDate(result._doc.date),
				creator: user.bind(this, result._doc.creator)
			};
			const creator = await User.findById("6197d4453a971fbf18a09a4f");
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
	},
	bookEvent: async args => {
		try {
			const fetchedEvent = await Event.findOne({ _id: args.eventId });
			const booking = new Booking({
				user: "6197d4453a971fbf18a09a4f",
				event: fetchedEvent
			});
			const result = await booking.save();
			return {
				...result._doc,
				event: singleEvent.bind(this, result._doc.event),
				user: user.bind(this, result._doc.user),
				createdAt: convertDate(result._doc.createdAt),
				updatedAt: convertDate(result._doc.updatedAt)
			};
		} catch (err) {
			throw err;
		}
	},
	cancelBooking: async args => {
		try {
			const booking = await Booking.findById(args.bookingId).populate("event");
			const event = {
				...booking.event._doc,
				date: convertDate(booking.event._doc.date),
				creator: user.bind(this, booking.event._doc.creator)
			};
			await Booking.deleteOne(booking);
			return event;
		} catch (err) {
			throw err;
		}
	}
};
