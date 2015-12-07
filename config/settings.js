
var config = require('./config');

var settings = {

	api_version: 1,
	app: {
		min_group: 2,
		max_group: 5,
		min_hosts: 2,
		max_hosts: 5,
		min_ambiance: 1,
		max_ambiance: 4,
		max_attendees: 500,
		min_attendees: 20,
		mood: 
		[
			{ id: 'happy', display: 'Happy' },
			{ id: 'cheers', display: 'Relax' },
			{ id: 'drunk', display: 'Drunk' },
			{ id: 'chill', display: 'Chill' },
			{ id: 'horney', display: 'Horney' },
			{ id: 'innocent', display: 'Innocent' },
			{ id: 'evil', display: 'Evil' },
		],
		drink:
		[
			{ id: 'water', display: 'H2O' },
			{ id: 'hard', display: 'Hard' },
			{ id: 'shots', display: 'Shots' },
			{ id: 'beer', display: 'Beer' },
			{ id: 'wine', display: 'Wine' }
		],
		agerange_min: 18,
		agerange_max: 35,
		mixity: 
		[
			{ id: 'boys', display: 'Mars', icon_code: 'mars' },
			{ id: 'girls', display: 'Vénus', icon_code: 'venus' },
			{ id: 'mixed', display: 'Mixte', icon_code: 'mix' },
		],
		party_types: 
		[
			{ id: 'facebook', display: 'Event facebook', icon_code: 'facebook' },
			{ id: 'nightclub', display: 'Nightclub', icon_code: 'moon' },
			{ id: 'bar', display: 'Bar', icon_code: 'cafe' },
			{ id: 'school', display: 'Ecole', icon_code: 'graduation-cap' }
		],
		place_types:
		[
			{ id: 'nightclub', display: 'Club', icon_code: 'moon' },
			{ id: 'barclub', display: 'Bar dansant', icon_code: 'cafe' }
		]
	},
	default_app_preferences: {
		email: {
	        'newsletter'  : config.mailchimp.groups["newsletter"].init_value,
	        'invitations' : config.mailchimp.groups["invitations"].init_value
      	},
      	alerts: {
	        'message_unread': 'yes',
	        'accepted_in' : 'yes',
	        'min_frequency': '7200' // 1 hour
      	},
      	ux: {
	        'auto_login': 'no',
	        'message_readby': 'yes'
      	}
	},
	public_properties: {
		users: 
			[
				'facebook_id',
				'facebook_url', 
				'signup_date', 
				'age', 
				'gender', 
				'job', 
				'name', 
				'drink', 
				'mood',
				'country_code', 
				'pictures',
				'channels'
				//'skills'
			],
		events: []
	},
	activeEventStates:
			 [
			 	"open",
			 	"suspended"
			 ],
	placeholder: 
			{
				img_id      :"placeholder_picture",
				img_version :"1444912756"
			},

	// Builds a ladder system as an array of ladder items
	// Based on the range of levels necesary, the base points
	// And the coef to determine how hard it is to climb the ladder
	// Each item contains a level and a range of xp
	ladder_max_level: 30,
	ladder_base_point: 100,
	ladder_base_coef: 1.5,

	initLadder: function initLadder( options ){ 

		var options = options || {};

		var max_level  = options.max_level  || this.ladder_max_level,
			base_point = options.base_point || this.ladder_base_point,
			base_coef  = options.base_coef  || this.ladder_base_coef;

		if( !max_level || !base_coef || !base_point )
			return console.log('Missing parameter, max_level: ' + max_level + ', base_point: ' + base_point + ', base_coef: ' + base_coef );

		var skill_ladder = [{ 
			level: 1,
			min_xp: base_point,
			max_xp: base_point + base_point * base_coef 
		}];

		for( var i = 1; i <= max_level; i++ ){

			var item = {}

			item.level = i+1;
			item.min_xp = skill_ladder[i-1].max_xp; 

			var max_xp = ( i * base_point ) + Math.floor( base_point * Math.pow( base_coef, i+1 ) ),
				max_xp_length = ( max_xp + '' ).length,
				rounder = Math.pow( 10, max_xp_length - 3 );

			item.max_xp = Math.floor( max_xp / rounder ) * rounder;

			skill_ladder.push( item );
			
		}

		return skill_ladder;

	}
};


module.exports = settings;