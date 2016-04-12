	
	var settings = require('./settings');

	module.exports = {

		  'fb_id'		: /^\d{10,20}$/
		, 'db_id'		: /^[a-f\d]{24}$/i
		, 'url'			: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})\/?/
		, 'invite_code' : /^[a-z0-9]{5,20}$/i
		, 'isodate'   	: /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/
	}