"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");
let google		= require("googleapis");
let googleAuth	= require("google-auth-library");

let User 		= require("./models/user");

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

module.exports = {
	settings: {
		name: "profile",
		version: 1,
		namespace: "profile",
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		role: "user",
		collection: User,

		modelPropFilter: "code username fullName email avatar passwordLess provider profile socialLinks roles apiKey lastLogin locale status createdAt updatedAt"
	},
	
	actions: {
		// return my profile with all properties
		get: {
			cache: false, // can't be cached, because it is unique for every account
			handler(ctx) {
				return User.findById(User.schema.methods.decodeID(ctx.user.code)).exec().then( (doc) => {
					return this.toJSON(doc);
				})
				.then((json) => {
					return this.populateModels(json);
				});
			}
		}

		, update(ctx) {
			ctx.assertModelIsExist(ctx.t("app:UserNotFound"));
			console.log("● ctx", ctx);

			return this.collection.findById(ctx.modelID).exec()
			.then(doc => {
				if (doc.googleAuthToken) {

				} else {
					const clientID = config.authKeys.google.clientID;
					const clientSecret = config.authKeys.google.clientSecret;
					const redirectUrl = "http://localhost:3000/authorizing";

					let auth = new googleAuth();
					let oauth2Client = new auth.OAuth2(clientID, clientSecret, redirectUrl);

					let authUrl = oauth2Client.generateAuthUrl({
						access_type: "offline",
						scope: SCOPES
					});
					return Promise.resolve()
					.then(() => {
						return this.toJSON(doc)
					})
					.then(json => {
						return this.populateModels(json);
					})
					.then(json => {
						json.googleAuthUrl = authUrl;
						return json;
					});
				}
			});
		}
	},

	methods: {
	},

	graphql: {

		query: `
			profile: Profile
		`,

		types: `
			type Profile {
				code: String!
				fullName: String
				email: String
				username: String
				passwordLess: Boolean
				provider: String
				profile: SocialProfile
				socialLinks: SocialLinks
				roles: [String]
				verified: Boolean
				apiKey: String
				locale: String
				avatar: String
				createdAt: Timestamp
				updatedAt: Timestamp
				lastLogin: Timestamp
				status: Boolean
			}

			type SocialProfile {
				name: String
				gender: String
				picture: String
				location: String
			}

			type SocialLinks {
				facebook: String
				twitter: String
				google: String
				github: String
			}
		`,		

		mutation: `
		`,

		resolvers: {
			Query: {
				profile: "get"
			}
		}
	}

};

/*
## GraphiQL test ##

# Get a person
query getPerson {
  person(code: "O5rNl5Bwnd") {
    ...personFields
  }
}


fragment personFields on Person {
  code
  fullName
  email
  username
  roles
  verified
  avatar
  lastLogin
  locale
  
  posts(sort: "-createdAt") {
    code
    title
  }
}

*/