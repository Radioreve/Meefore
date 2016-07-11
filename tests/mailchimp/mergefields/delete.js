
	var _ 	     = require('lodash');
	var config   = require('../../../config/config').mailchimp;
	var Promise  = require('bluebird');
	var fs 		 = Promise.promisifyAll( require('fs') );
	var tools 	 = require('../../tools');

	// Mailchimp interface
	var MailchimpInterface = require('../../../services/mc');
	var Mailchimp 		   = new MailchimpInterface( _.extend( {}, config, { list_id: "ace186c18c" } ));


	// Test - Create a new member in the list


	Mailchimp.getMergeFields()
		.then(function( merge_fields ){
			var id = merge_fields[0].merge_id;
			Mailchimp.infoLog("Removing merge_field with id " + id );
			return Mailchimp.deleteMergeField( id );
		})
		.then(function(){
			return Mailchimp.writeMergeFieldsToFile( __dirname + '/../' );
		})
		// .then( console.log )
		// .catch( console.log );





