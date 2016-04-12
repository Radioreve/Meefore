
	window.LJ.profile = _.merge( window.LJ.profile || {}, {

		$profile:   $('.menu-section.--profile'),
		$pictures:  $('.pictures'),
		$thumbnail: $('.app-thumbnail'),

		init: function( resolve, reject ){
			return LJ.promise(function( resolve, reject ){
				
				LJ.api.fetchMe()
					.then( LJ.log("User profile fetched"))
					.then( LJ.profile.setMyInformations )
					.then( LJ.profile.setMyThumbnail )
					.then( LJ.profile.setMyPictures )
					.then( LJ.profile.setMyHashtags )
					.then( LJ.pictures.init )
					.then( LJ.settings.init )
					.then( LJ.profile.handleDomEvents )
					.then( LJ.seek.activatePlacesInProfile )
					.then( LJ.notifications.init )
					.then( resolve )

			});

		},
		setMyInformations: function(){

			$('#me__name').val( LJ.user.name );
			$('#me__job').val( LJ.user.job );
			$('#me__ideal-night').val( LJ.user.ideal_night );
			$('#me__location').val( LJ.user.location.place_name );
			$('#me__country').val( LJ.text_source["country_" + LJ.user.country_code ][ LJ.lang.getAppLang() ]);

			// Set age restrictions
			$('#me__age').val( LJ.user.age )
				 .attr('max', LJ.app_settings.app.max_age )
				 .attr('min', LJ.app_settings.app.min_age );

				
		},
		setMyThumbnail: function(){

			$('.thumbnail__name').text( LJ.user.name );


		},
		setMyHashtags: function(){

			LJ.user.pictures.forEach(function( picture, i ){
				var hashtag = picture.hashtag;
				$('.picture').eq( i ).find('.picture__hashtag input').val( hashtag );
			});

		},
		setMyPictures: function(){

			// Thumbnail picture
			var main_pic = LJ.findMainPic();
			LJ.profile.$thumbnail.find('img').replaceWith( LJ.pictures.makeImgHtml( main_pic.img_id, main_pic.img_version, 'me-thumbnail') );

			// Profile pictures
			var html = [];
			LJ.user.pictures.forEach(function( pic ){
				html.push( LJ.profile.renderPicture( pic ) );
			});
			LJ.profile.$pictures.append( html.join('') );

		},
		handleDomEvents: function(){

			LJ.profile.$profile.on('click', 'input, textarea, .edit',   LJ.profile.activateInput );
			LJ.profile.$profile.on('click', '.action__cancel',   		LJ.profile.deactivateInput );
			LJ.profile.$profile.on('click', '.action__validate', 		LJ.profile.updateProfile );

		},
		handleApiError: function( err ){

			var err_ns  = err.namespace;
			var err_id  = err.errors[0].err_id;
			var call_id = err.call_id

			if( err.namespace == 'update_profile_base' ){
				$('[data-callid="' + call_id + '"]').removeClass('--validating'); 
				LJ.ui.showToast('La mise à jour na pas été effectuée', 'error');
				return;
			}

		},
		activateInput: function( element ){

			var $self;
			if( element instanceof jQuery ){
				$self = element;
			} else if( typeof element == 'string' ){
				$self = $( element );
			} else {
				$self = $( this );
			}

			var $block = $self.closest('.me-item');
			var $input = $block.find('input, textarea');

			if( $block.hasClass('--active') || $block.hasClass('--no-edit') ){
				return;
			} else {
				$block.addClass('--active'); 
			}

			$input.attr( 'readonly', false );

			$block.find('.action')
				  .velocity('bounceInQuick', {
				  	duration: LJ.ui.action_show_duration,
				  	display: 'flex'
				  });

			$block.find('.edit')
				  .velocity('bounceOut', {
				  	duration: LJ.ui.action_hide_duration,
				  	display: 'none'
				  });

			$block.attr('data-restore', $input.val() );

		},
		deactivateInput: function( element ){

			var $self;
			if( element instanceof jQuery ){
				$self = element;
			} else if( typeof element == 'string' ){
				$self = $( element );
			} else {
				$self = $( this );
			}

			var $block = $self.closest('.me-item');
			var $input = $block.find('input, textarea');

			if( $block.hasClass('--active') ){ $block.removeClass('--active'); } else { return; }

			$input.attr( 'readonly', true );

			$block.find('.action')
				  .velocity('bounceOut', {
				  	duration: LJ.ui.action_hide_duration,
				  	display: 'none'
				  });

			$block.find('.edit')
				  .velocity('bounceInQuick', {
				  	duration: LJ.ui.action_show_duration,
				  	delay: 400,
				  	display: 'flex'
				  });

			var former_value = $block.attr('data-restore');
			if( former_value != null ){
				$input.val( former_value );
				$block.attr( 'data-restore', null );
			}

		},
		updateProfile: function( element ){

			var update = {};

			var $self;
			if( element instanceof jQuery ){
				$self = element;
			} else if( typeof element == 'string' ){
				$self = $( element );
			} else {
				$self = $( this );
			}

			var $block = $self.closest('.me-item');
			var $input = $block.find('input, textarea');

			if( $block.length == 0 || !$block.hasClass('--active') || $block.hasClass('--validating') ){
				return LJ.wlog('Not calling the api');
			}

			if( $input.val() == $block.attr('data-restore') ){
				LJ.profile.deactivateInput.call( this, element );
				return LJ.wlog('Not calling the api (same value)');
			}

			var new_value = $block.find('input,textarea').val();
			var attribute = $block.attr('data-param');
			var call_id = LJ.generateId();

			update[ attribute ] = new_value;
			update[ 'call_id' ] = call_id;

			// Location is a specific case.
			if( attribute == "location" ){

				if( !LJ.seek.profile_places.getPlace() ) return;				
				
				$block.attr('data-store', LJ.seek.profile_places.getPlace().formatted_address );		
				update.location = {
					place_name : LJ.seek.profile_places.getPlace().formatted_address,
					place_id   : LJ.seek.profile_places.getPlace().place_id
				};
			}

			$block.attr( 'data-callid', call_id ).addClass('--validating');
			
			LJ.fn.log('Updating profile...');
			LJ.api.updateProfile( update )
				  .then( LJ.profile.handleUpdateProfileSuccess, LJ.profile.handleApiError );

		},
		handleUpdateProfileSuccess: function( exposed ){

			LJ.ui.showToast( LJ.text('to_profile_update_success') );

			$('.thumbnail__name').text( exposed.user.name );

			var $block  = $('.me-item[data-callid="' + exposed.call_id + '"]');
			var $input  = $block.find('input, textarea');
			var $action = $block.find('.action');

			// For location attribute specificity
			if( $block.attr('data-store') ){
				$input.val( $block.attr('data-store') );
			}

			$block.attr('data-restore', null );
			LJ.profile.deactivateInput( $input );
			

		},
		renderPicture: function( pic ){

			var img_html = LJ.pictures.makeImgHtml( pic.img_id, pic.img_version, "me" );
			var main     = pic.is_main ? '--main' : '';
			return LJ.ui.render([

				'<div class="picture ' + main + '" data-img-place="' + pic.img_place + '" data-img-id="' + pic.img_id + '" data-img-vs="' + pic.img_version + '">',
		            img_html,
		            '<div class="picture__ribbon-main" data-lid="picture_main_label"></div>',
		            '<div class="picture__progress-bar">',
		            	'<div class="picture__progress-bar-bg"></div>',
		            '</div>',
		            '<div class="picture-icon">',
		            	LJ.ui.renderIcon('upload', 	 	 ['picture__icon', '--upload-desktop']),
		            	LJ.ui.renderIcon('facebook', 	 ['picture__icon', '--upload-facebook']),
		            	LJ.ui.renderIcon('main-picture', ['picture__icon', '--mainify']),
		            	LJ.ui.renderIcon('trash', 		 ['picture__icon', '--trash']),
		            '</div>',
		            '<div class="picture__hashtag hashtag">',
		            	'<span class="hashtag__hash">#</span>',
		            	'<input readonly type="text" placeholder="hashtag">',
		            	'<div class="hashtag-action">',
			            	'<div class="hashtag__action-validate">',
			            		LJ.ui.renderIcon('check'),
			            	'</div>',
			            	'<div class="hashtag__action-cancel">',
			            		LJ.ui.renderIcon('cancel'),
			            	'</div>',
		            	'</div>',
		            '</div>',
	          '</div>'

			].join(''));

		}
	});












































	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEvents_Profile: function(){

			LJ.$body.on('click', '.row-informations .row-input', function(){

				var $edit_btn = $('.row-informations').find('i.icon-edit');

				if( $edit_btn.hasClass('active') )return; 
				$edit_btn.click(); 

			});

			LJ.$body.on('click', '.invite-friends', function(){

				FB.ui({
					method: 'send',
					link: 'http://www.meefore.com'
				});

			});

			$('.modal-container').on('click','.modal-thumb-picture', function(){

				var $self = $(this);

				if( $self.hasClass('active') ){
					return;
				}

				if( $self.attr('src').split('/').slice(-1)[0] == 'placeholder_picture'){
					return 
				}

				var img_place = $self.attr('img-place');
				$('.modal-thumb-picture, .modal-user-picture-hashtag').removeClass('active');
				$self.add( $('.modal-user-picture-hashtag[img-place="'+ img_place +'"]') ).addClass('active');

				var img_version = $self.attr('img-version');

				$('.modal-main-picture').removeClass('active');
				$('.modal-main-picture[img-version="' + img_version + '"]').addClass('active');

			});

			$('.modal-container').on('click', '.facebook-image-item', function(){

				var $self = $(this);

				if( $self.hasClass('active') ){
					$self.removeClass('active');
					$('.modal-container').find('.btn-validate').addClass('btn-validating');
				} else {
					$('.facebook-image-item').removeClass('active')
					$('.modal-container').find('.btn-validate').removeClass('btn-validating');
					$self.addClass('active');
				}

			});

			$('.modal-container').on('click', '.btn-cancel', LJ.fn.hideModal );

			$('.modal-container').on('click', '.btn-validate', function(){

				var $self = $(this);

				if( $self.hasClass('btn-validating') )
					return;

				if( $('.facebook-image-item.active').length != 1 )
					return;

				$self.addClass('btn-validating');

				var url = $('.facebook-image-item.active').find('img').attr('src');
				var img_place = $self.parents('.modal-container-body').children().last().attr('data-img-place');

				LJ.fn.hideModal();

				LJ.fn.updatePictureWithUrl({
						userId    : LJ.user._id,
						img_id    : LJ.user.facebook_id + '--' + img_place,  // id_pattern [very important!!]
						url       : url,
						img_place : img_place
        			}, function( err, data ){

					if( err ) return LJ.fn.handleUnexpectedError();

					LJ.fn.handleServerSuccess( LJ.text_source["p_picture_upload_success"][ LJ.app_language ] ); 

					var pic = _.find( LJ.user.pictures, function(el){
							return el.img_place == img_place;
						});

					// Update the value to refresh thumb img ( in create meefore e.g )
					pic.img_id      = data.img_id;
                	pic.img_version = data.img_version;

                	// Check the scope to know if updating the thumb is necessary
					var scope = pic.is_main ? ['profile','thumb'] : ['profile'];

					LJ.fn.replaceImage({
						img_id      : data.img_id,
						img_version : data.img_version,
						img_place   : img_place,
						scope       : scope
					});



				});
				
			});

			LJ.$body.on('mouseover', '#createEvent', function(){
				$('.search-results-places').addClass('open');
			});



			LJ.$body.on('click', '.row-informations .btn-validate', function(){
				if( $(this).hasClass('btn-validating') )
					return;
				$(this).addClass('btn-validating');
				LJ.fn.updateProfile();
			});

			/* Généric ui update of selectable inputs */
			LJ.$body.on('click', '.row-select', function(){
				var $self = $(this);
				if( !$self.parents('.row-select-daddy').hasClass('editing') )
					return ;

				var $selectedType = $self.parents('.row-select-wrap');
				$selectedType.find('.row-select.modified').removeClass('modified');
				$self.addClass('modified');
			
			});


			/* Activate modifications */
			LJ.$body.on('click', '.row-select-daddy .icon-edit:not(.active)', function(){ 

				var $self = $(this);
				var $daddy = $self.parents('.row-select-daddy');

				$self.addClass('active');
				$daddy.addClass('editing');
				
				$daddy
					.find('.row-buttons').velocity('transition.fadeIn',{ duration:600 })
					.end().find('input:not(.readonly)').attr('readonly', false)
					.end().find('.row-input')
					.each( function( i, el ){
						var current_val = $(el).find('input').val(),
					    	current_select_id = $(el).find('.row-select.selected').attr('data-selectid'),
					    	restore_arr = [ current_val, current_select_id ];
					    	restore_arr.forEach(function( val ){
					    		if( val != undefined )
					    			$(el).attr('data-restore', val );
					    	});
					});

				$daddy.find('.row-select.selected').removeClass('selected').addClass('modified');
			});

			/* Cancel ugoing modifications */
			LJ.$body.on('click', '.row-select-daddy .icon-edit.active, .row-select-daddy .btn-cancel', function(){

				var $daddy = $(this).parents('.row-select-daddy');

				$daddy
					.removeClass('editing')
					.find('.icon-edit.active').removeClass('active')
					.end().find('input').attr('readonly',true)
					.end().find('.row-buttons').hide()
					.end().find('.modified').removeClass('modified')
					.end().find('[data-restore]')
					.each(function( i, el ){
						var val = $(el).attr('data-restore')
						$(el).find('input').val( val )
							 .end()
							 .find('[data-selectid="'+val+'"]').addClass('selected');						
					});

			});
			

			LJ.$body.on('click', '.row-pictures .icon-edit:not(.active)', function(){

				var $self = $(this);
				$self.addClass('active').parents('.row-pictures').addClass('editing');

				$('.row-pictures')
					.find('.picture-hashtag input').attr('readonly', false)
					.end().find('.row-buttons').velocity('transition.fadeIn',{ duration:600 })
					.end().find('.picture-edit, .row-pictures .row-buttons').velocity('transition.fadeIn',{ duration: 600 });

			});


			LJ.$body.on('mouseenter', ".row-pictures:not('.editing') .picture", function(){
				if( LJ.state.uploadingImage ) return;
				$(this)
				   .find('.picture-upload')
				   .velocity('stop')
				   .velocity('transition.fadeIn', { duration: 260 });
			});


			LJ.$body.on('mouseleave', ".row-pictures:not('.editing') .picture", function(){
				$(this)
				   .find('.picture-upload')
				   .velocity('stop')
				   .velocity('transition.fadeOut', { duration: 260 });
			});


			LJ.$body.on('click', '.row-pictures .icon-edit.active, .row-pictures .btn-cancel', function(){

				$('.row-pictures')
					.removeClass('editing')
					.find('.icon-edit.active').removeClass('active')
					.end().find('.selected').removeClass('selected')
					.end().find('.picture-hashtag input').attr('readonly',true)
					.end().find('.picture-edit').velocity('transition.fadeOut', { duration: 600 })
					.end().find('.row-buttons').hide();
				return;

			});

			LJ.$body.on('click', '.picture-edit i', function(){

				var $self = $(this);

				if( $self.hasClass('selected') )
					return $self.removeClass('selected');

				if( $self.hasClass('icon-main') ){
					$('.icon-main').removeClass('selected');
					$self.siblings('.icon-delete').removeClass('selected');
					$self.addClass('selected');
					return;
				}

				if( $self.hasClass('icon-delete') ){
					$self.siblings('.icon-main').removeClass('selected');
					$self.addClass('selected');
				}

			});


			LJ.$body.on('focusout', '.picture-hashtag input', function(){
				$(this).val( LJ.fn.hashtagify( $(this).val() ));
			});


			LJ.$body.on('click', '.row-pictures .btn-validate', function(){
				
				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				var updatedPictures  = [],
					$newMainPicture  = $('.icon-main.selected').parents('.picture'),
					$deletedPictures = $('.icon-trash-empty.selected').parents('.picture');
					$hashtagPictures = $('.picture');
					
					$deletedPictures.each(function( i, el ){
						var $el = $( el ),
							picture = { 
								img_place: $el.data('img_place'),
								action: "delete"
							};
							updatedPictures.push( picture );
					});

					$newMainPicture.each(function( i, el ){
						var $el = $( el ),
							picture = {
								img_place: $el.data('img_place'),
								action: "mainify"
							};
							updatedPictures.push( picture );
					});

					$hashtagPictures.each(function( i, el ){
						var new_hashtag = $('.picture[data-img_place="'+i+'"]').find('.picture-hashtag').find('input').val();
						var $el = $( el ),
							picture = {
								img_place: $el.data('img_place'),
								action: "hashtag",
								new_hashtag: LJ.fn.hashtagify( new_hashtag )
							};
							updatedPictures.push( picture );
					});

				if( updatedPictures.length == 0 ){
					return LJ.fn.toastMsg( LJ.text_source["to_noupload_necessary"][ LJ.app_language ], "error" );
				}

				LJ.fn.log('Emitting update pictures (all)');
				$self.addClass('btn-validating');

				var eventName = 'me/update-pictures',
					data = { userId: LJ.user._id, updatedPictures: updatedPictures },
					cb = {
						success: LJ.fn.handleUpdatePicturesSuccess,
						error: function( res ){
							LJ.fn.timeout( LJ.ui.artificialDelay, function(){
								LJ.fn.clearPendingState();
								LJ.fn.handleApiError( res );
							});
						}						
					};

				LJ.fn.showLoaders();
				LJ.fn.say( eventName, data, cb );

			});

		},
		setupCloudinary: function( cloudTags ){

			if( !cloudTags ){
				return LJ.fn.warn('No cloudinary tags (undefined), cant setup uploader', 1);
			}

			if( cloudTags.length == 0 ){
				return LJ.fn.warn('No cloudinary tags (length = 0), cant setup uploader', 1);
			}

			var $wrappers = $('.upload_form');

			if( $wrappers.length == 0 ){
				return LJ.fn.warn('No tags wrappers, cant setup uploader', 1);
			}

			$.cloudinary.config( LJ.cloudinary.uploadParams );
			//LJ.tpl.$placeholderImg = $.cloudinary.image( LJ.cloudinary.placeholder_id, LJ.cloudinary.displayParamsEventAsker );

			$wrappers.each(function(i,el){
				$(el).html('').append( cloudTags[i] );
			});

			$('.cloudinary-fileupload')

				.click( function(e){

					if( LJ.state.uploadingImage ){
						e.preventDefault();
						LJ.fn.toastMsg( LJ.text_source["to_upload_singlepic"][ LJ.app_language ], "info" );
						return;
					}

					LJ.state.uploadingimg_id      = $(this).parents('.picture').data('img_id');
					LJ.state.uploadingimg_version = $(this).parents('.picture').data('img_version');
					LJ.state.uploadingimg_place   = $(this).parents('.picture').data('img_place');
				})

				.bind('fileuploadstart', function(){

					LJ.state.uploadingImage = true;
					LJ.fn.showLoaders();

				})
				.bind('fileuploadprogress', function( e, data ){

  					$('.progress_bar').css('width', Math.round( (data.loaded * 100.0) / data.total ) + '%');

				}).bind('cloudinarydone',function( e, data ){

					LJ.state.uploadingImage = false;

					var img_id      = data.result.public_id;
					var img_version = data.result.version;
					var img_place   = LJ.state.uploadingimg_place;

                    var eventName = 'me/update-picture',
                    	data = {
	        				_id              : LJ.user._id,
							img_id           : img_id,
							img_version      : img_version,
							img_place        : img_place
								}
						, cb = {
							success: function( data ){
								LJ.fn.timeout( LJ.ui.artificialDelay, function(){
									$('.progress_bar').velocity('transition.slideUpOut', {
									 	duration: 400,
									 	complete: function(){
									 		$(this).css({ width: '0%' })
									 			   .velocity('transition.slideUpIn');
										} 
									});

									LJ.fn.toastMsg( LJ.text_source["to_upload_pic_success"][ LJ.app_language ], 'info');

									var user = data.user;

									// Mise à jour interne sinon plein d'update sur la même photo bug
									var pic = _.find( LJ.user.pictures, function(el){
										return el.img_place == img_place;
									});
									pic.img_version = img_version;
									var scope = pic.is_main ? ['profile','thumb'] : ['profile'];

	  								LJ.fn.replaceImage({
	  									img_id: img_id, 
	  									img_version: img_version,
	  									img_place: img_place,
	  									scope: scope
	  								});
	  								
	  							});
							},
							error: function( xhr ){
								LJ.fn.handleApiError( res );
							}
						};

						LJ.fn.showLoaders();
						// no_header : cloudinary wont let us add custom header
						LJ.fn.say( eventName, data, cb );

  				}).cloudinary_fileupload();
  				

		},
		fetchFacebookProfilePicturesAlbumId: function( callback, next_page ){

			LJ.fn.log('Fetching facebook profile picture album id...');

			var album_url = next_page || "/me?fields=albums{name,id}";
			var album_id  = null;

			LJ.fn.GraphAPI( album_url, function(res){

				if( !res.albums ){
					return callback( null, null );
				}

				var albums = res.albums.data;
				albums.forEach(function( album ){

					if( album.name == "Profile Pictures" ){
						album_id = album.id;
					}

				});

				if( !album_id && res.albums.paging && res.albums.paging.cursor && res.albums.paging.cursor.next ){

					var next = res.albums.paging.cursor.next;

					LJ.fn.log('Didnt find on first page, trying with next page : ' + next );
					return LJ.fn.fetchFacebookProfilePicturesAlbumId( callback, next );
				}

				if( !album_id && res.albums.paging && res.albums.paging.cursor && !res.albums.paging.cursor.next ){
					return callback('Couldnt find album id, no next page to browse', null );
				}

				LJ.fn.log('Album id found, ' + album_id );
				return callback( null, album_id );

			});


		},
		updateProfile2: function(){

			var _id 		  = LJ.user._id,
				$container    = $('.row-informations')
				name  		  = $container.find('.row-name input').val(),
				age   		  = $container.find('.row-age input').val(),
				job			  = $container.find('.row-job input').val(),
				drink 		  = $container.find('.drink.modified').attr('data-selectid'),
				mood          = $container.find('.mood.modified').attr('data-selectid');

			if( LJ.user.status == 'new' ){
				LJ.user.status = 'idle';
			}

			var profile = {
				userId		  : _id,
				age 		  : age,
				name 		  : name,
				job           : job,
				drink 		  : drink,
				mood          : mood,
				status        : LJ.user.status
			};
				LJ.fn.log('Emitting update profile');

			var eventName = 'me/update-profile',
				data = profile
				, cb = {
					success: LJ.fn.handleUpdateProfileSuccess,
					error: function( res ){
						LJ.fn.timeout( LJ.ui.artificialDelay, function(){
							LJ.fn.clearPendingState();
							LJ.fn.handleApiError( res );
						});
					}
				};

				LJ.fn.showLoaders();
				LJ.fn.say( eventName, data, cb );


		},
		handleUpdateProfileSuccess2: function( data ){

			LJ.fn.log('update profile success received, user is : \n' + JSON.stringify( data.user, null, 4 ) );
			var user = data.user;

			LJ.fn.timeout( LJ.ui.artificialDelay, function(){

				$('.row-informations').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				$('#thumbName').text( user.name );
				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-informations');
		
			});


		},
		displayPictureHashtags: function(){

        	for( var i = 0; i < LJ.user.pictures.length; i ++ ){
				var hashtag = LJ.user.pictures[i].hashtag;
				$('.picture').eq(i).find('picture__hashtag input').val(hashtag);        		
        	}


        },
        handleUpdatePicturesSuccess: function( data ){

	        setTimeout(function(){ 

				LJ.user.pictures = data.pictures;
				var currentimg_place = $('.main-picture').data('img_place');

				$('.row-pictures').find('.icon-edit').click();

				$('.btn-validating').removeClass('btn-validating');
				$('.icon.selected').removeClass('selected');

				/* Changement de la main picture et update du header associé */
				var mainImg = LJ.fn.findMainImage();
				if( currentimg_place != mainImg.img_place ){
					$('.main-picture').removeClass('main-picture');
					$('.picture[data-img_place="'+mainImg.img_place+'"]').addClass('main-picture');
					mainImg.scope = ['thumb'];
					LJ.fn.replaceImage( mainImg );
				}

				/* Mise à jour temps réelle des nouvelles photos */
				for( var i = 0; i < LJ.user.pictures.length; i++){
					LJ.user.pictures[i].scope = ['profile'];
					if( $('.picture[data-img_place="'+i+'"]').attr('data-img_version') != LJ.user.pictures[i].img_version )
					LJ.fn.replaceImage( LJ.user.pictures[i] );
				}

				/* Mise à jour des hashtags*/
				LJ.fn.displayPictureHashtags();

				LJ.fn.handleServerSuccess('Vos photos ont été mises à jour');
	        	
	        }, LJ.ui.artificialDelay );

        },
        /* Permet de remplacer les images du profile*/
		replaceImage: function( options ){

			var img_id      = options.img_id,
				img_version = options.img_version,
				img_place   = options.img_place,
				scope       = options.scope;

			if( !img_id || !img_version || !img_place || !scope ){
				// return LJ.fn.warn('missing parameter, cant replace image...');
			}

			if( scope.indexOf('profile') != -1 )
			{
				var $element = $('.picture').eq( img_place ),
					display_settings = LJ.cloudinary.profile.me.params;

				if( display_settings == undefined ){
					return console.error("Options d'affichage manquantes");
				}

				display_settings.version = img_version;

				/* En cas de photos identiques, prend celle la plus à gauche avec .first()*/
				var $previousImg = $element.find('img'),
					$newImg      = $.cloudinary.image( img_id, display_settings );

					$newImg.addClass('mainPicture').addClass('none');
					$previousImg.parent().prepend( $newImg )
								.find('.picture-upload').velocity('transition.fadeOut', { duration: 250 });
	 													
					$previousImg.velocity('transition.fadeOut', { 
						duration: 600,
						complete: function(){
							$newImg.velocity('transition.fadeIn', { duration: 700, complete: function(){} });
							$newImg.parent().attr('data-img_id', img_id );
							$newImg.parent().attr('data-img_version', img_version );
							$previousImg.remove();
						} 
					});
			}

			if( scope.indexOf('thumb') != -1 )
			{
				display_settings = LJ.cloudinary.displayParamsHeaderUser;
				display_settings.version = img_version;

				var previousImg = $('#thumbWrap').find('img'),
					newImg      = $.cloudinary.image( img_id, display_settings );
					newImg.addClass('none');

					$('#thumbWrap .imgWrap').prepend( newImg );

					previousImg.fadeOut(700, function(){
						$(this).remove();
						newImg.fadeIn(700);
					});
			}

		},
		updatePictureWithUrl: function( options, callback ){

			var eventName = 'me/update-picture-fb',
				data = options,
				cb = {
					success: function( data ){
						callback( null, data );
					},
					error: function( xhr ){
						callback( xhr, null );
					}
				};

			LJ.fn.showLoaders();
			LJ.fn.say( eventName, data, cb );

		},
		setLocalStoragePreferences: function(){


			var namespace  = 'preferences' ;
			var auto_login = LJ.user.app_preferences.ux.auto_login;

			if( auto_login == 'yes' ){

				var preferences = {
					facebook_id : LJ.user.facebook_id,
					long_lived_tk: LJ.user.facebook_access_token.long_lived,
					tk_valid_until: LJ.user.facebook_access_token.long_lived_valid_until
				};

				window.localStorage.setItem( namespace, JSON.stringify( preferences ));					
			}

			if( auto_login == 'no' ){
				window.localStorage.removeItem( namespace );
			}

		},
		handleFetchAndSyncFriends: function( data ){

			var friends = data.friends;

			// Check if user has new friends compared to what it has stored in db at connection
			var n_new_friends = friends.length - LJ.user.friends.length;	
			if( n_new_friends > 0 ){

                LJ.fn.insertNotification({
                    notification_id : "new_friends",
                    type            : "flash",
                    n_new_friends   : n_new_friends
                });

			}

			LJ.user.friends = friends;

			// Return now to not erase default html
			if( friends.length == 0 )
				return;
			

			var html = '';
			_.shuffle( friends ).forEach( function( friend ){
				html += LJ.fn.renderFriendInProfile( friend );
			});

			$('.row-friends').find('.row-body').html( html );

		}

	});