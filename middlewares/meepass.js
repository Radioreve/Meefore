//meepass.js
	var _ = require('lodash');

	var User = require('../models/UserModel');


	var bounty = {
		"event_created": 5
	}


	function displayError( err, raw ){

		if( err ){
			console.log('Error updating meepass count : ' + err );
		} else {
			console.log( raw.n + ' users received meepass');
		}

	}


	var updateMeepass = function( reason ){	

			console.log('Updating meepass for reason : ' + reason );

			// Credit meepasses on all hosts
			if( reason == "event_created" ){
				return addMeepass_EventCreated
			}

			// Remove one meepass from the sender
			if( reason == "meepass_sent" ){
				return removeMeepass_MeepassSent
			}

	};


	function addMeepass_EventCreated( req, res, next ){

		req.sent.reason = "event_created";

		var facebook_ids   = req.sent.hosts_facebook_id;
		var meepass_to_add = bounty[ req.sent.reason ];

		var query = { 
			facebook_id: { $in: facebook_ids }
		};
		var update = {
			"$inc": { "n_meepass": meepass_to_add }
		};
		var options = {
			multi: true
		};
		
		User.update( query, update, options, displayError );

		next();

	}




	function removeMeepass_MeepassSent( req, res, next ){

		req.sent.reason = "meepass_sent";

		var facebook_id    = req.sent.facebook_id;
		var meepass_to_add = -1;

		var query = {
			facebook_id: facebook_id,
		};
		var update = {
			"$inc": { "n_meepass": meepass_to_add }
		};
		var options = {
			multi: false
		};

		console.log('Calling db')
		User.update( query, update, options, displayError );

		console.log('Calling next');
		next();


	}

	module.exports = {
		updateMeepass: updateMeepass
	};