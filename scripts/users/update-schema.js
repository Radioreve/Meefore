
	var dir      = process.cwd();
	
	var mongoose = require('mongoose');
	var _        = require('lodash');
	var async    = require('async');
	var moment   = require('moment');
	
	var User     = require( dir +  '/models/UserModel');
	var config   = require( dir + '/config/config');

	mongoose.connect( config.db[ process.env.NODE_ENV ].uri );

	mongoose.connection.on( 'open', function(){
		
		console.log('Connected to the database! Running operation... : ');

		User.find({ "facebook_id": "108070099597465" }, function( err, users ){

			if( err ) return console.log( err );

			var tasks = [];
			users.forEach(function( user ){
				tasks.push(function( done ){

					// Update part
					user.channels.forEach(function( chan, i){
						if( chan && chan.type == "location" ){
							user.channels[i] = undefined;
						}
					});

					user.channels = user.channels.filter(Boolean);
					user.markModified('channels');
					
					user.save(function( err ){
						if( err ) console.log('Error : ' + err );
						console.log('user updated');
						done();
					});
					

				});
			});

			async.parallel( tasks, function( err, result){

				if( err ) return console.log( err );
				console.log('Everything has been updated successfully');
				process.exit(0);
			});

		});

	});

	mongoose.connection.on('error', function(err){
		console.log('Connection to the database failed : '+err);
	});

	function randomInt(low, high) {
		return Math.floor(Math.random() * (high - low + 1) + low);
	};