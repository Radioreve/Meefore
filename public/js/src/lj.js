
function sleep(ms,cb,p2){setTimeout(function(){cb(p2);},ms)}
function look(json){ return JSON.stringify(json, null, '\t'); }
window.csl = function(msg){
	delog(msg);
};

window.LJ.fn = _.merge( window.LJ.fn || {}, 

{

		init: function(o){

				if( o.debug )
					LJ.state.debug = true;
			
				// Landing page animation 
				this.initAppBoot();

				// Ajax setup 
				this.initAjaxSetup();				

				// Bind UI action with the proper handler 
				this.handleDomEvents();

				// Gif loader and placeholder 
				this.initStaticImages();

				// Global UI Settings ehanced UX
				this.initEhancements();

				// Init Pusher Connexion via public chan 
				this.initPusherConnection();

				// Augment lodash 
				this.initAugmentations();

				// Typeahead pluggin 
				this.initTypeahead();		


		},
		initTypeahead: function(){

			LJ.fn.initTypeaheadUsers();

		},
		initAugmentations: function(){

			/* La base! */
			_.mixin({
			    pluckMany: function() {
			        var array = arguments[0],
			            propertiesToPluck = _.rest(arguments, 1);
			        return _.map(array, function(item) {
			            return _.partial(_.pick, item).apply(null, propertiesToPluck);
			        });
				}
			});

		},
		initAjaxSetup: function(){

			$.ajaxSetup({
				error: function( xhr ){
					LJ.fn.handleServerError( xhr );
				},
				complete: function(){
					setTimeout( function(){
						LJ.fn.hideLoaders();
					}, LJ.ui.artificialDelay );
				}
			})

		},
		initPusherConnection: function(){

			LJ.pusher = new Pusher('9d9e7859b349d1abe8b2');

			LJ.pusher.connection.bind('state_change', function( states ) {
				csl('Pusher state is noww : ' + states.current );

				if( (states.current == 'connecting') && LJ.state.connected  )
				{
					LJ.fn.toastMsg("La connexion a été interrompue", 'success', true);
				}
				if( states.current == 'disconnected' )
				{
					LJ.fn.toastMsg("Vous avez été déconnecté.", 'error', true);
				}
				if( states.current == 'unavailable' )
				{
					LJ.fn.toastMsg("Le service n'est pas disponible actuellement, essayez de relancer l'application ", 'error', true);
				}
				if( states.current == 'connected' && LJ.state.connected )
				{
					LJ.fn.say('auth/app', { userId: LJ.user._id }, { success: LJ.fn.handleFetchUserAndConfigurationSuccess });

				}
			});

			LJ.pusher.connection.bind('connected', function() {
				csl('Pusher connexion is initialized');
			});

			LJ.pusher.connection.bind('disconnected', function(){
				alert('hey');
			});


		},
		initStaticImages: function(){

			LJ.$main_loader = $.cloudinary.image( LJ.cloudinary.loaders.main.id, LJ.cloudinary.loaders.main.params );
			LJ.$main_loader.appendTo( $('.loaderWrap') );

			LJ.$mobile_loader = $.cloudinary.image( LJ.cloudinary.loaders.mobile.id, LJ.cloudinary.loaders.mobile.params );
			LJ.$mobile_loader.appendTo( $('.m-loaderWrap'));

			LJ.$bar_loader = $.cloudinary.image( LJ.cloudinary.loaders.bar.id, LJ.cloudinary.loaders.bar.params );
			/* Dynamically cloned and appended */

			LJ.$spinner_loader = $.cloudinary.image( LJ.cloudinary.loaders.spinner.id, LJ.cloudinary.loaders.spinner.params );
			/* Dynamically cloned and appended */

			LJ.$curtain_loader = $.cloudinary.image( LJ.cloudinary.loaders.curtain.id, LJ.cloudinary.loaders.curtain.params );
			/* Dynamically cloned and appended */
			

		},
		initAppBoot: function(){

			var ls = window.localStorage;

			if( !ls || !ls.getItem('preferences') ){
				delog('No local data available, initializing lp...');
				return LJ.fn.initLandingPage();
			}

			preferences = JSON.parse( ls.getItem('preferences') );

			tk_valid_until = preferences.tk_valid_until;
			long_lived_tk  = preferences.long_lived_tk;

			if( !tk_valid_until || !long_lived_tk ){
				delog('Missing init preference param, initializing lp...');
				return LJ.fn.initLandingPage();
			}
			
			if( moment( new Date(tk_valid_until) ) < moment() ){
				delog('long lived tk found but has expired');
				return LJ.fn.initLandingPage();
			} 

			var current_tk_valid_until = moment( new Date(tk_valid_until) );
			var now  = moment();
			var diff = current_tk_valid_until.diff( now, 'd' );

			if( diff < 30 ) {
				delog('long lived tk found but will expire soon, refresh is needed');
				return LJ.fn.initLandingPage();
			}

			delog('Init data ok, auto logging in...');
			return LJ.fn.autoLogin();
				

		},
		fetchUserState: function(){
			$.ajax({
				method:'GET',
				url:'/api/v1/users/'+LJ.user.facebook_id,
				success: function( user ){
					delog('User state has been repaired');
					LJ.user = user;
				}, error: function( xhr ){
					delog('Unable to repaire user state!');
				}
			})
		},
		autoLogin: function(){

    		var $el = $('<div class="auto-login-msg super-centered none">Auto login <b>on</b></div>');
			$el.appendTo('.curtain').velocity('transition.fadeIn')
			setTimeout( function(){

			LJ.fn.GraphAPI('/me', function( facebookProfile ){
				delog( facebookProfile );
		  		LJ.fn.loginWithFacebook( facebookProfile );
  			});

			}, 400 );
		},
		initEhancements: function(){

			(function bindEnterKey(){ //Petite IIEF pour le phun

				//prevent double click pour UI reasons
				//$('body:not(input)').mousedown(function(e){ e.preventDefault(); });

				$('.profileInput, #description').on('change keypress',function(){
					$(this).addClass('modified');
				});

				LJ.$body.on('click', '.themeBtn:not(.static)',function(){
					$(this).addClass('validating-btn');
				});

				LJ.$body.on('focusout', '.askInMsgWrap input', function(e){
					if($(this).val().trim().length===0){
						$(this).removeClass('text-active').val('');}
					else{$(this).addClass('text-active');}
				}); 


            	$('body').on('click', '.filtersWrap .tag, .filtersWrap .loc, #createEventInputsWrap .tag', function(){ 
            		$(this).toggleClass('selected');
            	});

            	$('#createEventWrap .tag').click( function(){

            			$(this).toggleClass('selected');
            		 	if( $('#createEventWrap .selected').length > 3 ){
            				$(this).toggleClass('selected');
            				return LJ.fn.toastMsg("3 tags maximum", 'error' );
            		}       		
            	});


			})();
				
		},
		updateProfile: function(){

			var _id 		  = LJ.user._id,
				$container    = $('.row-informations')
				name  		  = $container.find('.row-name input').val(),
				age   		  = $container.find('.row-age input').val(),
				motto         = $container.find('.row-motto input').val(),
				job			  = $container.find('.row-job input').val(),
				drink 		  = $container.find('.drink.modified').attr('data-selectid'),
				mood          = $container.find('.mood.modified').attr('data-selectid');

			if( LJ.user.status == 'new' )
				LJ.user.status = 'idle';

			var profile = {
				userId		  : _id,
				age 		  : age,
				name 		  : name,
				motto   	  : motto,
				job           : job,
				drink 		  : drink,
				mood          : mood,
				status        : LJ.user.status
			};
				csl('Emitting update profile');

			var eventName = 'me/update-profile',
				data = profile
				, cb = {
					success: LJ.fn.handleUpdateProfileSuccess,
					error: function( xhr ){
						sleep( LJ.ui.artificialDelay, function(){
							LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
						});
					}
				};

				LJ.fn.say( eventName, data, cb );

		},
		handleUpdateProfileSuccess: function( data ){

			csl('update profile success received, user is : \n' + JSON.stringify( data.user, null, 4 ) );
			var user = data.user;

			sleep( LJ.ui.artificialDelay, function(){

				$('.row-informations').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				LJ.fn.updateClientSettings( user );
				$('#thumbName').text( user.name );
				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-informations');
		
			});

		},
		handleUpdateSettingsUxSuccess: function( data ){

			csl('update settings ux success received' );

			sleep( LJ.ui.artificialDelay, function(){

				$('.row-ux').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				LJ.user = data.user;

				LJ.fn.setLocalStoragePreferences();
				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-ux');
		
			});

		},
		handleUpdateSettingsMailingListsSuccess: function( data ){

			csl('update settings mailing lists success received' );

			sleep( LJ.ui.artificialDelay, function(){

				$('.row-notifications').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				LJ.user = data.user;

				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-notifications');
		
			});

		},
		setLocalStoragePreferences: function(){

			var auto_login = LJ.user.app_preferences.ux.auto_login;

			if( auto_login == 'yes' ){

				var preferences = {
					facebook_id : LJ.user.facebook_id,
					long_lived_tk: LJ.user.facebook_access_token.long_lived,
					tk_valid_until: LJ.user.facebook_access_token.long_lived_valid_until
				};

				window.localStorage.setItem('preferences', JSON.stringify( preferences ));					
			}

			if( auto_login == 'no' ){
				window.localStorage.removeItem('preferences');
			}


		},
		swapNodes: function( a, b ){

		    var aparent = a.parentNode;
		    var asibling = a.nextSibling === b ? a : a.nextSibling;
		    b.parentNode.insertBefore(a, b);
		    aparent.insertBefore(b, asibling);

		},
		loginWithFacebook: function( facebookProfile ){

				delog('logging in with facebook...');
				$.ajax({

					method:'POST',
					data: { facebook_id: facebookProfile.id, facebookProfile: facebookProfile },
					dataType:'json',
					url:'/auth/facebook',
					success: function( data ){
						LJ.fn.handleSuccessLogin( data );
					},
					error: function( err ){
						LJ.fn.handleServerError( err )
					}
				});

		},
		handleSuccessLogin: function( data ){

			delog('Handling success login with fb');
			LJ.user._id = data.id; 
			LJ.accessToken = data.accessToken; 
			//document.cookie = 'token='+data.accessToken;

			LJ.fn.say('auth/app', {}, {
				beforeSend: function(){ delog('Fetching user and configuration'); },
				success: LJ.fn.handleFetchUserAndConfigurationSuccess 
			});

		},
		fetchAndSyncFriends: function( callback ){

			LJ.fn.GraphAPI('/me/friends', function( res ){

				var fb_friends = res.data;

				var fb_friends_ids = _.pluck( res.data, 'id' );
				var data = { userId: LJ.user._id, fb_friends_ids: fb_friends_ids };

				$.ajax({
					method:'post',
					url:'/me/fetch-and-sync-friends',
					data: data,
					success: function( data ){
						callback( null, data );
					},
					error: function( xhr ){
						callback( JSON.parse( xhr ).responseText, null);
					}
				});

			});

		},
		displayViewAsFrozen: function(){

			$('.eventItemWrap').remove();
			LJ.myEvents = [];

			$('.eventsHeader, #noEvents').velocity('transition.slideUpOut', 
				{ 
				  duration: 400,
				  complete: function(){
				  	$('#frozenTimezone').velocity('transition.slideLeftIn', { duration: 700 });
				}
			});

		},
		displayViewAsNormal: function(){

			$('.eventItemWrap').remove();
			LJ.myEvents = [];
			
			$('#frozenTimezone').velocity('transition.slideRightOut', 
				{ 
				  duration: 400,
				  complete: function(){
				  	$('.eventsHeader, #no').velocity('transition.slideUpIn', { duration: 700 });
					LJ.fn.displayEvents();
				}
			});

		},
		randomInt: function(low, high) {
    		return Math.floor(Math.random() * (high - low + 1) + low);
		},
		displayContent: function( content, options ){
			
				options = options || {};

			if( !options.mode ){
				
				var prev = options.prev;			
				var $prev = $('.'+options.prev);

				$prev.velocity( options.myWayOut || 'transition.fadeOut', {
					duration: options.duration || 0 || 400,
					complete: function(){
						$prev.removeClass( prev );
						$(content).addClass( prev )
							   .velocity( options.myWayIn || 'transition.fadeIn', {
							   	duration: 0 || 800,
							   	display:'block',
							   	complete: function(){
							   		LJ.state.animatingContent = false;
							   		if(LJ.user.status === 'new'){
							   			//LJ.fn.toggleOverlay('high', LJ.tpl.charte );
							   		}
							   		options.after_cb && options.after_cb();
							   		LJ.fn.adjustAllInputsWidth( content );

							   	}
							   });
					}
				});
			}


			if( options.mode == 'curtain' ) {

				var prev = options.prev;			
				var $prev = $('.'+options.prev);
				
				var behindTheScene = function(){

					options.during_cb();
					$prev.removeClass( prev );
					$(content).addClass( prev )
						   .show()
						   .css({'display':'block'});

				};

				var afterTheScene = function(){
					options.after_cb();
				}

				LJ.fn.displayCurtain({
					behindTheScene: behindTheScene,
					afterTheScene : afterTheScene
				})
				
			} 


		},
		displayCurtain: function( opts ){

			var behindTheScene = opts.behindTheScene || function(){ delog('Behind the scene'); },
				afterTheScene  = opts.afterTheScene   || function(){ delog('after the scene');  },
				delay          = opts.delay    || 500,
				duration       = opts.duration || 800;

			var $curtain = $('.curtain');

			if( $curtain.css('opacity') != '0' || $curtain.css('display') != 'none' ){
				var init_duration = 10;
			}

				$curtain
				.velocity('transition.fadeIn',
				{ 
					duration: init_duration || duration, //simuler l'ouverture instantanée
				  	complete: behindTheScene 
				})
				.delay( delay )
				.velocity('transition.fadeOut',
				{	
					display : 'none',
					duration: duration,
					complete: afterTheScene
				});
		

		},
		updateClientSettings: function( newSettings ){

			_.keys(newSettings).forEach(function(el){
				LJ.user[el] = newSettings[el];
			});
		},
		toastMsg: function( msg, status, fixed ){

			var toastStatus, toast, tpl;

			if( status == 'error' ){
				    toastStatus = '.toastError',
					tpl = LJ.tpl.toastError;
			}
			if( status == 'info' ){
				    toastStatus = '.toastInfo',
					tpl = LJ.tpl.toastInfo;
			}
			if( status == 'success'){
				    toastStatus = '.toastSuccess',
					tpl = LJ.tpl.toastSuccess;
			}

			if( $( '.toast' ).length === 0 )
			{
				$( tpl ).prependTo('#mainWrap');

				    toast = $( toastStatus );
					toastMsg = toast.find('.toastMsg');
					toastMsg.text( msg );

					toast.velocity('transition.slideDownIn', {
						duration: 600,
						complete: function(){

						  if( typeof(fixed) == 'string' )
						  	return

							toast.velocity('transition.slideUpOut', {
								duration:300,
								delay: fixed || 2000,
								complete: function(){
									toast.remove();
									if( LJ.msgQueue.length != 0 )
										LJ.fn.toastMsg( LJ.msgQueue[0].msg, LJ.msgQueue[0].type );
									    LJ.msgQueue.splice( 0, 1 ) //remove le premier élément
								}
								});						
						  }
					});
			}
			else
			{
				LJ.msgQueue.push({ msg: msg, type: status });
			}
		},
		/* Permet de remplacer les images du profile, ou du thumbWrap uniquement */
		replaceImage: function( options ){

			var img_id      = options.img_id,
				img_version = options.img_version,
				img_place   = options.img_place,
				scope      = options.scope;

			if( scope.indexOf('profile') != -1 )
			{
				var $element = $('.picture').eq( img_place ),
					display_settings = LJ.cloudinary.profile.me.params;

				if( display_settings == undefined )
					return LJ.fn.toastMsg("Options d'affichage manquantes", "error");

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
		replaceThumbImage: function( id, version, d ){

			    d = d || LJ.cloudinary.displayParamsHeaderUser;
				d.version = version;

			var previousImg = $('#thumbWrap').find('img'),
				newImg      = $.cloudinary.image(id,d);
				newImg.addClass('none');

				$('#thumbWrap .imgWrap').prepend( newImg );

				previousImg.fadeOut(700, function(){
					$(this).remove();
					newImg.fadeIn(700);
				});
		},
		initCloudinary: function( cloudTags ){

			$.cloudinary.config( LJ.cloudinary.uploadParams );
			//LJ.tpl.$placeholderImg = $.cloudinary.image( LJ.cloudinary.placeholder_id, LJ.cloudinary.displayParamsEventAsker );

			if( cloudTags.length != $('.upload_form').length )
				return LJ.fn.toastMsg('Inconsistence data', 'error');

			$('.upload_form').each(function(i,el){
				$(el).html('').append( cloudTags[i] );
			});

			$('.cloudinary-fileupload')

				.click( function(e){

					if( LJ.state.uploadingImage ){
						e.preventDefault();
						LJ.fn.toastMsg("N'uploadez qu'une seule image à la fois!","info");
						return;
					}

					LJ.state.uploadingimg_id = $(this).parents('.picture').data('img_id');
					LJ.state.uploadingimg_version = $(this).parents('.picture').data('img_version');
					LJ.state.uploadingimg_place = $(this).parents('.picture').data('img_place');
				})

				.bind('fileuploadstart', function(){

					LJ.state.uploadingImage = true;
					LJ.fn.showLoaders();

				})
				.bind('fileuploadprogress', function( e, data ){

  					$('.progress_bar').css('width', Math.round( (data.loaded * 100.0) / data.total ) + '%');

				}).bind('cloudinarydone',function( e, data ){

					LJ.state.uploadingImage = false;

					var img_id      		= data.result.public_id;
					var img_version 		= data.result.version;
					var img_place   		= LJ.state.uploadingimg_place;;

                    var eventName = 'me/update-picture',
                    	data = {
                    				_id             : LJ.user._id,
									img_id           : img_id,
									img_version      : img_version,
									img_place        : img_place
								}
						, cb = {
							beforeSend: function(){ },
							success: function( data ){
								sleep( LJ.ui.artificialDelay, function(){
									$('.progress_bar').velocity('transition.slideUpOut', {
									 	duration: 400,
									 	complete: function(){
									 		$(this).css({ width: '0%' })
									 			   .velocity('transition.slideUpIn');
										} 
									});

									LJ.fn.toastMsg('Votre photo a été modifiée', 'info');

									var user = data.user;
									//LJ.fn.updateClientSettings( user );

									// Mise à jour interne sinon plein d'update sur la même photo bug
									var pic = _.find( LJ.user.pictures, function(el){
										return el.img_place == img_place;
									});
									pic.img_version = img_version;
									var scope = pic.is_main ? ['profile','thumb'] : ['profile'];

	  								LJ.fn.replaceImage( {
	  									img_id: img_id, 
	  									img_version: img_version,
	  									img_place: img_place,
	  									scope: scope
	  								});
	  								
	  							});
							},
							error: function( xhr ){
								delog('Error saving image identifiers to the base');
							}
						};

						LJ.fn.say( eventName, data, cb );

  				}).cloudinary_fileupload();
  				
		},
		refreshOnlineUsers: function(){

			var i=0;
			for( ; i<LJ.myOnlineUsers.length; i++ )
			{
				LJ.fn.displayAsOnline( { userId: LJ.myOnlineUsers[i] } );
			}

		},
		refreshArrowDisplay: function(){

			var $arrLeft  = $('#manageEventsWrap i.next-left'),
				$arrRight = $('#manageEventsWrap i.next-right');

			$arrLeft.removeClass('none');
			$arrRight.removeClass('none');

			if( ($('.a-item').length === 0) ||  ($('.a-item').length == 1) ){
				$arrLeft.addClass('none');
				$arrRight.addClass('none');
				return;
			}

			if( $('.a-item.active').is( $('.a-item').last() ) ){
				$arrRight.addClass('none');
				return;
			}

			if( $('.a-item.active').next().hasClass('placeholder') ){
				$arrRight.addClass('none');
				return;
			}

			if( $('.a-item.active').is( $('.a-item').first() ) ){
				$arrLeft.addClass('none');
				return;
			}

		},
		displayAskerItem: function( current, next, askerId ){

			var currentIndex = current.index(),
				nextIndex    = next.index();

			var $askerThumb = $('#askersThumbs').find('.imgWrapThumb[data-userid="'+askerId+'"]');
				$('.imgWrapThumb.active').removeClass('active');
				$askerThumb.addClass('active');

				LJ.state.animatingContent = false;

			if( currentIndex < nextIndex )
			{
				current.velocity('transition.slideLeftOut', 
					{ 
						duration: 200,
						complete: function(){ 
							current.removeClass('active');
							next.addClass('active');
							LJ.fn.refreshArrowDisplay();
							next.velocity('transition.slideRightIn', { 
									duration: 500,
									complete: function(){
									} 
								});
						}
					});
				return;
			}
			if( currentIndex > nextIndex )
			{
				current.velocity('transition.slideRightOut', 
					{ 
						duration: 200,
						complete: function(){ 
							current.removeClass('active');
							next.addClass('active');
							LJ.fn.refreshArrowDisplay();
							next.velocity('transition.slideLeftIn', { 
									duration: 500,
									complete: function(){
									} 
								});
						}
					});
				return;
			}		
				
		},
		findMainImage: function( user ){

			var user = user || LJ.user ;
			var index = _.findIndex( user.pictures, function( el ){
				return el.is_main == true;
			});

			return user.pictures[ index ];

		},
        initLayout: function( settings ){

//setTimeout(function(){ $('.btn-create-event').click(); }, 1700 );

        	/* Mise à jour dynamique des filters */
        	$('.mood-wrap').html( LJ.fn.renderMoodInProfile( LJ.settings.app.mood ));
        	$('.drink-wrap').html( LJ.fn.renderDrinkInProfile( LJ.settings.app.drink ));
        	$('#no').html('').append( LJ.tpl.noResults );


    		/* Profile View */
			//$('.row-subheader').find('span').text( LJ.user._id );
			$('.row-name').find('input').val( LJ.user.name );
			$('.row-age').find('input').val( LJ.user.age );
			$('.row-motto').find('input').val( LJ.user.motto );
			$('.row-job').find('input').val( LJ.user.job );
			$('.drink[data-selectid="'+LJ.user.drink+'"]').addClass('selected');
			$('.mood[data-selectid="'+LJ.user.mood+'"]').addClass('selected');

			/* Settings View */
			_.keys( LJ.user.app_preferences ).forEach( function( key ){
				_.keys( LJ.user.app_preferences[ key ] ).forEach( function( sub_key ){
					var value = LJ.user.app_preferences[ key ][ sub_key ];
					$('.row-select.' + sub_key + '[data-selectid="'+value+'"]').addClass('selected');
				});
			});


			/* Mise à jour des images placeholders */
			$('.picture-wrap').html( LJ.fn.renderProfilePicturesWraps );
			var $placeholder = $.cloudinary.image( LJ.cloudinary.placeholder.id, LJ.cloudinary.placeholder.params );
				$('.picture').prepend( $placeholder );

			/* Update de toutes les images */
			for( var i = 0; i < LJ.user.pictures.length; i++){
				LJ.user.pictures[i].scope = ['profile'];
				LJ.fn.replaceImage( LJ.user.pictures[i] );
			}

			LJ.fn.displayPictureHashtags();

			/* ThumbHeader View */
			LJ.$thumbWrap.find( 'h2#thumbName' ).text( LJ.user.name );
			var d = LJ.cloudinary.displayParamsHeaderUser;

			var mainImg = LJ.fn.findMainImage();
				d.version = mainImg.img_version;

			var imgTag = $.cloudinary.image( mainImg.img_id, d );
				imgTag.addClass('left');

			LJ.$thumbWrap.find('.imgWrap').html('').append( imgTag );

			/* Settings View */
			$('#newsletter').prop( 'checked', LJ.user.newsletter );
			$('#currentEmail').val( LJ.user.email );


        	/* Initialisation du friendspanel */
        	$('#friendsWrap').jScrollPane();
        	LJ.state.jspAPI['#friendsWrap'] = $('#friendsWrap').data('jsp');

    		/* L'user était déjà connecté */
			if( LJ.state.connected )
				return LJ.fn.toastMsg('Vous avez été reconnecté', 'success');
				
			LJ.state.connected = true;

			$('.menu-item-active').removeClass('menu-item-active');

			var $landingView;
			if( LJ.user.status == 'idle' ){
				$landingView = '#eventsWrap';
				$('#management').addClass('filtered');
	            $('#events').addClass('menu-item-active')
	            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });
			}

			if( LJ.user.status == 'hosting' ){
				$landingView = '#manageEventsWrap';
				$('#create').addClass('filtered');
	            $('#management').addClass('menu-item-active')
	            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });
	            LJ.fn.fetchAskers();
			}

			if( LJ.user.status == 'new' ){
				$landingView = '#profileWrap';
				$('#management').addClass('filtered');
	            $('#profile').addClass('menu-item-active')
	            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

			}
			function during_cb(){	

				/* Landing Page View */				
				$('#facebook_connect').remove();
				$('#logo-hero').remove();
        		$('.hero-img').remove();
				$('#landingWrap').remove();
				$('body > header').removeClass('none');
				$('body').css({'background':'none'});
        		$('#mainWrap').css({'background':'url(/img/crossword.png)'});	
        		$('.auto-login-msg').velocity('transition.fadeOut');

			};		

			function after_cb(){

				$('#thumbWrap').velocity('transition.slideUpIn',{duration:1000});
				$('.menu-item').velocity({ opacity: [1, 0] }, {
					display:'inline-block',
					duration: 800,
					complete: function(){

						$('.menu-item').each( function( i, el ){
							$(el).append('<span class="bubble filtered"></span>')
						});

						if( LJ.user.status == 'new' )
							LJ.fn.initTour();

						if( LJ.user.friends.length == 0 )
					 		LJ.fn.toastMsg("Aucun de vos amis Facebook n'est sur meefore. Invitez-en !","info");
				
					}
				});
			};

            LJ.fn.displayContent( $landingView, {
            	 during_cb: during_cb,
            	 after_cb: after_cb,
            	 mode:'curtain',
            	 myWayIn: 'transition.slideDownIn',
            	 myWayOut: 'transition.slideUpOut',
            	 prev:'revealed'
            });

        },
        handleServerSuccess: function( msg, selector ){

        	setTimeout( function(){ 

		        if( msg )
		        	LJ.fn.toastMsg( msg, 'info');

		        var $container = $(selector);
		        $container.find('.selected').removeClass('selected')
				$container.find('.modified').removeClass('modified').addClass('selected')
				$container.find('.validating').removeClass('validating')
				$container.find('.validating-btn').removeClass('validating-btn')
				$container.find('.asking').removeClass('asking')
				$container.find('.pending').removeClass('pending');

        	}, LJ.ui.artificialDelay );

        },
        handleServerError: function( msg, ms ){

        	if( typeof(msg) != 'string' )
        		msg = JSON.parse( msg.responseText ).msg;

        	if( typeof(msg) != 'string' )
        		return LJ.fn.toastMsg('Erreur interne','error');

        	var ms = ms || 500;
        	setTimeout( function(){ 
        	
        	LJ.fn.toastMsg( msg, 'error');
        				$('.validating').removeClass('validating');
						$('.btn-validating').removeClass('btn-validating');
						$('.asking').removeClass('asking');
						$('.pending').removeClass('pending');

			}, ms );

        },
		initSocketEventListeners: function(){
			
				//LJ.fn.on('fetch user success', function( data ){ delog(data); });


				LJ.fn.on('send contact email success', function(){

					sleep( LJ.ui.artificialDelay, function(){
						LJ.fn.toastMsg( "Merci beaucoup!", 'info');
						$('.validating-btn').removeClass('validating-btn');
					});

				});

				LJ.fn.on('server error', function( data ){

					var msg   = data.msg,
						flash = data.flash;

					csl('Receiving error from the server');

					if( flash ){
						return LJ.fn.handleServerError( msg );
					}
					sleep( LJ.ui.artificialDelay, function(){
						LJ.fn.handleServerError( msg );
					});
				});

                
		},
		handleResetEvents: function(){

					LJ.fn.toastMsg('Les évènements sont maintenant terminés!', 'info');
					LJ.fn.displayEvents();
					if( LJ.user.status == 'hosting') LJ.fn.handleCancelEvent( { hostId: LJ.user._id });
		},
		handleRestartEvents: function(){
					
					LJ.fn.toastMsg('Les évènements sont à présent ouverts!', 'info');
					LJ.fn.displayEvents();
		},
		handleCancelEvent: function( data ){
			
			if( data.hostId == LJ.user._id )
			{
      	$('.pending').removeClass('pending');
    		LJ.user.status = 'idle';
    		LJ.myAskers = [];
    		LJ.$manageEventsWrap.find('#askersThumbs, #askersMain').html('');
    		LJ.fn.displayMenuStatus( function(){ $('#create').click(); } );
				
			}	  		
		                	 
    	var canceledEvent = LJ.$eventsListWrap.find('.eventItemWrap[data-hostid="'+data.hostId+'"]');
  		canceledEvent.velocity("transition.slideRightOut", {
  			complete: function(){
  				canceledEvent.remove();
  				if( $('.eventItemWrap').length == 0 ) LJ.fn.displayEvents();
  			}
  		});

	  	_.remove( LJ.myEvents, function(el){
	  		return el.hostId == data.hostId; 
	  	});


		},
		handleRequestParticipationInSuccess: function( data ){

			delog('Handling request participation in success');

			var hostId  	  = data.hostId,
				  userId 		  = data.userId,
				  eventId 	  = data.eventId,
				  requesterId = data.requesterId,
				  asker   	  = data.asker,
				  alreadyIn   = data.alreadyIn || false;	

					/* L'ordre de l'appel est important, car certaines 
					/* informations sont cachées par les premières 
					/* et utilisées par celles d'après 
					*/
			sleep( LJ.ui.artificialDelay, function(){
				
				if( alreadyIn ) {
					LJ.fn.toastMsg('Votre ami s\'est ajouté à l\évènement entre temps', 'info');
					var button = '<button class="themeBtn onHold">'
			                      + '<i class="icon icon-ok-1"></i>'
			                      +'</button>';
			            $('.f-item[data-userid="'+userId+'"]').find('button').replaceWith( button );
					return;
				}

					
					/* Demande pour soi-même */
					if( LJ.user._id == requesterId && LJ.user._id == userId )
					{
						LJ.user.asked_events.push( eventId );
						LJ.fn.toastMsg('Votre demande a été envoyée', 'info');
						 $('.asking').removeClass('asking').removeClass('idle').addClass('asked').text('En attente')
								  .siblings('.chatIconWrap, .friendAddIconWrap').velocity('transition.fadeIn');
					}

					/* Demande de la part de quelqu'un d'autre */
					if( LJ.user._id != requesterId && LJ.user._id == userId )
					{	
						LJ.fn.bubbleUp( '#events' )
						LJ.fn.toastMsg('Un ami vous a ajouté à une soirée', 'info');
						$('.eventItemWrap[data-eventid="'+eventId+'"]').find('.askIn')
						          .removeClass('asking').removeClass('idle').addClass('asked').text('En attente')
								  .siblings('.chatIconWrap, .friendAddIconWrap').velocity('transition.fadeIn');
					}

					/* Demande pour quelqu'un d'autre */
					if( LJ.user._id == requesterId && LJ.user._id != userId )
					{

						LJ.fn.toastMsg('Votre ami a été ajouté', 'info');
						var button = '<button class="themeBtn onHold">'
			                      + '<i class="icon icon-ok-1"></i>'
			                      +'</button>';
			            $('.f-item[data-userid="'+userId+'"]').find('button').replaceWith( button );
					}

				/* Pour l'host */
				if( LJ.user._id == hostId )
				{

					LJ.fn.bubbleUp( '#management' )
					LJ.myAskers.push( asker );

					var askerMainHTML  = LJ.fn.renderAskerMain( asker ),
						askerThumbHTML = LJ.fn.renderUserThumb ({ user: asker });

					    $( askerMainHTML ).appendTo( $('#askersMain') ).hide();
					    $( askerThumbHTML ).appendTo( $('#askersThumbs') );

						if( $('.a-item').length == 1 )
						{
							$('#manageEventsWrap .a-item, #manageEventsWrap .imgWrapThumb')
							.addClass('active')
							.velocity('transition.fadeIn',{
							 duration: 300,
							 display:'inline-block'
							 });
						}

					    LJ.fn.refreshArrowDisplay();
					    LJ.fn.displayAsOnline( requesterId );
				}	

			});

		},
		handleRequestParticipationOutSuccess: function( data ){

			delog( data.asker.name +' asked out' );

				var userId  	= data.userId,
					hostId  	= data.hostId,
					eventId 	= data.eventId,
					asker   	= data.asker,
					requesterId = data.requesterId;

				var $aItemMain = LJ.$askersListWrap.find('.a-item[data-userid="'+userId+'"]'),
				    $chatWrapAsUser = LJ.$eventsListWrap.find('.chatWrap[data-chatid="'+hostId+'"]');

				_.remove( LJ.myAskers, function( asker ){
					return asker._id === data.userId;
				});

				_.remove( LJ.user.asked_events, function( el ){
					return el == eventId;
				});

				sleep( LJ.ui.artificialDelay, function(){

					/* Pour l'Host */
					if( hostId === LJ.user._id)
					{		
							$('.imgWrapThumb[data-userid="' + asker._id + '"]').remove();
							LJ.state.jspAPI[ asker._id ] = undefined; // sinon chat fail lorsqu'ask in/out/in...
							$aItemMain.velocity("transition.fadeOut", { 
								duration: 200,
								complete: function(){
									$aItemMain.remove();
									if( !$aItemMain.hasClass('active') ) return LJ.fn.refreshArrowDisplay();
									$('.imgWrapThumb').first().addClass('active');
									$('.a-item').first().addClass('active').velocity('transition.fadeIn', 
										{ 
											duration: 300,
											complete: function(){

												LJ.fn.refreshArrowDisplay();
										}})
								} 
							});
					}
					if( requesterId == userId && LJ.user._id == userId )
					{
						
						LJ.fn.toggleChatWrapEvents( $chatWrapAsUser.find('.chatIconWrap') );
						LJ.fn.toastMsg('Vous avez été désinscris de la liste', 'info');
						$('.asking').removeClass('asked').removeClass('asking').addClass('idle').text('Je veux y aller!')
								.siblings('.chatIconWrap, .friendAddIconWrap').hide();
					}	

					
					/*
					var $nbAskers = $('.eventItemWrap[data-eventid="'+eventId+'"]').find('.e-guests span.nbAskers');
						$nbAskers.text( parseInt( $nbAskers.text() ) - 1 );

					$('.eventItemWrap[data-eventid="'+eventId+'"]').find('.askedInWrap')
																   .find('img[data-userid="'+asker._id+'"]')
																   .remove();  */
				});

		},
		handleFetchUserAndConfigurationSuccess: function( data ){

			/* L'ordre de l'appel est important, car certaines 
			/* informations sont cachées par les premières 
			/* et utilsiées par celles d'après 

					- On cache les informations sur l'user 
					- On fait les mises à jours du DOM (checkbox, thumbPic, input) à partir du cache
					- On envoie une demande des derniers évènements / utilisateurs / amis
					- On envoie une demande pour rejoindre les chatrooms en cours
					- On active le pluggin d'upload de photos
					- On génère le HTML dynamique à partir de données server ( Tags... )
			*/
			delog('Fetching user and config success');

			var user 	 = data.user,
				settings = data.settings;
			
			LJ.myOnlineUsers = data.onlineUsers;

			LJ.user = user;
			LJ.settings = settings;

			LJ.fn.subscribeToChannels();
			LJ.fn.initChannelListeners();
			
			LJ.fn.initLayout( settings );
			LJ.fn.setLocalStoragePreferences();
			LJ.fn.initCloudinary( data.cloudinary_tags );

			
			LJ.fn.fetchEvents(function( err, data ){

				if( err )
					return console.log('Error fetching and sync friends : ' + err );

				console.log('Events successfully fetched ! ( n = ' + data.length + ' )');

				var event_arr_html = [];
				data.forEach(function( e ){
					event_arr_html.push( LJ.fn.renderEvent( e ) );
				});

				$('.row-events.row-body').html( event_arr_html );


			}); 

			/* Update friends based on facebook activity on each connection */
			LJ.fn.fetchAndSyncFriends(function( err, data ){

				if( err )
					return console.error('Error fetching and sync friends : ' + err );

				var friends = data.friends;
				LJ.user.friends = friends;

				if( friends.length == 0 )
					return; 

				var html = '';
				friends.forEach( function( friend ){
					html += LJ.fn.renderFriendInProfile( friend );
				});
				$('.row-friends').find('.row-body').html( html );

			});
	
			/* Admin scripts. Every com is secured serverside */	
			if( LJ.user.access.indexOf('admin') != -1 )
				LJ.fn.initAdminMode();
			
		},
		displayInModal: function( options ){

			var options = options || {};

			var call_started = new Date();
			LJ.fn.displayModal();

			var eventName = 'display-content';

			$('.modal-container').css({ width: options.starting_width });
			$('.modal-container').on( eventName, function( e, data ){

				var content = data.html_data;
				var starts_in = LJ.ui.minimum_loading_time - ( new Date() - call_started )
				setTimeout(function(){
					
					var $content = $(content);

					options.custom_classes && options.custom_classes.forEach( function( class_itm ){
						$content.addClass( class_itm );
					});

					options.custom_data && options.custom_data.forEach(function( el ){
						$content.attr('data-'+el.key, el.val );
					}); 

					$('.curtain-loader').velocity('transition.fadeOut', { duration: 300 });
					$content.hide().appendTo('.modal-container-body');

					$content.waitForImages(function(){

						var old_height = $('.modal-container').innerHeight(),
							new_height = old_height + $('.modal-container-body > div').innerHeight() + ( options.fix_height || 0 );

						var old_width = options.starting_width,
							new_width = old_width + $('.modal-container-body > div').innerWidth();

						var duration = new_height > 400 ? 450 : 300;

						$('.modal-container')
							.velocity({ height: [ new_height, old_height ], width: [ new_width, old_width ] }, { 
									duration: duration,
									complete: function(){
										$content.css({'display':'block','opacity':'0'});
										options.predisplay_cb && options.predisplay_cb();
										$content.velocity('transition.fadeIn');
									} 
							});
					});


				}, starts_in );

			});

			if( options.source === 'server' )
			{
				$.ajax({
					method:'GET',
					url: options.url,
					success: function( data ){
						var html_data = options.render_cb( data );
						$('.modal-container').trigger( eventName, [{ html_data: html_data }]);
					},
					error: function(){
						var html_data = options.error_cb();
						$('.modal-container').trigger( eventName, [{ html_data: html_data }]);
					},
					complete: function(){
						$('.modal-container').unbind( eventName );
					}
				});
			}

			if( options.source === 'facebook' )
			{	
				LJ.fn.GraphAPI( options.url, function(res){

					if( !res && !res.data ) {
						console.log('Error, cannot display photos from fb')
						console.log(res);
						var html_data = options.error_cb();
					} else {
						var html_data = options.render_cb( res.data );
					}
					
					$('.modal-container').trigger( eventName, [{ html_data: html_data }]);
					$('.modal-container').unbind( eventName );

				});
			}

			if( options.source === 'local' )
			{
				setTimeout( function(){

					var html_data = options.render_cb();
					$('.modal-container').trigger( eventName, [{ html_data: html_data }]);
					$('.modal-container').unbind( eventName );

				}, 1000 );
			}

		},
		GraphAPI: function( url, callback, opts ){

			var ls = window.localStorage;

			var access_token = ( LJ.user.facebook_access_token && LJ.user.facebook_access_token.long_lived ) 
							|| ( ls.preferences && JSON.parse( ls.preferences ).long_lived_tk );
			FB.api( url, { access_token: access_token }, callback );

		},
		displayUserProfile: function( facebook_id ){
			LJ.fn.displayInModal({ 
				url: '/api/v1/users/' + facebook_id,
				source: 'server',
				starting_width: 300,
				render_cb: LJ.fn.renderUserProfileInCurtain,
				error_cb: LJ.fn.renderUserProfileInCurtainNone
			});
			
		},
		displayModal: function( callback ){
			
			$('.curtain')
				.css({'display':'block'})
				.velocity({ 'opacity': [0.4,0] });

			$('.modal-container')
				.find('.modal-container-body').html( LJ.$curtain_loader ).end()
				.css({'display':'block'})
				.velocity({ 'opacity': [1,0] });

			$('.curtain-loader').velocity('transition.fadeIn', { delay: 200, duration: 300});

		},
		hideModal: function(){

			$('.curtain')
				.velocity({ 'opacity': [0,0.4] }, { complete: function(){
					$('.curtain').css({ display: 'none' }); }
			});

			$('.modal-container')
				.velocity({ 'opacity': [0,1] }, { complete: function(){
					$('.modal-container').css({ display: 'none', height: 'auto', width: 'auto' });
					$(".modal-container-body *:not('.curtain-loader')").remove(); }
			});

			$('.curtain-loader').hide();

		},
		initLadder: function( options ){

			if( typeof( options ) != "object" )
				return delog('Param error, object needed');

			var max_level  = options.max_level,
				base_point = options.base_point,
				coef_point = options.coef_point;

			if( !max_level || !base_point || !coef_point )
				return delog('Param error, missing key');

			var skill_ladder = [];
			for( var i = 1; i <= max_level; i++ ){
				var item = {}
				item.level = i;
				item.min_xp = ( i * base_point ) + Math.pow( base_coef, i-1 ); 
				item.max_xp = ( i * base_point ) + Math.pow( base_coef, i   )
				skill_ladder.push( item );
			}
			return skill_ladder;

		},
		findUserLevel: function(){

			return _.find( LJ.settings.skill_ladder, function(el){ 
				return ( el.min_xp < LJ.user.skill.xp && el.max_xp > LJ.user.skill.xp ) 
			}).level

		},
		setUserXp: function( new_xp ){

			LJ.user.skill.xp = new_xp;
			$('body').trigger('change-user-xp');

		},
		updateUserXp: function(){

			var user_level = LJ.fn.findUserLevel(),
				user_xp = LJ.user.skill.xp,
				ladder_level = LJ.settings.skill_ladder[ user_level - 1 ],
				xp_range = ladder_level.max_xp - ladder_level.min_xp;

			$('.xp-amount').html( user_xp );
			$('.xp-fill').css({ width: ( user_xp - ladder_level.min_xp ) * 100 / xp_range +'%'});

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

			LJ.fn.say( eventName, data, cb );

		},
		handleSuspendEvent: function(data, state){

			var eventId = data.eventId;

			if( data.hostId == LJ.user._id ){

				var $li = $('#suspendEvent');
				$('.pending').removeClass('pending');

					if( data.myEvent.state == 'suspended' ){
						LJ.fn.toastMsg( "Les inscriptions sont momentanément suspendues", 'info' );
						$li.text('Reprendre');
					}

					if( data.myEvent.state == 'open' ){
						LJ.fn.toastMsg( "Les inscriptions sont à nouveau possible", 'info' );
						$li.text('Suspendre');
					}
			}

			var eventWrap = LJ.$eventsWrap.find('.eventItemWrap[data-eventid="' + eventId + '"]');

			eventWrap.attr('data-eventstate', state )
					 .find('button.askIn');
					

		},
		fetchEventParameters: function(){

			setTimeout( function(){

				var expose = window.dum_params;

			}, 1000 );

		},
		insertEvent: function( myEvent ){

			csl('Inserting new event');
			myEvent.beginsAt = new Date ( myEvent.beginsAt );

			/* On ajoute l'event au bon endroit pour maintenir l'ordre*/
			var idx = _.sortedIndex( LJ.myEvents, myEvent, 'beginsAt' );
			LJ.myEvents.splice( idx, 0, myEvent );

			var eventHTML = LJ.fn.renderEvent( myEvent );

			/* Prise en compte des effets de bords sinon le jQuery return undefined */
			if( idx == 0 )
			{	
				csl('Inserting first element');
				if( $('.eventItemWrap').length == 0 )
					$( eventHTML ).insertAfter( $('#noEvents') );
				else
					$( eventHTML ).insertBefore( $('.eventItemWrap').first() );
				$('#noEvents').addClass('filtered');
				return;
			}
			// myEvents just got incremented, hence the - 1
			if( idx == LJ.myEvents.length - 1){
				$( eventHTML ).insertAfter( $( $('.eventItemWrap')[idx-1] ) ).addClass('inserted');
			}else{
				$( eventHTML ).insertAfter( $( $('.eventItemWrap')[idx] ) ).addClass('inserted');
			}

		},
		hashtagify: function( str ){
			
			var hashtag_parts = [];
				str.trim().split(/[\s_-]/).forEach(function( el, i ){
					if( i == 0 ){
						hashtag_parts.push( el );
					} else {
						if( el != '') {
							var elm = el[0].toUpperCase() + el.substring(1);
							hashtag_parts.push( elm );
						}
					}
				});
				return hashtag_parts.join('');

		},
		createEvent: function(){

			var tags = [],
				userIds = [];

			$('#createEventWrap .selected').each( function( i, $el ){
				var tag = $( $el) .attr('class').split(' ')[1].split('-')[1];						 
				tags.push( tag );
			});

			$('#createEventWrap .imgWrapThumb.active').each( function( i, el ){
				userIds.push( $(el).data('userid') ); 
			});

			var e = {};
				e.hostId	  	  = LJ.user._id;
				e.hostName   	  = LJ.user.name;
				//e.hostimg_id 	  = LJ.user.img_id;
				//e.hostimg_version  = LJ.user.img_version;
				e.name 		  	  = $('#eventName').val();
				e.location    	  = $('#eventLocation').val();
				e.hour 		  	  = $('#eventHour').val();
				e.min  	  		  = $('#eventMinut').val();
				e.description 	  = $('#eventDescription').val();
				e.maxGuest        = $('#eventMaxGuest').val();
				e.tags            = tags;
				e.userIds		  = userIds;

				var eventName = 'event/create',
					data = e
					data.socketId = LJ.pusher.connection.socket_id
					, cb = {
						success: function( data ){

							var myEvent = data.myEvent;

							var eventId = myEvent._id,
							hostId = myEvent.hostId;
						
							sleep( LJ.ui.artificialDelay , function(){ 

								/* Internal */
								LJ.user.status = 'hosting';
								LJ.user.hosted_event_id = eventId;
								LJ.myAskers = data.myEvent.askersList;

								/* Display in Manage */
        						LJ.fn.displayAskers();
        						LJ.fn.addFriendLinks();
								LJ.fn.refreshArrowDisplay();

								/* Smooth transition */
								LJ.fn.displayMenuStatus( function(){ $('#management').click(); } );

								/* CreateEvent UI restore */
								$('.themeBtn').removeClass('validating-btn');
								LJ.$createEventWrap.find('input, #eventDescription').val('');
								LJ.$createEventWrap.find('.selected').removeClass('selected');

								/* Display in Events */
								LJ.fn.insertEvent( myEvent );
								$('#refreshEventsFilters').click();

							});

						},
						error: function( xhr ){
							LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
						}
					};

				LJ.fn.say( eventName, data, cb );
		},
		api: function( method, url, options, callback ){

			if( !callback && typeof(options) == 'function' ){
				callback = options;
				options = {};
			};

			$.ajax({
				method: method,
				url: '/api/v' + LJ.settings.api_version + '/' + url,
				data: options.data,
				beforeSend: options.beforeSend,
				success: function( data ){
					callback( null, data );
				},
				error: function( xhr ){
					callback( JSON.parse( xhr ).responseText, null );
				},
				complete: function(){
					LJ.fn.defaultApiCompleteCallback();
				}
			})

		},
		defaultApiCompleteCallback: function(){

			console.log('api call completed');
		},
		fetchEvents: function( callback ){

			if( !LJ.user._id )
				return console.error("Can't fetch events, userId not found");

			var start_date = moment().format('DD/MM/YY');
			LJ.fn.api('get','events?start_date='+start_date, callback );

			/*

			var cb = {
				beforeSend: function(){},
				success: function( data ){
					//delog(data);
					var myEvents = data.myEvents;
					LJ.state.fetchingEvents = false;

					var L = myEvents.length;
					csl('Events fetched from the server, number of events : ' + L);

					for( var i=0; i<L; i++ ){

						LJ.myEvents[i] = myEvents[i];
						LJ.myEvents[i].createdAt = new Date( myEvents[i].createdAt );
						LJ.myEvents[i].beginsAt  = new Date( myEvents[i].beginsAt );
					}

					 L'array d'event est trié à l'initialisation 
					LJ.myEvents.sort( function( e1, e2 ){
						return e1.beginsAt -  e2.beginsAt ;
					});

					LJ.fn.displayEvents();
				},
				error: function( xhr ){
					csl('Error fetching events');
				}
			};
				*/
            
		},
        fetchAskers: function(){

            if( LJ.state.fetchingAskers )
                return LJ.fn.toastMsg("Already fetching askers", 'error');

            LJ.state.fetchingAskers = true;

            var eventName = 'fetch-askers',
            	data = { eventId: LJ.user.hosted_event_id };

            var cb = {
            	success: function( data ){

                	LJ.state.fetchingAskers = false;
                    LJ.myAskers = data.askersList;
                    LJ.fn.displayAskers();
                    LJ.fn.addFriendLinks();
					$('#askersListWrap div.active').click(); // force update
					LJ.fn.refreshArrowDisplay();   
            	},
            	error: function( xhr ){
            		delog('Error fetching askers');
            	}
            };

            LJ.fn.say( eventName, data, cb );

        },
        displayEvents: function(){

        	/* Mise à jour de la vue des évènements
        	  au cas où quelqu'un se connecte en période creuse
        	*/
        	//csl('Displaying events');

        	var hour = ( new Date() ).getHours();
        	if( hour < LJ.settings.eventsRestartAt && hour >= LJ.settings.eventsTerminateAt ){
    			csl('Displaying events frozen state');
        		return LJ.fn.displayViewAsFrozen();
        	}     		

            LJ.$eventsListWrap.html( '' );
            $('.eventItemWrap').velocity("transition.slideLeftIn", {
            	display:'inline-block'
            });

        },
        displayAskers: function(){

            $('#askersMain').html('').append( LJ.fn.renderAskersMain() );
            $('#askersThumbs').html('').append( LJ.fn.renderUsersThumbs() );

            LJ.fn.refreshArrowDisplay();
            LJ.fn.refreshOnlineUsers();

        },
        addFriendLinks: function(){

        	var idArray = _.pluck( LJ.myAskers, '_id' );
	
        	for( var i = 0; i < LJ.myAskers.length ; i ++ )
        	{	
        		$('#askersThumbs .team-'+i).removeClass('team-'+i);
        		$('#askersThumbs .head-'+i).removeClass('head-'+i);
        		
        		$('#askersThumbs div[data-userid="'+ LJ.myAskers[i]._id +'"]').addClass('team-'+i).addClass('head-'+i);
        		
        		for( var k = 0 ; k < LJ.myAskers[i].friends.length ; k++ )
        		{	
        			if( idArray.indexOf( LJ.myAskers[i].friends[k].friendId ) == -1 )
        			{
        				//nada
        			}
        			else
        			{	
        				if( LJ.myAskers[i].friends[k].status == 'mutual' )
        				{	
        					$('#askersThumbs div[data-userid="'+ LJ.myAskers[i].friends[k].friendId+'"]').addClass('team-'+i);		  
        				}
        			}
        		} 
        	}

        },
        displayAsOnline: function( data ){

        	var userId = data.userId;
			$('div[data-userid="'+userId+'"]')
					.find('.online-marker')
					.addClass('active');

        },
        displayAsOffline: function( data ){

        	var userId = data.userId;
					$('div[data-userid="'+userId+'"]')
					.find('.online-marker')
					.removeClass('active');

        },
        filterEvents: function(tags, locations){

        	if( $('.eventItemWrap').length == 0 ) return LJ.fn.toastMsg('Aucun évènement à filtrer', 'error');

        	LJ.$eventsListWrap.find('.selected').removeClass('selected');

        	    isFilteredByLoc = ( locations.length != 0 ),
        		isFilteredByTag = ( tags.length      != 0 );

	        	var eventsToDisplay = [];
	        	var matchLocation = false;
	        	var matchTags = false;

	        	$('.eventItemWrap').each( function( i, itemWrap ) {

	        		matchLocation = matchTags = false;

	        		if( locations.indexOf( $(itemWrap).data('location') ) != -1 ){
	        			matchLocation = true;
	        		}

	        		$( itemWrap ).find('.tag')
	        					 .each( function( i, tag ){
	        					 	var l = $( tag ).prop('class').split(' ')[1];
	        					 	if( tags.indexOf( l ) != -1 ){
	        					 		$( tag ).addClass('selected');
	        					 		matchTags = true;
	        					 	}
	        					 });

			        function addItem(){ eventsToDisplay.push( $(itemWrap) ); } /*For readability */	

			    	if ( !isFilteredByTag && !isFilteredByLoc 								 ){ addItem(); }
			    	if (  isFilteredByTag &&  isFilteredByLoc && matchTags && matchLocation  ){ addItem(); }
			    	if (  isFilteredByTag && !isFilteredByLoc && matchTags 					 ){ addItem(); }
			    	if ( !isFilteredByTag &&  isFilteredByLoc && matchLocation 				 ){ addItem(); }

	      		});

	        	//delog('Events to display : ' + eventsToDisplay );

        		/* Transforme un Array de jQuery objects, en un jQuery-Array */
        		LJ.$eventsToDisplay = $(eventsToDisplay).map( function(){ return this.toArray(); });
	        	
       		$('.eventItemWrap, #noResults ').addClass('filtered');
       		LJ.$eventsToDisplay.removeClass('filtered');

       		if( LJ.$eventsToDisplay.length == 0){
       			LJ.fn.toastMsg( 'Aucun évènement trouvés', 'info');
       			$('#noEvents').addClass('filtered');
       			$('#noResults').removeClass('filtered')
       						  .velocity('transition.slideLeftIn', { duration: 700 });

       		}else{
       			//LJ.fn.toastMsg( LJ.$eventsToDisplay.length + ' soirées pour ces filtres!', 'info');
       		}

        },
        requestIn: function( eventId, hostId, userId, requesterId ){

            csl("requesting IN with id : "+ eventId);

            var eventName = 'request-participation-in',
            	data = {
            		eventId: eventId,
            		hostId: hostId,
            		userId: userId,
            		requesterId: requesterId
            	},
            	cb = {
            		success: function( data ){
            			LJ.fn.handleRequestParticipationInSuccess( data );
            		},
            		error: function( xhr ){
            			LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
            		}
            	};

            LJ.fn.say( eventName, data, cb );

        },
        requestOut: function( eventId, hostId, userId, requesterId ){  

        	csl("requesting OUT with id : "+ eventId);

        	var eventName = 'request-participation-out',
        		data = {
        			userId: userId,
					hostId: hostId,
					eventId: eventId,
					requesterId: requesterId
        		},
        		cb = {
        			success: function( data ){
        				LJ.fn.handleRequestParticipationOutSuccess( data );
        			},
        			error: function( xhr ){

        			}
        		}

        	LJ.fn.say( eventName, data, cb );


        },/*sayfn*/
        say: function( eventName, data, cb ){

        	var url = '/' + eventName;

        	$.ajax({
        		method:'POST',
        		url:url,
        		dataType:'json',
        		data: data,
        		beforeSend: function(req){
        			req.setRequestHeader('x-access-token', LJ.accessToken );
        			if( typeof( cb.beforeSend ) == 'function' ){
        				cb.beforeSend(); 
        			} else { LJ.fn.showLoaders(); }
        		},
        		success: function( data ){
        			if( typeof( cb.success ) == 'function' ) cb.success( data );
        		},
        		error: function( data ){
        			if( typeof( cb.error ) == 'function' ) return cb.error( data );
        			/* Default response to any HTTP error */
        			LJ.fn.handleServerError( JSON.parse( data.responseText ).msg );
        		}
        	});

        	//LJ.fn.handleTimeout();

        },
        handleTimeout: function(){

        	/* !! Algo ne marche pas si loader success en cours d'affichage après une failure */
        	sleep( 8000, function(){

        		if( $('.loaderWrap').css('display') == 'none' && $('.m-loaderWrap').css('display') == 'none') return  // pas jolie mais bn

        		LJ.fn.handleServerError('Timeout');
        	});

        }, 
        bubbleUp: function( el ){

        	var $el = $(el);

        	if( $el.hasClass('menu-item-active') ) return; 

        	var $bubble = $el.find('.bubble'),
        		n = $bubble.text() == 0 ? 0 : parseInt( $bubble.text() );

        	$bubble.removeClass('filtered');

        		if( n == 99 ) 
        			return $bubble.text(n+'+');

        	return $bubble.text( n + 1 );

        },
        handleFetchAskedInSuccess: function( data ){

        	var askersList = data.askersList,
        		eventId = data.eventId,
        		$itemWrap =  $('.eventItemWrap[data-eventid="'+eventId+'"]'),
        		$askersWrap = $itemWrap.find('.askedInWrap');

        	var d = LJ.cloudinary.displayParamsEventAsker;
        		$askersWrap.html('');

			for( var i = 0; i < askersList.length ; i ++ ){
				
				var asker = askersList[i];

					d.version = asker.img_version;

				//var $askerImg = LJ.fn.renderAskerInEvent( asker.img_id, { dataList: [{ dataName: 'userid', dataValue: asker._id }]});
				//	$askersWrap.prepend( $askerImg );					

				var $nbAskers = $itemWrap.find('.e-guests span.nbAskers');
					$nbAskers.text( askersList.length );
			}

        },
        displayPictureHashtags: function(){

        	for( var i = 0; i < LJ.user.pictures.length; i ++ ){
				var hashtag = LJ.user.pictures[i].hashtag;
				$('.picture-hashtag').eq(i).find('input').val(hashtag);        		
        	}

        },
        handleUpdatePicturesSuccess: function( data ){

        setTimeout( function(){ 
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
        handleSuccessDefault: function( data ){
        	delog('Success!');
        },
        handleErrorDefault: function( data ){
        	delog('Error!');
        },
        displayAddFriendToPartyButton: function(){

        	var $friendsWrap = $('#friendsWrap'),
        		$eventWrap = $friendsWrap.parents('.eventItemWrap'),
        		$askedInWrap = $friendsWrap.parents('.eventItemWrap').find('.askedInWrap');

        	$friendsWrap.find('.f-item').each( function( i, el ){

        		var $friend = $(el),
        			friendId = $friend.data('userid');

        		var button;
        		
        		var myFriend = _.find( LJ.myFriends, function(el){ return el._id == friendId ; });

           		if( myFriend.status == 'hosting' )
           		{
	                button = '<button class="themeBtn isHosting">'
	                  + '<i class="icon icon-forward-1"></i>'
	                  +'</button>';
	                return $friend.find('button').replaceWith( button );
              	}

	        	if( $askedInWrap.find('img[data-userid="'+friendId+'"]').length == 1 )
	        	{  
              		button = '<button class="themeBtn onHold">'
                      + '<i class="icon icon-ok-1"></i>'
                      +'</button>';
	              	return $friend.find('button').replaceWith( button );
	        	}

        		    button = '<button class="themeBtn ready">'
                  + '<i class="icon icon-user-add"></i>'
                  +'</button>';
	        	return $friend.find('button').replaceWith( button );
	        	
        	});

        },
        subscribeToChannels: function(){

        	var channels = LJ.user.channels,
        		L = channels.length;
        	for( var i=0; i<L; i++ )
        	{
        		LJ.channels[ channels[i].access_name ] = LJ.pusher.subscribe( channels[i].channel_label )
        	}
        	return;

        },
        initChannelListeners: function(){

        	/* Bind all defaults global events */
        	LJ.channels['defchan'].bind('create-event-success', LJ.fn.handleCreateEventSuccess );
        	LJ.channels['defchan'].bind('suspend-event-success', LJ.fn.handleSuspendEventSuccess );
        	LJ.channels['defchan'].bind('cancel-event-success', LJ.fn.handleCancelEventSuccess );

        	LJ.channels['defchan'].bind('restart-events', LJ.fn.handleRestartEvents );
        	LJ.channels['defchan'].bind('reset-events', LJ.fn.handleResetEvents );

        	LJ.channels['defchan'].bind('refresh-users-conn-states', LJ.fn.refreshUserConnState );

        	//-----------------------------------------------------
        	/* Bind personnal events */  	
        	LJ.channels['mychan'].bind('request-participation-in-success', LJ.fn.handleRequestParticipationInSuccess );
        	LJ.channels['mychan'].bind('request-participation-out-success', LJ.fn.handleRequestParticipationOutSuccess );

        	LJ.channels['defchan'].bind('display-msg', function( data ){
        		LJ.fn.toastMsg( data.msg, 'info' );
        	});



        },
        refreshUserConnState: function( data ){

        	LJ.myOnlineUsers = _.keys( data.onlineUsers );
        	$('.online-marker').removeClass('active');
        	LJ.fn.refreshOnlineUsers();
        },
        testAllChannels: function(){

        	var userId = LJ.user._id;
        	var channel_label = 'test-all-channels'
        		, data = { userId: userId }
        		, cb = {
        			success: function( data ){
        				delog('Test launched...ok');
        			},
        			error: function( xhr ){
        				delog('Error! :@');
        			}
        		};

        	LJ.fn.say( channel_label, data, cb );

        },
        cancelEvent: function( eventId, hostId, templateId ){

        	csl('canceling event : '+eventId+'  with hostId : '+hostId);
        	$( '#cancelEvent' ).addClass( 'pending' );

        	var eventName = 'event/cancel',
        		data = { eventId: eventId, hostId: hostId, socketId: LJ.pusher.connection.socket_id, templateId: templateId }
        		, cb = {
        			success: function( data ){

        				/* Host only */
			        		$('.pending').removeClass('pending');
			        		LJ.user.status = 'idle';
			        		LJ.myAskers = [];
			        		LJ.$manageEventsWrap.find('#askersThumbs, #askersMain').html('');
			        		LJ.fn.displayMenuStatus( function(){ if(hostId==LJ.user._id) $('#create').click(); } );
					
						/* For all users */							                	 
			        	var canceledEvent = LJ.$eventsListWrap.find('.eventItemWrap[data-hostid="'+hostId+'"]');
			        		canceledEvent.velocity("transition.slideRightOut", {
			        			complete: function(){
			        				canceledEvent.remove();
			        				if( $('.eventItemWrap').length == 0 ) LJ.fn.displayEvents();
			        			}
			        		});

			        	_.remove( LJ.myEvents, function( el ){
			        		return el.hostId == hostId; 
			        	});
        			},
        			error: function( xhr ){
        				delog('Error canceling event');
        				LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
        			}
        		};

        	LJ.fn.say( eventName, data, cb );

        },
        suspendEvent: function( eventId, hostId ){

        	delog('Suspending event with id : ' + eventId + ' and hostId : ' + hostId );
        	$( '#suspendEvent' ).addClass( 'pending' );

        	var eventName = 'event/suspend',
        		data = { eventId: eventId, hostId: hostId, socketId: LJ.pusher.connection.socket_id }
        		, cb = {
        			success: function( data ){
        				sleep( LJ.ui.artificialDelay, function(){

	        				var eventState = data.eventState,
	        					hostId     = data.hostId;

	        				var $li = $('#suspendEvent');
							$('.pending').removeClass('pending');

							if( eventState == 'suspended' ){
								LJ.fn.toastMsg( "Les inscriptions sont momentanément suspendues", 'info' );
								$li.text('Reprendre');
							}

							if( eventState == 'open' ){
								LJ.fn.toastMsg( "Les inscriptions sont à nouveau possible", 'info' );
								$li.text('Suspendre');
							}
        				});
        			},
        			error: function( xhr ){
        				sleep( LJ.ui.artificialDelay, function(){
	        				delog('Error suspending event');
	        				LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
        				});
        			}
        		};

        	delog('Calling say with eventName:' +eventName+'  and data:'+data);
        	LJ.fn.say( eventName, data, cb );

        },
        showLoaders: function(){

        	$( '.loaderWrap, .m-loaderWrap' ).velocity( 'fadeIn', { duration: 400 });

        },
        hideLoaders: function(){

            $( '.loaderWrap, .m-loaderWrap' ).velocity( 'fadeOut', { duration: 250 });

        }, 
        handleCreateEventSuccess: function( data ){

        	var myEvent = data.myEvent;

        		LJ.myAskers = data.myEvent.askersList;
        		LJ.fn.displayAskers();

        		/* Réagir si un ami créé un évènement, MAJ les buttons */ 
				//LJ.fn.toastMsg( myEvent.hostName + ' a créé un évènement !', 'info' );
				LJ.fn.bubbleUp( '#events' );

				LJ.fn.insertEvent( myEvent );
				$('#refreshEventsFilters').click();

        },
        handleSuspendEventSuccess: function( data ){

        	var hostId     = data.hostId,
        		eventId    = data.eventId,
			    eventState = data.eventState;			


        		sleep( LJ.ui.artificialDelay , function(){ 

						var eventId = data.eventId;
						var eventWrap = LJ.$eventsWrap.find('.eventItemWrap[data-hostid="' + hostId + '"]');

						var textBtn = eventState == 'suspended' ? "L'évènement est complet" : "Je veux y aller";

						eventWrap.attr('data-eventstate', eventState );

						if( LJ.user.asked_events.indexOf( eventId ) != -1 ){
							return delog('Exiting');
						}
						 eventWrap.find('button.askIn')
						 		  .text( textBtn );
						
					});	

        },
        handleCancelEventSuccess: function( data ){

        	var hostId  = data.hostId;

        		sleep( LJ.ui.artificialDelay , function(){ 

					var canceledEvent = LJ.$eventsListWrap.find('.eventItemWrap[data-hostid="'+data.hostId+'"]');
	        		canceledEvent.velocity("transition.slideRightOut", {
	        			complete: function(){
	        				canceledEvent.remove();
	        				if( $('.eventItemWrap').length == 0 ) LJ.fn.displayEvents();
	        			}
	        		});

		        	_.remove( LJ.myEvents, function( el ){
		        		return el.hostId == data.hostId; 
		        	});
				});	

        },
        displayMenuStatus: function( cb ){
 
			var status = LJ.user.status;

			if( status == 'idle' )
			{
				$('#management').velocity('transition.slideRightOut', {
					duration: 200,
					complete: function(){ $('#create').removeClass('filtered').velocity('transition.slideLeftIn', { 
						duration: 200, display:'inline-block', complete: function(){ cb(); } }); }
				});
			}

			 if( status == 'hosting' )
			{
				$('#create').velocity('transition.slideRightOut', {
					duration: 200,
					complete: function(){ $('#management').removeClass('filtered').velocity('transition.slideLeftIn', { 
						duration: 200, display: 'inline-block', complete: function(){ cb(); } }); }
				});
			}
        }

}); //end LJ

$('document').ready(function(){
		

		/* Recursive initialisation of FB pluggin*/
		var initFB = function(time){
			if( typeof(FB) === 'undefined' ) return sleep(time, initFB )
			FB.init({
					    appId      : '1509405206012202',
					    xfbml      : true,  // parse social plugins on this page
					    version    : 'v2.1' // use version 2.1
				});
			LJ.fn.init({ debug: true });
			csl('Application ready!');
		}

		initFB(300);

});


function delog(msg){
	if( LJ.state.debug )
		console.log(msg);
}



window.dumdata = [
  {
    "_id": "55aa651dd00913bc0a5b9eed",
    "index": 0,
    "guid": "8c2a16ea-1eb6-4fb4-a2a8-0cf3815cae43",
    "isActive": true,
    "picture": "http://placehold.it/32x32",
    "age": 26,
    "name": "Fannie Cain",
    "gender": "female",
    "email": "fanniecain@telequiet.com",
    "registered": "2014-02-20T07:16:14 -01:00",
    "latitude": 79.631695,
    "longitude": -13.765706,
    "tags": [
      "qui",
      "est",
      "culpa",
      "non",
      "cillum",
      "aliquip",
      "laboris"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Rene Reed"
      },
      {
        "id": 1,
        "name": "Francine Banks"
      },
      {
        "id": 2,
        "name": "Susan Strong"
      }
    ],
    "greeting": "Hello, Fannie Cain! You have 4 unread messages.",
    "favoriteFruit": "apple"
  },
  {
    "_id": "55aa651dadb7755339c32793",
    "index": 1,
    "guid": "e93dee0b-d865-4c70-86e1-4a0600e95cc0",
    "isActive": true,
    "picture": "http://placehold.it/32x32",
    "age": 40,
    "name": "Bauer Bird",
    "gender": "male",
    "email": "bauerbird@telequiet.com",
    "registered": "2014-11-02T13:09:28 -01:00",
    "latitude": 83.599981,
    "longitude": 127.370264,
    "tags": [
      "est",
      "velit",
      "in",
      "veniam",
      "labore",
      "laborum",
      "voluptate"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Stark Wiley"
      },
      {
        "id": 1,
        "name": "Bonnie George"
      },
      {
        "id": 2,
        "name": "Higgins Shepard"
      }
    ],
    "greeting": "Hello, Bauer Bird! You have 1 unread messages.",
    "favoriteFruit": "banana"
  },
  {
    "_id": "55aa651df3ddc578abf5b576",
    "index": 2,
    "guid": "65ff1b0f-127f-4549-900b-7bf61cf9f683",
    "isActive": false,
    "picture": "http://placehold.it/32x32",
    "age": 21,
    "name": "Tessa Anthony",
    "gender": "female",
    "email": "tessaanthony@telequiet.com",
    "registered": "2015-06-12T13:19:33 -02:00",
    "latitude": -83.109766,
    "longitude": -90.599844,
    "tags": [
      "dolor",
      "et",
      "voluptate",
      "ut",
      "ipsum",
      "ut",
      "exercitation"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Thelma Wagner"
      },
      {
        "id": 1,
        "name": "Denise Barrera"
      },
      {
        "id": 2,
        "name": "Alexander David"
      }
    ],
    "greeting": "Hello, Tessa Anthony! You have 1 unread messages.",
    "favoriteFruit": "banana"
  },
  {
    "_id": "55aa651daa2c00a661e298be",
    "index": 3,
    "guid": "008c2b0a-9aff-4767-8a2b-b0f6935ac7e5",
    "isActive": false,
    "picture": "http://placehold.it/32x32",
    "age": 20,
    "name": "Renee Henry",
    "gender": "female",
    "email": "reneehenry@telequiet.com",
    "registered": "2014-07-13T04:19:49 -02:00",
    "latitude": -82.359818,
    "longitude": -110.960972,
    "tags": [
      "mollit",
      "nostrud",
      "ullamco",
      "ad",
      "sit",
      "eu",
      "sit"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Rosario Freeman"
      },
      {
        "id": 1,
        "name": "Blevins Carroll"
      },
      {
        "id": 2,
        "name": "Elinor Norton"
      }
    ],
    "greeting": "Hello, Renee Henry! You have 8 unread messages.",
    "favoriteFruit": "apple"
  }
]




window.dum_places = [
	{
		id: '1',
		name:'Le barilleur',
		address: 'blabla',
		tag: 'bar'
	},
	{
		id: '2',
		name:'Le Duplexe',
		address: 'blabla',
		tag: 'nightclub'
	},
	{
		id: '3',
		name:'Le Violondingue',
		address: 'blabla',
		tag: 'bar dansant'
	},
	{
		id: '4',
		name:'Le Rex Club',
		address: 'blabla',
		tag: 'nightclub'
	},
	{
		id: '5',
		name:'O\'Sullivans',
		address: 'blabla',
		tag: 'bar'
	}
];