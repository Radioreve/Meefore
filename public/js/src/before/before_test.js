window.LJ.before = _.merge( window.LJ.before || {}, {

		test: {
				iso_dates: [
					"2016-07-22T22:30:48.1234Z",
					"2016-07-22T21:30:22.1234Z",
					"2016-07-23T19:35:43.1234Z",
					"2016-07-25T18:30:45.1234Z",
					"2016-07-24T16:20:25.1234Z",
					"2016-07-27T22:32:45.1234Z",
					"2016-07-27T22:45:15.1234Z",
					"2016-07-27T20:30:42.1234Z",
					"2016-07-28T16:20:25.1234Z",
					"2016-07-29T21:32:41.1234Z",
					"2016-07-30T22:25:11.1234Z",
					"2016-07-30T20:10:12.1234Z",
					"2016-08-22T22:30:48.1234Z",
					"2016-08-22T22:33:55.1234Z",
					"2016-08-23T19:35:43.1234Z",
					"2016-08-25T18:34:45.1234Z",
					"2016-08-24T16:24:24.1234Z",
					"2016-08-27T22:32:45.1234Z",
					"2016-08-27T22:45:45.1234Z",
					"2016-08-27T20:30:44.1234Z",
					"2016-08-28T19:20:25.1234Z",
					"2016-08-29T21:32:41.1234Z",
					"2016-08-30T22:24:11.1234Z",
					"2016-08-30T20:14:12.1234Z",

			],
			before_data: {

				hosts_facebook_id: ["152108635187978","149685995430834"],
				address: {
					lat: "48.8526266",
					lng: "2.332816600000001",
					place_id: "ChIJHcrWXNdx5kcRssJewNDrBRM",
					place_name: "Rue du Four, 75006 Paris, France"
				},
				begins_at: "2016-04-27T09:21:11.519Z",
				timezone: 120

			},
			readAndCreateBefore: function( param ){

				var req = {};

				req.hosts_facebook_id = [ LJ.user.facebook_id ]; //_.shuffle( LJ.user.friends ).slice(0,1).concat( LJ.user.facebook_id );
				req.address   		  = _.shuffle( LJ.map.test.places )[0];
				// req.begins_at		  = '2016-0'+LJ.randomInt( 8,9 )+'-' + LJ.randomInt( 10, 30 )+'T18:18:18Z'
				req.timezone 		  = 120;
				req.hashtags          = ["before","test","laVieEstDure","putainDeBugs"];

				if( param && req[ param ] ){
					delete req[ param ];
				}

				return LJ.api.createBefore( req );

			},
			handleCreateBefore: function(){

				LJ.log('Handling create before...');

				var ux_done    = LJ.before.pendifyCreateBefore();
				var be_created = LJ.before.test.readAndCreateBefore();

				LJ.Promise.all([ be_created, ux_done ]).then(function( res ){
					return LJ.before.endCreateBefore( res[0] );

				})
				.catch(function( e ){
					LJ.before.handleCreateBeforeError(e);

				});

			},
			handleCreateBeforeWithSpecificFriend: function( facebook_id ){

				LJ.log('Handling create before with friend...');

				var ux_done    = LJ.before.pendifyCreateBefore();
				var be_created = LJ.before.test.readAndCreateBeforeWithFriend( facebook_id );

				LJ.Promise.all([ be_created, ux_done ]).then(function( res ){
					return LJ.before.endCreateBefore( res[0] );

				})
				.catch(function( e ){
					LJ.before.handleCreateBeforeError(e);

				});

			},
			readAndCreateBeforeWithFriend: function( friend_id ){

				var req = {};

				req.hosts_facebook_id = [ LJ.user.facebook_id, friend_id ];
				req.address   		  = _.shuffle( LJ.map.test.places )[0];
				req.begins_at		  = '2016-0'+LJ.randomInt(6,9)+'-' + LJ.randomInt(10,30)+'T18:18:18Z'
				req.timezone 		  = 120;

				return LJ.api.createBefore( req );

			},
			handleCreateBefore__MissingHosts: function(){

				LJ.log('Handling create before...');

				var ux_done    = LJ.before.pendifyCreateBefore();
				var be_created = LJ.before.test.readAndCreateBefore('hosts_facebook_id');

				LJ.Promise.all([ be_created, ux_done ]).then(function( res ){
					return LJ.before.endCreateBefore( res[0] );

				})
				.catch(function( e ){
					LJ.before.handleCreateBeforeError(e);

				});
			},
			handleCreateBefore__MissingLocation: function(){

				LJ.log('Handling create before...');

				var ux_done    = LJ.before.pendifyCreateBefore();
				var be_created = LJ.before.test.readAndCreateBefore('address');

				LJ.Promise.all([ be_created, ux_done ]).then(function( res ){
					return LJ.before.endCreateBefore( res[0] );

				})
				.catch(function( e ){
					LJ.before.handleCreateBeforeError(e);

				});
			},
			handleCreateBefore__MissingDate: function(){

				LJ.log('Handling create before...');

				var ux_done    = LJ.before.pendifyCreateBefore();
				var be_created = LJ.before.test.readAndCreateBefore('begins_at');

				LJ.Promise.all([ be_created, ux_done ]).then(function( res ){
					return LJ.before.endCreateBefore( res[0] );

				})
				.catch(function( e ){
					LJ.before.handleCreateBeforeError(e);

				});
			}
		}

	});

	 window.bc  = LJ.before.test.handleCreateBefore;
	 window.bcf = LJ.before.test.handleCreateBeforeWithSpecificFriend
	 window.fid = function(){ return LJ.user.facebook_id;}
