	
	var eventUtils  = require('../../pushevents/eventUtils'),
		_     	    = require('lodash'),
		settings    = require('../../config/settings');

	var Event 	    = require('../../models/EventModel'),
		User        = require('../../models/UserModel');

	var nv 			= require('node-validator');

	function check( req, res, next ){

		console.log('Validating change group status');

		var checkReq = nv.isAnyObject()
			.withRequired('socket_id'   , nv.isString() )
			.withRequired('group_status', nv.isString({ expected: ['accepted','kicked'] }) )
			.withRequired('group_id'    , nv.isString() )
			.withRequired('chat_id'		, nv.isString() )

		nv.run( checkReq, req.sent, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			checkWithDatabase( req, function( errors, evt ){

				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
					return next();
				}

			req.sent.evt = evt;
			next();

			});
		});
	};

		function checkWithDatabase( req, callback ){

			var event_id = req.sent.event_id,
				group_id = req.sent.group_id;

			Event.findById( event_id, function( err, evt ){

				if( err ) return callback({ message: "api error" }, null );

				if( !evt )
					return callback({
						message		: "Couldnt find the event",
						data: {
							err_id		: "ghost_event",
							event_id	: event_id
						}
					}, null );

				/*
				if( _.pluck( evt.hosts, 'facebook_id' ).indexOf( req.facebook_id ) == -1 ){
					return callback({
						message		: "Unauthorized action!",
						parameter	: "facebook_id",
						data: {
							err_id 		: "unauthorized",
							authorized  : _.pluck( evt.hosts, "facebook_id"),
							event_id 	: req.event_id
						}
					}, null );
				}f
				*/

				if( evt.getGroupIds().indexOf( group_id ) == -1 ){
					return callback({
						message		: "No matching group id was found",
						parameter	: "group_id",
						data: {
							err_id 		: "invalid_group_id",
							group_id    : req.group_id,
							group_ids   : evt.getGroupIds()
						}
					}, null );
				};


				// Find the current group in event for desc functions
				var updated_group = evt.getGroupById( group_id );

				console.log( JSON.stringify( updated_group, null, 3 ) );

				req.sent.members_facebook_id = updated_group.members_facebook_id;
				req.sent.group_name          = updated_group.name;

				// Do not set group_status on req, it's already passed.
				// Otherwise, it overrides the new value 

				callback( null, evt );
					
				});
			
		};



	module.exports = {
		check: check
	};

