
var config = require('./config');

var placeholder_img_id = "placeholder_sketched_rounded";
var placeholder_img_vs = "1469003035";
var min_age            = 18;

var settings = {

	api_version: 1,
	app: {
		min_group: 1,
		max_group: 4,
		min_hosts: 1,
		max_hosts: 4,
		min_age  : min_age,
		max_age  : 50,
		max_pic  : 5,
		min_hashtags: 1,
		max_hashtags: 10,
		chat_fetch_count: 20
	},
	feedback_ids: [
		"hello",
		"bug",
		"improvement",
		"other"
	],
	min_frequency: 1,
	closed_map_hours: [ 6, 14 ],
	facebook: {
		token_lifespan_limit: 20
	},
	default_pictures: [
		{ img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 0, is_main: true , hashtag: 'me' },
      	{ img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 1, is_main: false, hashtag: 'hot' },
	    { img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 2, is_main: false, hashtag: 'friends' },
	    { img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 3, is_main: false, hashtag: 'natural' },
	    { img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 4, is_main: false, hashtag: 'whatever' }
	],
	default_app_preferences: {

		alerts_push: {},	 
		alerts_phone: {},
		alerts_email: {
			"new_message"    : true,
			"marked_as_host" : true,
			"new_cheers"     : true,
			"new_match"      : true
		},
      	ux: {
	        'auto_login'   : true,
	        'message_seen' : true,
	        'show_gender'  : true,
	        'show_country' : false
      	},
      	subscribed_emails: {
      		// See below, dynamically rendered by the config file 
      	}
	},
	public_properties: {
		users: 
			[
				'facebook_id',
				'facebook_url', 
				'name', 
				'age',
				'job', 
				'location',
				'pictures',
				'gender', 
				'country_code', 
				'signed_up_at', 
				// 'channels',
				'ideal_night'
			],
		befores: []
	},
	placeholder: {
		img_id      : placeholder_img_id,
		img_version : placeholder_img_vs
	},
	onboarding_ids: [

		"welcome_to_meefore",
		"create_before",
		"send_cheers",
		"check_settings"

	]

};
	
	// Setting the mailchimp defaults 
	settings.default_app_preferences.email = settings.default_app_preferences.email || {};
	
	config.mailchimp[ process.env.APP_ENV ].interests.forEach(function( interest ){
		settings.default_app_preferences.subscribed_emails[ interest.name ] = interest.default_value;
	});



module.exports = settings;