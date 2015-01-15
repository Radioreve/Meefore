	
	window.LJ = _.merge( window.LJ || {}, 

{

	params:{
		socket    :  null,
		domain	  : "http://87.247.105.70:1337"
	},
	ui:{
		artificialDelay: 600,
		displayIn:  { opacity: [1, 0], translateX: [-8, 0]   },
		displayOut: { opacity: [0, 1], translateX: [10, 0]   }
	},
	cloudinary:{
		uploadParams: { cloud_name:"radioreve", api_key:"835413516756943" },

		/* Image de profile */
		displayParamsProfile: { cloud_name: "radioreve", width: 150, height: 150, crop: 'fill', gravity: 'face' },

		/* Image de l'host dans un event */
		displayParamsEventHost: { cloud_name :"radioreve", width: 80, height: 80, crop: 'fill', gravity: 'face', radius: '2' },

        /* Image des askers dans la vue event */
        displayParamsEventAsker: { cloud_name: "radioreve", width:45, height:45, crop:'fill', gravity:'face', radius:'0' },

		/* Image du user dans le header */
		displayParamsHeaderUser: { cloud_name: "radioreve",width: 50,height: 50, crop: 'fill', gravity: 'face', radius: 'max' },

		/* Image zoom lorsqu'on clique sur une photo*/
		displayParamsOverlayUser: { cloud_name: "radioreve", width: 280, height: 280, crop: 'fill', gravity: 'face', radius: 'max' },

        /* Image principale des askers dans vue managemnt */
        displayParamsAskerMain: { cloud_name: "radioreve", width:120, height:120, crop:'fill', gravity:'face', radius:3 },

		/* Image secondaire des askers dans vue management */
        displayParamsAskerThumb: { cloud_name: "radioreve", width:45, height:45, crop:'fill', gravity:'face', radius:'max' },

        /* Image secondaire des askers dans vue management, lorsqu'ils sont refusé */
        displayParamsAskerThumbRefused: { cloud_name: "radioreve", width:45, height:45, crop:'fill', effect:'grayscale', gravity:'face', radius:'max' },
        
        loader_id: "ajax-loader-black_frpjdb",
        m_loader_id: "ajak_lgmgym",
        displayParamsLoader:{ cloud_name :"radioreve", html: { 'class': 'loader'} },
        placeholder_id: "placeholder_jmr9zq",
        displayParamsPlaceholder:{ cloud_name :"radioreve", html: { 'class': 'mainPicture' }, width:150 }
	},
	/* To be dynamically filled on login */
	user:{},
	myEvents: [],
    myAskers: [],
    myUsers: [],
    myFriends: [],
    selectedTags: [],
    selectedLocations: [],
    $eventsToDisplay: $(),
    nextCallback:{},
	state: {
		connected: false,
		fetchingEvents: false,
        fetchingAskers: false,
		animatingContent: false,
		animatingChat: false,
		toastAdded: false,
		jspAPI:{}
	},
	tpl:{
		toastInfo : '<div class="toast toastInfo" class="none"><span class="toast-icon icon icon-right-open-big">'
					+'</span><span class="toastMsg"></span></div>',
		toastError: '<div class="toast toastError" class="none"><span class="toast-icon icon icon-cancel">'
					+'</span><span class="toastMsg"></span></div>',
		toastSuccess: '<div class="toast toastSuccess" class="none"><span class="toast-icon icon icon-right-open-big">'
					+'</span><span class="toastMsg"></span></div>',
		noResult: '<center id="noEvents" class="filtered"><h3>Aucun évènement pour ce choix de filtre </h3></center>',
		charte: '<div id="charte" class="centered"> \
					<h2>Charte d\'engagement V&W </h2> \
					<div class="subcharte"><span>1</span> Ne jamais se présenter à un event les mains vides </div> \
					<div class="subcharte"><span>2</span> Toujours respecter les autres utilisateurs </div> \
					<div class="subcharte"><span>3</span> Parler de V&W à vos amis </div> \
					<div class="charte-accept">Accepter</div> \
					<div class="charte-accept">"Refuser"</div> \
				 </div>'
	},
	tagList: [],
	locList: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ],
        $body                 : $('body'), 
		$loginWrap		 	  : $('#loginWrapp'),
		$signupWrap			  : $('#signupWrapp'),
		$resetWrap   	      : $('#resetWrapp'),
		$profileWrap	      : $('#profileWrap'),
		$eventsWrap		      : $('#eventsWrap'),
		$manageEventsWrap     : $('#manageEventsWrap'),
        $askersListWrap       : $('#askersListWrap'),
		$thumbWrap			  : $('#thumbWrap'),
		$loginBtn  	          : $('#login'),
		$signupBtn            : $('#signup'),
		$resetBtn			  : $('#reset'),
		$emailInput           : $('#email'),
		$passwordInput        : $('#pw'),
		$lostPassword         : $('#lost_pw'),
		$emailInputSignup     : $('#emailSignup'),
		$passwordInputSignup  : $('#pwSignup'),
		$passwordCheckInput   : $('#pwCheckSignup'),
		$backToLogin          : $('#b_to_login'),
		$validateBtn          : $('#validate'),
		$locationInput        : $('#location'),
		$loaderWrap 	      : $('.loaderWrap'),
		$createEventWrap	  : $('#createEventWrap'),
		$createEventBtn       : $('#createEventBtn'),
		$contentWrap          : $('#contentWrap'),
		$contactWrap          : $('#contactWrap'),
		$menuWrap             : $('#menuWrap'),
		$eventsListWrap       : $('#eventsListWrap'),
		$logout				  : $('#logout')

});

	window.LJ.fn = _.merge( window.LJ.fn || {}, 

		{

		renderEvents: function( arr, max ){

			var html =''; 
			    max = max || arr.length;

            if( max == 0 )
            {
                return '<h3 id="noEvents">Aucun évènement à afficher pour le moment.</h3>'
            }
			for( var i=0; i < max; i++ ){

				html += LJ.fn.renderEvent( arr[i] ); 

			}
			return html;

		},
        renderAskersMain: function(arr,max){

                var html =''; 
                var arr = LJ.myAskers;
                var max = max || arr.length;

                for( var i=0; i < max ; i++ ){ 
                if( i < max )
                {	
                	if(i == 0){
                		html += LJ.fn.renderAskerMain( arr[i], 'active' );
                	}else
                	{
                	html += LJ.fn.renderAskerMain( arr[i] ); 
                	}
                }

                }
                return html;

        },
        renderChatWrap: function( chatId ){

        	return '<div class="chatWrap chat-asker none" data-chatid="'+chatId+'">'
                            +'<div class="chatLineWrap"></div>'    
                            +'<div class="chatInputWrap">'
                            +  '<input type="text" value="" placeholder="Can I come with my friends ?">'
                            +  '<input type="submit" value="">'
                            +'</div>'
                           +'</div>';

        },
        renderEventTags: function( tags ){

        	var eventTags = '<div class="tag-row">',
				L = tags.length;

				for ( var i=0; i<L; i++ )
				{
					eventTags += '<div class="tag tag-'+tags[i]+'">' + LJ.fn.matchTagName( tags[i] ) + '</div>';
				}
				eventTags +='</div>';

				return eventTags;

        },
        renderEventButton: function( eventId, hostId ){

            if( hostId == LJ.user._id )
            {
                return '<div class="askInWrap"><button class="themeBtnToggle themeBtnToggleHost">Management</button></div>';
            }

            if( LJ.user.eventsAskedList.indexOf( eventId ) > -1 )
            {
                return '<div class="askInWrap">\
                           <button class="themeBtnToggle askIn asked"> En attente </button> \
                           <div class="chatIconWrap"><i class="icon icon-chat"/></div>\
                           <div class="friendAddIconWrap"><i class="icon icon-user-add"/></div>\
                        </div>';
            }

            /* Default */
                return '<div class="askInWrap">\
                           <button class="themeBtnToggle askIn idle"> Je veux y aller </button> \
                           <div class="chatIconWrap none"><i class="icon icon-chat"/></div>\
                           <div class="friendAddIconWrap none"><i class="icon icon-user-add"/></div>\
                        </div>';

			
        },
        renderHostImg: function( hostImgId, hostImgVersion ){

        	var d = LJ.cloudinary.displayParamsEventHost;
				d.version = hostImgVersion;


			var imgTag = $.cloudinary.image( hostImgId, d )
						  .addClass('zoomable')
						  .attr('data-imgid', hostImgId )
						  .attr('data-imgversion', hostImgVersion );

			var imgTagHTML = imgTag.prop('outerHTML');

			return imgTagHTML
        },
        renderAskerInEvent: function( imgId, o ){

        	var $img = $.cloudinary.image( imgId, LJ.cloudinary.displayParamsEventAsker );
        		$img.attr('data-imgid', imgId)
        			.addClass('zoomable');
 
        	if( o ){ 
	        	if( o.dataList.length > 0 )
	        	{
	        		for( var i = 0; i < o.dataList.length ; i++ ){
	        			$img.attr('data-'+o.dataList[i].dataName, o.dataList[i].dataValue );
	        		}
	        	}
        		
        	}

        	return $img;

        },
        renderAskersInEvent: function( askersList, maxGuest ){

        	var L = askersList.length,
        	    html='';
        	
        	for ( i = 0; i < L ; i++ )
        	{ 
        		var o = { classList: ['hello'], dataList: [] };
	        	var d = LJ.cloudinary.displayParamsEventAsker;

        		if( i < L )
        		{
	        		var imgId        = askersList[i].imgId;
	        			d.imgVersion = askersList[i].imgVersion;
	        			o.classList = ['askedInThumb'];
	        			o.dataList   = [ { dataName: 'askerid', dataValue:  askersList[i]._id } ];

        		}else //On affiche via placeholder le nb de places restantes.
        		{     
                    /* Deprecated
        			var imgId = LJ.cloudinary.placeholder_id;
        				o.classList = ['askedInRemaining'];
                    */
        		}

        		html += LJ.fn.renderAskerInEvent( imgId, o ).prop('outerHTML');
        	}
        		
        		return html
        },
		renderEvent: function( e ){

			var eventId        = e._id,
				hostId         = e.hostId,
				hostImgId      = e.hostImgId,
				hostImgVersion = e.hostImgVersion,
				tags           = e.tags,
				chatId 		   = LJ.fn.buildChatId( eventId, hostId, LJ.user._id );

			var imgTagHTML   = LJ.fn.renderHostImg( hostImgId, hostImgVersion ),
			    button       = LJ.fn.renderEventButton( e._id, hostId ),
				eventTags    = LJ.fn.renderEventTags( tags ),
            	chatWrap     = LJ.fn.renderChatWrap( chatId ),
            	askersThumbs = LJ.fn.renderAskersInEvent( e.askersList, e.maxGuest );

			var html = '<div class="eventItemWrap" '
						+ 'data-eventid="'+e._id+'" '
						+ 'data-hostid="'+e.hostId+'" '
						+ 'data-location="'+e.location+'"'
						+ 'data-eventstate="'+e.state+'">'
						+'<div class="eventItemLayer">'
						+ '<div class="headWrap">' 
						   + '<div class="e-image left">'+ imgTagHTML +'</div>'
						     + '<div class="e-hour e-weak">'+ LJ.fn.matchDateHHMM( e.beginsAt ) +'</div>'
						   + '<div class="e-guests right">'
						     + '<span class="guestsWrap">'
                               +'<span>Ils veulent y aller</span>'
						       + '<i class="icon icon-users"></i>'
						       + '<span class="nbAskers"> '+ e.askersList.length +'</span>'
						     + '</span>'
						   + '</div>'
						+ '</div>'
						+ '<div class="askedInWrap">'
						+ askersThumbs
						+ '</div>'
						+ '<div class="bodyWrap">'
							+ '<div class="e-location">'
							  + '<span>'+ LJ.fn.matchLocation( e.location ) +'</span>'
							+ '</div>'
							   + '<div class="e-name">'+ e.name +' </div>'
							   + '<div class="e-desc">' + e.description + '</div>'
							   + eventTags
							+ '</div>'
						+ button
                        + chatWrap
						+ '</div></div>';
			return html;
		},
		matchTagName: function(tagClass){

			if( tagClass == 'apparte' ) return 'appart\'';
			if( tagClass == 'apero' ) return 'apéro';
			if( tagClass == 'nuitblanche' ) return 'nuit blanche';
			if( tagClass == 'firsttime' ) return 'première fois';

			return tagClass
		},
		matchLocation: function( loc ){

			if( loc == 1){
				return '1er';
			}
			
				return loc + 'ème';
			
		},
		matchDateHHMM: function(d){

	    	 var dS = '';

    	     if( d.getHours() == 0){
    	     	dS = '0';
    	     }
	       	 dS += d.getHours() + "h";
     	     if( d.getMinutes() < 10){
     	     	dS+='0';
     	     }
             dS += d.getMinutes();
   		     return dS;
		},
		matchDateDDMMYY: function(d){
			
			var d = new Date(d);

			var day = d.getDate();
			var month = d.getMonth() + 1 + '';
			var year = (d.getFullYear()+'').substring(4,2);

			return day + '/' + month + '/' + year;
			
		},
		renderAskerPlaceholder: function(){

			var asker = {

				id: "placeholder",
				imgId: LJ.cloudinary.placeholder_id,
				name:"White",
				age: 25,
				description:""

			}

			return LJ.fn.renderAskerMain( asker );

		},
        renderAskerMain: function( a, className ){

        	className = className || '';

            var d = LJ.cloudinary.displayParamsAskerMain;
            	d.version = a.imgVersion; // Ne fonctionne pas car le param 'a' provient de la base qui est pas MAJ

            var imgTag = $.cloudinary.image( a.imgId, d );
            	imgTag.addClass('zoomable')
            		  .attr('data-imgid', a.imgId)
            		  .attr('data-imgversion', a.imgVersion);

            var imgTagHTML = imgTag.prop('outerHTML');

            var chatId = LJ.fn.buildChatId( LJ.user.hostedEventId, LJ.user._id, a._id );

            var chatWrap = '<div class="chatWrap chat-host none" data-chatid="'+chatId+'">'
                            +'<div class="chatLineWrap"></div>'    
                            +'<div class="chatInputWrap">'
                            +  '<input type="text" value="" placeholder="Are you alone ?">'
                            +  '<input type="submit" value="">'
                            +'</div>'
                           +'</div>';

            var html =  '<div class="a-item '+className+'" data-askerid="'+a._id+'">'
                           +'<div class="a-picture">'
                             + imgTagHTML
                           +'</div>'
                           +'<div class="a-birth">Membre depuis le ' + LJ.fn.matchDateDDMMYY( a.signupDate ) + '</div>'
	                           +'<div class="a-body">'
	                             +'<div class="a-name"><span class="label">Name</span>'+a.name+'</div>'
	                             +'<div class="a-age"><span class="label">Age</span>'+a.age+' ans'+'</div>'
	                             +'<div class="a-desc"><span class="label">Style</span><div>'+a.description+'</div></div>'
	                             +'<div class="a-drink"><span class="label">Drink</span><div class="drink selected">'+a.favoriteDrink+'</div></div>'
                           +'</div>'
	                             +'<div class="a-btn">'
	                             	 +'<button class="themeBtnToggle btn-chat"><i class="icon icon-chat"></i></button>'

	                           +'</div>'
                        + chatWrap
                    +'</div>';

            return html;

        },
        renderAskerThumb: function( o ){

        		var a = o.asker;
        		var myClass = o.myClass;

        	var d = LJ.cloudinary.displayParamsAskerThumb
        		dbnw = LJ.cloudinary.displayParamsAskerThumbRefused;
        		 
        		d.version = a.imgVersion,
        		dbnw.version = a.imgVersion;

        	var imgTagBlackWhite = $.cloudinary.image( a.imgId, dbnw ),
        	    imgTag = $.cloudinary.image( a.imgId, d );
        	
        		imgTagBlackWhite.addClass('grey');
        		imgTag.addClass('normal').addClass('none');

        	var imgTagHTML = imgTag.prop('outerHTML'),
        		imgTagBlackWhiteHTML = imgTagBlackWhite.prop('outerHTML');

        	var html = '<div data-hint="'+a.name+'"data-askerid="' + a._id + '" class="imgWrapThumb hint--top '+ myClass + '">'
        				+'<i class="icon icon-cancel-1 askerRefused none"></i>'
        				+'<i class="icon icon-ok-1     askerAccepted none"></i>'
                        +'<i class="icon icon-up-dir  none"></i>'
        				//+'<i class="icon icon-help-1 "></i>'
        				+ imgTagHTML
        				+ imgTagBlackWhiteHTML
        				+ '</div>';

        	return html;

        },
        renderAskersThumbs: function( maxGuest ){

        	var html = '',
        		L = maxGuest || LJ.myAskers.length;

        	for( var i = 0; i < L ; i++ )
        	{
        		var o = {};

        		if( i < LJ.myAskers.length )
        		{
	        		o.asker = LJ.myAskers[i];
	        		i == 0 ?  o.myClass = 'active' : o.myClass = '';

        			html += LJ.fn.renderAskerThumb( o );
        		}
        		else
        		{
        			o.asker = {}
        			o.asker._id 	= 'placeholder';
        			o.asker.imgId 	= LJ.cloudinary.placeholder_id;
        			o.myClass 		= 'placeholder';
		
        			html += LJ.fn.renderAskerThumb( o );

        		}
        		

        	}

        	return html;

        },
        renderOverlayUser: function( imgId, imgVersion ){

        	var d = LJ.cloudinary.displayParamsOverlayUser;
					d.version = imgVersion;

				var imgTag = $.cloudinary.image( imgId, d ).prop('outerHTML');

				return '<div class="largeThumb">'
					     + imgTag
					    +'</div>'

        },
        renderTagsFilters: function(){

        	var html = '',
        		tagList = LJ.settings.tagList,
        		L = tagList.length;

        		for( var i=0; i < L; i++){
        			html += '<div class="tag tag-' + tagList[i] + '">' + LJ.fn.matchTagName( tagList[i] ) + '</div>';
        		}
        	return html;

        },
        renderLocsFilters: function(){

        	var html = '',
        		locList = LJ.locList,
        		L = locList.length;

        		for( var i=0; i < L; i++){
        			html += '<div class="loc loc-' + locList[i] + '">' + locList[i] + '</div>';
        		}
        	return html;

        },
        renderAddFriendToPartyButton: function( user, inEvent ){

            var html = '';
            
            if( user.status == 'hosting' )
            {
                html += '<button class="themeBtn isHosting">'
                  + '<i class="icon icon-forward-1"></i>'
                  +'</button>';
                return html;
            }

            if( !inEvent )
            {             
                html += '<button class="themeBtn ready">'
                      + '<i class="icon icon-user-add"></i>'
                      +'</button>';
                return html;
            }

            if( inEvent )
            {
                html += '<button class="themeBtn onHold">'
                      + '<i class="icon icon-ok-1"></i>'
                      +'</button>';
                return html;
            }
            

        },
        renderUser: function( options ){

            var u = options.user,
                w = options.wrap,
                myClass = options.myClass,
                html = '';


            if( !u || !w ){
                return alert('Cannot format user');
            }

            if( w == 'searchWrap' )
            {
                var cl     = 'u';
                var friendButton = '<button></button>'
            }

            if( w == 'eventsWrap' )
            {
                var cl = 'f'; 
                var friendButton = '<button class="none"></button>' // sera remove tout de suite par displayButtons...();       
            }

                var d = LJ.cloudinary.displayParamsAskerThumb;
                    imgId = u.imgId;
                    d.version = u.imgVersion;
                    d.radius = '5';

                var imgTagHTML = $.cloudinary.image( imgId, d ).prop('outerHTML');

                html += '<div class="'+cl+'-item '+myClass+'" data-username="'+u.name.toLowerCase()+'"'
                          + 'data-userid="'+u._id+'"'
                          + 'data-userdrink="'+u.favoriteDrink.toLowerCase()+'"'
                          + 'data-userage="'+u.age+'">'
                          +'<div class="u-head imgWrapThumb">'
                            + imgTagHTML
                          +'</div>'
                          +'<div class="'+cl+'-body">'
                            + '<span class="'+cl+'-name">'+ u.name + '</span>'
                            + '<span class="'+cl+'-age">'+ u.age +' ans, drinks</span>'
                            + '<span class="'+cl+'-favdrink">'+ u.favoriteDrink +'</span>'
                          +'</div>'
                            + friendButton
                        +'</div>';

            return html;

        },
        renderUsersInSearch: function(){

        	var html = '';

        	for( var i = 0; i < LJ.myUsers.length ; i++ )
            {   
                if( LJ.myUsers[i]._id != LJ.user._id )
                html += LJ.fn.renderUser( { user: LJ.myUsers[i], wrap: 'searchWrap', myClass: 'none'} );
        	}

        	return html;

        },
        renderUsersInFriendlist: function(){

            var html = '';

                var fL = LJ.myFriends,
                    L = fL.length;

                if( L == 0 )
                {
                    return '<div id="noFriendsYet">You dont have any friends to invite <span>Find your friends</span></div>'
                }
                for( var i = 0 ; i < L ; i++ )
                {
                    html += LJ.fn.renderUserInFriendlist( fL[i] );
                }
                        
                html += '</div></div>';

                return html;

        },
        renderUserInFriendlist: function( friend ){

			if(!friend) return ''

            if( friend.status == 'hosting' )
                return LJ.fn.renderUser({ user: friend, wrap: 'eventsWrap'  });

            if( _.find( LJ.user.friendList, function(el){ return el.friendId == friend._id }).status == 'askedMe' )
                return '';

            if( _.find( LJ.user.friendList, function(el){ return el.friendId == friend._id }).status == 'askedHim' ) 
                return LJ.fn.renderUser({ user: friend, wrap: 'eventsWrap' });

            return LJ.fn.renderUser({ user: friend, wrap: 'eventsWrap'});
        }

});


window.LJ.fn = _.merge( window.LJ.fn || {} ,

{
		handleDomEvents: function(){

			LJ.fn.handleDomEvents_Globals();
			LJ.fn.handleDomEvents_Landing();
			LJ.fn.handleDomEvents_FrontPage();
			LJ.fn.handleDomEvents_Navbar();
			LJ.fn.handleDomEvents_Profile();
			LJ.fn.handleDomEvents_Events();
			LJ.fn.handleDomEvents_Create();
			LJ.fn.handleDomEvents_Management();
			LJ.fn.handleDomEvents_Search();
			LJ.fn.handleDomEvents_Contact();
			LJ.fn.handleDomEvents_Settings();

		},
		handleDomEvents_Globals: function(){

			LJ.$body.on('click','.chatInputWrap input[type="submit"]', function(e){

            	e.preventDefault();
            	e.stopPropagation();
            	LJ.fn.sendChat( $(this) );

            });
			
            LJ.$body.on('click','.overlay-high', function(){

            	LJ.fn.toggleOverlay('high');

            });

            LJ.$body.on('click','.overlay-low', function(){

            	LJ.fn.toastMsg('Relax, things start back at 12:00', 'info');

            });

            LJ.$body.on('click', 'img.zoomable', function(){

			 	/* Extracting the img id from the dom */
			 	var imgId      = $( this ).data('imgid'),
			 		imgVersion = $( this ).data('imgversion')|| ''; 

                LJ.fn.toggleOverlay( 'high', LJ.fn.renderOverlayUser( imgId, imgVersion ), 300);

            });

		},
		handleDomEvents_Landing: function(){

			$('#landingWrap button').click(function(){

				$('#landingWrap').velocity('transition.fadeOut', {
					duration: 400,
					complete: function(){
						
						LJ.$signupWrap.velocity('transition.slideUpIn', { duration: 1400 });
					}

				});

			});

		},
		handleDomEvents_FrontPage: function(){

			LJ.$signupBtn.click(function(e){ 

				e.preventDefault(); 
				LJ.fn.signupUser(); 

			});

			LJ.$loginBtn.click(function(e){	

				e.preventDefault();
				LJ.fn.loginUser();	

			});

			LJ.$resetBtn.click(function(e){

				e.preventDefault();
				LJ.fn.resetPassword();

			});

			$('#login-fb').click(function(e){

				e.preventDefault();
				console.log('Login in with Facebook');

				FB.login( function(res){

					console.log('Client status is now : ' + res.status ) ;

					if( res.status != 'connected' ) return;

						FB.api('/me', function(res){

					  		var facebookId = res.id;
					  		LJ.fn.loginWithFacebook( facebookId );

				  		});
				}, { scope: ['public_profile', 'email']});

			});

		},
		handleDomEvents_Navbar: function(){

			LJ.$logout.click(function(){
				location.reload();

			});

			['#contact', '#create', '#profile', '#events', '#management','#search', '#settings'].forEach(function(menuItem){

				$(menuItem).click(function(){

				$(menuItem).find('span.bubble').addClass('filtered').text('');
		
				  if( LJ.state.animatingContent || $(menuItem).hasClass('menu-item-active') || ($(menuItem).hasClass('disabled')) )
				  	return;

				  		LJ.state.animatingContent = true;
						
						var linkedContent = $(menuItem).data('linkedcontent');
						
						var indexActive = $('.menu-item-active').offset().left,
							indexTarget = $(menuItem).offset().left;

						if( indexActive > indexTarget ){
							var myWayOut = 'transition.slideLeftOut' ; //{opacity: [0, 1], translateX:[15,0 ] },
								myWayIn = 'transition.slideRightIn' ; //{opacity: [1, 0], translateX:[0,-5 ] };
						}else{
							var myWayOut = 'transition.slideRightOut' ;// {opacity: [0, 1], translateX:[-15,0 ] },
								myWayIn = 'transition.slideLeftIn' ; //{opacity: [1, 0], translateX:[0, 5] };
						}

						$('.menu-item-active').removeClass('menu-item-active')
											  .find('span.underlay')
											  .velocity({ opacity: [0, 1], translateY: [-2, 0]   },
											   { duration: 300,
											   complete: function(){
											   	$(menuItem).addClass('menu-item-active')
														   .find('span.underlay')
													   	   .velocity({ opacity: [1, 0], translateY: [0, -2]   }, { duration: 300 });
											   	} 
											});

						LJ.fn.displayContent( $(linkedContent), {
							myWayOut: myWayOut,
							myWayIn : myWayIn, 
							duration: 320
						});
					
				  
				});
			});

		},
		handleDomEvents_Profile: function(){

			LJ.$validateBtn.click( LJ.fn.updateProfile );

			$('#profileWrap .drink').click( function(){

				$('#profileWrap .drink.modified').removeClass('modified');
				if( $(this).hasClass('selected') ) return; 
				$(this).addClass('modified');
			
			});

			$('#profileWrap .mood').click( function(){

				$('#profileWrap .mood.modified').removeClass('modified');
				if( $(this).hasClass('selected') ) return; 
				$(this).addClass('modified');
			});

		},
		handleDomEvents_Events: function(){
	
			$('#refreshEventsFilters').click( function(){
					
				var $inserted = $('.inserted');

				if( $inserted.length == 0 ) return ;

				if( LJ.selectedTags.length == 0 ) return $('.inserted').removeClass('inserted');

				$inserted.each( function( i, el )
				{
					var $eventItemWrap = $( el );
					var myEvent = _.find( LJ.myEvents, function(elem){ return elem.hostId == $eventItemWrap.attr('data-hostid'); });

					var eventTags = myEvent.tags,
								L = eventTags.length;

					for( var k = 0; k < L; k++ ){
						eventTags[k] = "tag-" + eventTags[k];
					}

					if( _.intersection( eventTags, LJ.selectedTags ).length != 0 || LJ.selectedTags.length == 0 )
					{

						$eventItemWrap.find('.tag').each( function( i, tag )
						{	
							var $tag = $(tag);
							if( LJ.selectedTags.indexOf( $tag.attr('class').split(' ')[1] ) != -1 )
							{
								$tag.addClass( 'selected' );
							}
						});

						if( $eventItemWrap.find('.tag.selected').length != 0 ) $eventItemWrap.removeClass('inserted');

					}
				});

			});
			LJ.$body.on('click', '.f-item button', function(){

				csl('Asking for someone else');
				var $that = $(this);

				if( $that.hasClass('isHosting') )
				{
					LJ.fn.toastMsg('Redirecting to his event','info');
					$('.friendAddIconWrap.active').click();
				}

				if( ! $that.hasClass('ready') ) return;

				var eventId  = $that.parents('.eventItemWrap').attr('data-eventid'),
					hostId   = $that.parents('.eventItemWrap').attr('data-hostid'),
					friendId = $that.parents('.f-item').attr('data-userid'),
					friend   = _.find( LJ.myFriends, function(el){ return el._id == friendId ; });

				$that.removeClass('ready');

				csl('eventId : ' + eventId+ '\n hostId : '+hostId +'\n friend : '+friend );
				LJ.fn.showLoaders();
				LJ.fn.requestIn( eventId, hostId, friend, LJ.user._id );

			});

			LJ.$body.on('click','.themeBtnToggleHost', function(){

				$('#management').click();

			});

			LJ.$body.on('click', '.chatIconWrap', function(){

				LJ.fn.toggleChatWrapEvents( $(this) );

			});

			LJ.$body.on('click', '.friendAddIconWrap', function(){
				
				$('.eventItemWrap.surfacing').find('.chatWrap').velocity('transition.slideDownOut', { duration: 300 });
				$('.chatIconWrap.active').removeClass('active');

				sleep( 30, function(){ LJ.state.jspAPI['#friendListWrap'].reinitialise(); });

				if( $(this).hasClass('active') )
				{
					$(this).removeClass('active');
					$('#friendListWrap').velocity('transition.slideUpOut', { duration: 300 });
					LJ.fn.displayAddFriendToPartyButton();
					return;
				}

				$('.friendAddIconWrap').removeClass('active');
				$(this).addClass('active');

				$('#friendListWrap').insertAfter( $(this).parents('.eventItemWrap').find('.chatWrap') )
									.velocity('transition.slideUpIn',
									{
										duration: 550
									});
				LJ.fn.displayAddFriendToPartyButton();

			});

			LJ.$body.on('click', '.guestsWrap', function(){

				$(this).toggleClass('active');
				var $askersWrap = $(this).parents('.eventItemWrap').find('.askedInWrap');

				if( $(this).hasClass('active') )
				{
					$askersWrap.toggleClass('active')
						       .velocity('transition.fadeIn');
				}else
				{
					$askersWrap.toggleClass('active')
						       .velocity('transition.fadeOut');
				}

			});

			LJ.$body.on('click', '.askIn', function(){

				// Make sure client doesn't spam ask
				if( $('.asking').length > 0 ) return;

				var $self = $(this),
					$itemWrap = $self.parents('.eventItemWrap');

				var eventId = $self.parents('.eventItemWrap').data('eventid');
           		var hostId  = $self.parents('.eventItemWrap').data('hostid');

				if( $itemWrap.attr('data-eventstate') == 'open' )
				{
					LJ.fn.showLoaders();
					$self.addClass('asking');

					if( $self.hasClass('idle') )
					{	
						LJ.fn.requestIn( eventId, hostId, LJ.user, LJ.user._id ); 
					}
					else
					{	// To be removed in production for freemium considerations?
						LJ.fn.requestOut( eventId, hostId, LJ.user, LJ.user._id );
					}
				}
				else
				{
					LJ.fn.toastMsg('Event is currently suspended', 'info');
				}

			});

             $('#resetFilters').click( function(){

            	LJ.$eventsWrap.find('.selected').removeClass('selected');
            	$('#activateFilters').click();

            });

             $('#displayFilters').click( function(){

             	var $filtersWrap = $('.filtersWrap');

             	if( $filtersWrap.css('opacity') != 0 )
             	{
             		$filtersWrap.velocity('transition.slideUpOut', { duration: 400 });
             		$(this).find('span').text('Afficher');

             	}else
             	{
             		$filtersWrap.velocity('transition.slideDownIn', { duration: 550 });
             		$(this).find('span').text('Masquer');

             	}

             });

            $('#activateFilters').click( function() {

            	var tags 	  = [];
            		locations = [];  

				$('.filters-tags-row .selected').each( function( i, el ){
					var tag = $( el ).attr('class').split(' ')[1];						 
					tags.push( tag );
				});
				
				$('.filters-locs-row .selected').each( function( i, el ){
					var loc = parseInt( $( el ).attr('class').split(' ')[1].split('loc-')[1] );				 
					locations.push( loc );
				});  

				LJ.selectedTags 	 = tags;
				LJ.selectedLocations = locations;

				LJ.fn.filterEvents( LJ.selectedTags, LJ.selectedLocations );
            	
            });

           $('body').on('click', '#noFriendsYet span', function(){
           		$('#search').click();
           });

		},
		handleDomEvents_Create: function(){

			LJ.$createEventBtn.click(function(){
				LJ.fn.createEvent();
			});

		},
		handleDomEvents_Search: function(){

			$('#friendsOnly').click( function(){

				if( $(this).hasClass('active') )
				{
					$(this).removeClass('active').text('Amis uniquement');
					$('#searchUsers .u-item').removeClass('filtered');
					$('#searchBar input').val('').trigger('keydown');
				}
				else
				{
					$(this).addClass('active').text('Voir tous les utilisateurs');
					$('#searchUsers .u-item').each( function( i, el ){

						var arr = _.pluck( LJ.user.friendList, 'friendId' );
						var userId = $(el).attr('data-userid');
						var ind = arr.indexOf( userId );
						if( arr.indexOf( userId ) == -1 )
						{
							$(el).addClass('filtered')
						}
						else
						{
							var status = _.find( LJ.user.friendList, function(el){ return el.friendId == userId; }).status
							if( status == 'mutual')
							{
								$(el).addClass('match f-mutual').insertBefore( $('#searchUsers .u-item').first() );
							}
							if( status == 'askedMe' ) 
							{
								if( $('#searchUsers .u-item.f-mutual').length == 0 )
								{
									$(el).addClass('match f-askedme').insertBefore( $('#searchUsers .u-item').first() );
								}
								else
								{
									$(el).addClass('match f-askedme').insertAfter( $('#searchUsers .u-item.f-mutual').last() );
								}
							}
							if( status == 'askedHim'  )
							{
								if( $('#searchUsers .u-item.f-askedme').length == 0 )
								{
									if( $('#searchUsers .u-item.f-mutual').length == 0 )
									{
										$(el).addClass('match f-askedhim').insertBefore( $('#searchUsers .u-item').first() );
									}
									else
									{
										$(el).addClass('match f-askedhim').insertAfter( $('#searchUsers .u-item.f-mutual').last() );
									}
								}
								else
								{
									$(el).addClass('match f-askedhim').insertAfter( $('#searchUsers .u-item.f-askedme').last() );
								}
							}
								
						}
					});

					var $items = $('#searchUsers .u-item:not(.filtered)');

					/* Mise à jour des button à partir de .match*/
					$items.addClass('match').css({ 'opacity':'1'}).removeClass('nonei');
					LJ.fn.displayAddUserAsFriendButton();

				}
	
			});


			$('#searchBar input').on('keydown', function(){
				
				sleep(100, function(){

				if( $('#friendsOnly').hasClass('active') && $('#searchBar input').val().length == 0 )
				{
					return $('#friendsOnly').removeClass('active').trigger('click');
				}
					$('.u-item').removeClass('match').css({ opacity: '0' }).addClass('nonei');

					var word = $('#searchUsersWrap').find('input').val().toLowerCase();	

					$('.u-item:not(.filtered)[data-username^="'+word+'"], \
					   .u-item:not(.filtered)[data-userdrink^="'+word+'"], \
					   .u-item:not(.filtered)[data-userage^="'+word+'"]')
						.addClass('match').css({ opacity: '1' }).removeClass('nonei')
						.each( function(i, el){
							nextEl = $('.u-item:not(.filtered)').first();
							while( nextEl.hasClass('match') )
							{
								nextEl = nextEl.next();	
							}
							$(el).insertBefore( nextEl );
						});

					/* Display button state for all .match elements */
					LJ.fn.displayAddUserAsFriendButton();

					/* Cascading opacity */
					$( $('.u-item:not(.match):not(.filtered)')[0] ).removeClass('nonei').css({ opacity: '.5 '});
					$( $('.u-item:not(.match):not(.filtered)')[1] ).removeClass('nonei').css({ opacity: '.4 '});
					$( $('.u-item:not(.match):not(.filtered)')[2] ).removeClass('nonei').css({ opacity: '.3 '});
					$( $('.u-item:not(.match):not(.filtered)')[3] ).removeClass('nonei').css({ opacity: '.15 '});

				});
			});


		$('#searchUsersWrap').on('click', 'button', function(){

			var $button = $(this);

			if( $button.hasClass('onHold') ) return;

			$button.parents('.u-item').addClass('sent');

			var userId = LJ.user._id,
				friendId = $button.parents('.u-item').data('userid');

			var hostIds = [];
			for( var i = 0 ; i < LJ.user.eventsAskedList.length; i++)
			{
				hostIds[i] = $('.eventItemWrap[data-eventid="'+LJ.user.eventsAskedList[i]+'"]').attr('data-hostid');
			}
			LJ.fn.showLoaders();
			LJ.params.socket.emit('friend request in', { userId: userId, friendId: friendId, hostIds: hostIds });
			csl( 'Friending request for : '+friendId );

		});

		},
		handleDomEvents_Management: function(){

			$('#manageEventsWrap i.icon').click(function(){

				if( LJ.state.animatingContent ) return;
				LJ.state.animatingContent = true;

				var askerId = '';
				var $currentItem = $('.a-item.active');

				if( $(this).hasClass('next-right') )
				{
					$nextItem = $currentItem.next();
					askerId = $nextItem.data('askerid');

				}
				else if( $(this).hasClass('next-left') )
				{
					$nextItem = $currentItem.prev();
					askerId = $nextItem.data('askerid');
				}

				LJ.fn.displayAskerItem( $currentItem, $nextItem, askerId );

				/* Highlight friend */
				$('#askersListWrap .activated').removeClass('activated');
				var j = parseInt( $('#askersThumbs div.active').attr('class').match(/head-\d/)[0][5] ); /*Bug quand le nombre > 9 */			
				$('#askersListWrap .imgWrapThumb.team-'+j+':not(.active)').addClass('activated');

			});

			LJ.$body.on('click', '#askersListWrap .imgWrapThumb', function(){
				
				//if( $(this).hasClass('active') ) return;
				
				/* Displaying asker profile */
				var askerId      = $(this).data('askerid'),
					$currentItem = $('.a-item.active'), 
					$nextItem    = $('.a-item[data-askerid="'+askerId+'"]');

				if( $(this).hasClass('next-right') )
				{
					$nextItem = $currentItem.next();
					askerId = $nextItem.data('askerid');

				}
				else if( $(this).hasClass('next-left') )
				{
					$nextItem = $currentItem.prev();
					askerId = $nextItem.data('askerid');
				}

				LJ.fn.displayAskerItem( $currentItem, $nextItem, askerId );

				/* Highlighting friends */

				$('#askersListWrap .activated').removeClass('activated');
				var j = parseInt( $(this).attr('class').match(/head-\d/)[0][5] );		 /*Bug quand le nombre > 9 */			
				$('#askersListWrap .imgWrapThumb.team-'+j+':not(.active)').addClass('activated');				  

			});

			 [ '#cancelEvent', '#suspendEvent' ].forEach( function(item){ 

		 		var $item = $( item );

        		$item.click( function() {

	            		var hostId = LJ.user._id,
	            			eventId = LJ.user.hostedEventId;

        			switch( item ){
        				case '#cancelEvent':
        				LJ.fn.cancelEvent( eventId, hostId );
        				break;

        				case '#suspendEvent':
        				LJ.fn.suspendEvent( eventId, hostId );
        				break;

        				default:
        				break;
        			}

        		});
       		 });

       		  LJ.$askersListWrap.on('click','.btn-chat',function(){

            	var $that = $(this);

            	
            	if(! $that.hasClass('moving') ){
            		$that.addClass('moving');
            		LJ.fn.toggleChatWrapAskers( $that );

            		sleep( LJ.ui.artificialDelay, function(){
            			$that.removeClass('moving');
            		});
            	}
            });	

		},
		handleDomEvents_Contact: function(){

			$('#sendContactForm').click( function(){

				var userId   = LJ.user._id,
					username = $('#contactName').val(),
					email = $('#contactMail').val(),
					bodytext = $('#contactBody').val();

				var data = { userId: userId, username: username, email: email, bodytext: bodytext };

				LJ.fn.showLoaders();
				$(this).addClass('validating-btn');

				LJ.params.socket.emit('send contact email', data);

			});
			
		},
		handleDomEvents_Settings: function(){

			$('#submitSettingsBtn').click(function(){
				LJ.fn.updateSettings();
			});

		}


});

function sleep(ms,cb,p2){setTimeout(function(){cb(p2);},ms)}
function look(json){ return JSON.stringify(json, null, '\t'); }
window.csl = function(msg){
	console.log(msg);
};

window.LJ.fn = _.merge( window.LJ.fn || {}, 

{

		init: function(){

				/*Bind UI action with the proper handler */
				this.handleDomEvents();

				/*Bind UI Animating moves */
				this.initAnimations();

				/* Gif loader and placeholder */
				this.initStaticImages();

				/* Global UI Settings ehanced UX*/
				this.initEhancements();

				/* Init Facebook state */
				this.initFacebookState();

		},
		initFacebookState: function(){

				  FB.getLoginStatus( function( res ){

				  	var status = res.status;
				  	console.log('Facebook status : ' + status);

				  	console.log('status : '+status);
				  	if( status != 'connected' )
				  		 return;

				  	LJ.fn.toastMsg('Compte Facebook détecté, login in...', 'info' );

				  	sleep(1500, function(){

					  	FB.api('/me', function(res){

					  		var facebookId = res.id;
					  		LJ.fn.loginWithFacebook( facebookId );
					  		
					  	});
				  	});
			  	
				  });

		},
		initSocketConnection: function(jwt){

			LJ.params.socket = io.connect({
				query:'token='+jwt
			});

			/* Initialisation des socket.on('event',...); */
			LJ.fn.initSocketEventListeners();

		},
		initAnimations: function(){

			$('#bcm_member').click(function(){

				LJ.fn.displayContent( LJ.$signupWrap, {
					myWayOut: "transition.slideLeftOut",
					myWayIn: "transition.slideRightIn",
					duration:2000
				});
			});

			$('#lost_pw').click(function(){

				LJ.fn.displayContent( LJ.$resetWrap, {
					myWayOut: "transition.fadeOut",
					myWayIn: "transition.fadeIn"
				});
			});

			$('#pw_remember').click(function(){

				LJ.fn.displayContent( LJ.$loginWrap, {
					myWayOut: "transition.fadeOut",
					myWayIn: "transition.fadeIn"
				});
			});

			LJ.$backToLogin.click(function(){

				LJ.fn.displayContent( LJ.$loginWrap, {
					myWayOut: "transition.slideRightOut",
					myWayIn: "transition.slideLeftIn"}
				);
			});

		},
		initStaticImages: function(){

			var $loader = $.cloudinary.image( LJ.cloudinary.loader_id, LJ.cloudinary.displayParamsLoader );
				$loader.appendTo( $('.loaderWrap') );

				LJ.cloudinary.displayParamsLoader.width = 20; /* For mobile use */
			var $mloader = $.cloudinary.image( LJ.cloudinary.m_loader_id, LJ.cloudinary.displayParamsLoader );
				$mloader.appendTo( $('.m-loaderWrap'));

			var $placeholder = $.cloudinary.image( LJ.cloudinary.placeholder_id, LJ.cloudinary.displayParamsPlaceholder );
				$('#pictureWrap').prepend( $placeholder );

		},
		initEhancements: function(){

			(function bindEnterKey(){ //Petite IIEF pour le phun

				$('#loginWrapp').on('keypress','input.input-field',function(e){
					if(e.which=='13'){
						e.preventDefault();
						$('#login').click();
					}
				});

				$('#signupWrapp').on('keypress','input.input-field',function(e){
					if(e.which=='13'){
						e.preventDefault();
						$('#signup').click();
					}
				});

				$('.profileInput, #description').on('change keypress',function(){
					$(this).addClass('modified');
				});

				LJ.$body.on('click', '.themeBtn',function(){
					$(this).addClass('validating-btn');
				});
 
				LJ.$body.on('focusout', '.askInMsgWrap input', function(e){
					if($(this).val().trim().length===0){
						$(this).removeClass('text-active').val('');}
					else{$(this).addClass('text-active');}
				}); 

				LJ.$body.on('mousedown','.chatWrap',function(){
					var $that = $(this);
	                $that.find('input[type="text"]').focus();
               		
            	});

            	LJ.$body.on('keypress','.chatInputWrap input[type="text"]', function(e){
            		if(e.which=='13'){
            			$(this).siblings('input[type="submit"]').click();
            		}
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
		signupUser: function(credentials){

		    credentials = {} ;

			credentials.email = LJ.$emailInputSignup.val();
			credentials.password = LJ.$passwordInputSignup.val();	
			//csl("Posting this : " +JSON.stringify(credentials,0,4))

			LJ.$backToLogin.velocity("transition.slideLeftOut", { duration:300 });
			LJ.fn.showLoaders();
			$('input.input-field').addClass('validating');

			if( "" ===  $('#pwSignup').val().trim() || "" === $('#pwCheckSignup').val().trim() || "" === $('#emailSignup').val().trim() ){
				return LJ.fn.handleFailedSignup( { msg: "Il manque un champs!" });
			}

			if( $('#pwSignup').val() != $('#pwCheckSignup').val() ){
				return LJ.fn.handleFailedSignup( { msg: "Les mots se passe sont différents" });
			}

			$.ajax({

				method:'POST',
				url:'/signup',
				dataType:'json',
				data: {
					email    : credentials.email,
					password : credentials.password
				},
				success: function(data){
					data.email    = credentials.email;
					data.password = credentials.password;
					LJ.fn.handleSuccessSignup(data);

				},
				error: function(data){
					LJ.fn.handleFailedSignup(data);
				}
			});
		},
		loginUser: function(credentials){

			    credentials = credentials || {} ;

				credentials.email    = credentials.email    || LJ.$emailInput.val();
				credentials.password = credentials.password || LJ.$passwordInput.val();

			$.ajax({
				method:'POST',
				url:'/login',
				dataType:'json',
				data : {
					email   :  credentials.email,
					password : credentials.password
				},
				beforeSend: function(){
					LJ.fn.handleBeforeSendLogin();
				},
				success: function( data ){
					LJ.fn.handleSuccessLogin( data );
				},
				error: function( data ){
					LJ.fn.handleFailedLogin( data );
				}
			});
		},
		resetPassword: function(){

			var email = $('#pwResetInput').val().trim();

			LJ.fn.showLoaders();
			$('#resetWrapp input[type="submit"]').addClass('validating-btn');
			$('#pw_remember').velocity('transition.slideRightOut', { duration: 300 });

			$.ajax({
				method:'POST',
				url:'/reset',
				dataType:'json',
				data: {
					email: email
				},
				success: function(data){
					LJ.fn.handleSuccessReset(data);
				},
				error: function(data){
					LJ.fn.handleFailedReset(data);
				}
			});

		},
		updateProfile: function(){

			var _id 		  = LJ.user._id,
				age   		  = $('#age').val(),
				name  		  = $('#name').val(),
				description   = $('#description').val(),
				favoriteDrink = $('.drink.modified').data('drink') || $('.drink.selected').data('drink'),
				mood          = $('.mood.modified').data('mood')   || $('.mood.selected').data('mood');

			if( LJ.user.status == 'new' ){ LJ.user.status = 'idle'; }

			var profile = {

				_id			  : _id,
				age 		  : age,
				name 		  : name,
				description   : description,
				favoriteDrink : favoriteDrink,
				mood          : mood,
				status        : LJ.user.status,

			};
				csl('Emitting update profile');
				LJ.fn.showLoaders();
				LJ.params.socket.emit('update profile', profile);

		},
		updateSettings: function(){

			var currentEmail    = $('#currentEmail').val(),
				newPw 	   		= $('#newPw').val(),
				newPwConf  		= $('#newPwConf').val(),
				newsletter 		= $('#newsletter').is(':checked'),
				userId     		= LJ.user._id;

			var o = { currentEmail: currentEmail, newPw: newPw, newPwConf: newPwConf, newsletter: newsletter, userId: userId }; 

			LJ.fn.showLoaders();
			LJ.params.socket.emit('update settings', o);

		},
		swapNodes: function( a, b ){

		    var aparent = a.parentNode;
		    var asibling = a.nextSibling === b ? a : a.nextSibling;
		    b.parentNode.insertBefore(a, b);
		    aparent.insertBefore(b, asibling);

		},
		handleBeforeSendLogin: function(){

			LJ.$loginBtn.val('Loading');
			LJ.$loginBtn.addClass('validating-btn');
			LJ.fn.showLoaders();
			$('#bcm_member').velocity('transition.slideRightOut', { duration: 500 });
			$('#lost_pw').velocity('transition.slideLeftOut', { duration: 500 });
			$('input.input-field').addClass('validating');

		},
		loginWithFacebook: function( facebookId ){

				$.ajax({

					method:'POST',
					data: { facebookId: facebookId },
					dataType:'json',
					url:'/auth/facebook',
					success: function(data){

						LJ.fn.handleSuccessLogin( data );

					},
					error: function(err){

					}
				});

		},
		handleSuccessLogin: function( user ){

			LJ.user._id = user._id; /* Nécessaire pour aller chercher toutes les infos, mais par socket.*/
			LJ.fn.initSocketConnection( user.token );
			LJ.$loginWrap.find('.header-field').addClass('validated');

		},
		handleFailedLogin: function(data){

			csl('handling fail login');
			data = JSON.parse( data.responseText );

			sleep( LJ.ui.artificialDelay, function(){

				LJ.fn.handleServerError( data.msg );
				$('#bcm_member').velocity('transition.slideRightIn', { duration: 400, display:"inline-block" });
				$('#lost_pw').velocity('transition.slideLeftIn', { duration: 400, display:"inline-block" });
				LJ.$loginBtn.val('Login');

			});

		},
		handleSuccessSignup: function(data){

			sleep(LJ.ui.artificialDelay,function(){

				LJ.fn.hideLoaders();
				LJ.fn.loginUser(data);

			});		

		},
		handleFailedSignup: function(data){

			if ( data.responseText )
				data = JSON.parse(data.responseText);

			var errorMsg = data.msg;

			sleep(LJ.ui.artificialDelay,function(){

				LJ.fn.handleServerError( errorMsg );
				LJ.$backToLogin.velocity('transition.slideRightIn', { duration: 400 });

			});

		},
		handleSuccessReset: function(data){

			sleep(LJ.ui.artificialDelay,function(){

				LJ.fn.hideLoaders();
				$('input.input-field').removeClass('validating');
				$('#email').val( $('#pwResetInput').val() );

				LJ.fn.displayContent( LJ.$loginWrap );

				sleep(1000, function(){
					LJ.fn.toastMsg( data.msg , 'info');
					$('#pwResetInput').val('');
					$('#pw_remember').velocity('transition.slideRightIn', { duration: 400 });
				
				});

			});		

		},
		handleFailedReset: function(data){

			if ( data.responseText )
				data = JSON.parse(data.responseText);

			var errorMsg = data.msg;

			sleep(LJ.ui.artificialDelay,function(){

				LJ.fn.handleServerError( errorMsg );
				$('#pw_remember').velocity('transition.slideRightIn', { duration: 400 });

			});

		},
		displayViewAsFrozen: function(){

			$('.eventItemWrap').remove();
			LJ.myEvents = [];

			$('.eventsHeader').velocity('transition.slideUpOut', 
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
				  	$('.eventsHeader').velocity('transition.slideUpIn', { duration: 700 });
				}
			});

		},
		displayViewAsNew: function(){
			
			$('#management').addClass('filtered');
			$('#profile').addClass('menu-item-active')
            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

            $('#landingWrap, #signupWrapp').velocity({ opacity: [0, 1]}, { complete: function(){ $('#landingWrap, #signupWrapp').addClass('nonei');}});
			LJ.fn.displayContent( LJ.$profileWrap, { myWayIn: 'transition.slideDownIn', myWayOut: 'transition.slideUpOut' });

		},
		displayViewAsIdle: function(){

			$('#management').addClass('filtered');
            $('#events').addClass('menu-item-active')
            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

            $('#landingWrap, #signupWrapp').velocity({ opacity: [0, 1]}, { complete: function(){ $('#landingWrap, #signupWrapp').addClass('nonei');}});
            LJ.fn.displayContent( LJ.$eventsWrap, { myWayIn: 'transition.slideDownIn', myWayOut: 'transition.slideUpOut'  });

		},
		displayViewAsHost: function(){

			$('#create').addClass('filtered');
			$('#management').addClass('menu-item-active')
            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

            $('#landingWrap, #signupWrapp').velocity({ opacity: [0, 1]}, { complete: function(){ $('#landingWrap, #signupWrapp').addClass('nonei');}});
			LJ.fn.displayContent( LJ.$manageEventsWrap, { myWayIn: 'transition.slideDownIn', myWayOut: 'transition.slideUpOut'  });

            LJ.fn.fetchAskers();
		},
		displayUserSettings: function(){

				/* Profile View*/
				$('#codebar').text( LJ.user._id );
				$('#name').val( LJ.user.name );
				$('#age').val( LJ.user.age );
				$('#description').val( LJ.user.description );
				$('.drink[data-drink="'+LJ.user.favoriteDrink+'"]').addClass('selected');
				$('.mood[data-mood="'+LJ.user.mood+'"]').addClass('selected');

				/* Update de l'image de profile */
				LJ.fn.replaceMainImage( LJ.user.imgId,
								            LJ.user.imgVersion,
								            LJ.cloudinary.displayParamsProfile );

				/* Settings View */
				$('#newsletter').prop( 'checked', LJ.user.newsletter );
				$('#currentEmail').val( LJ.user.email );

				/* Management View */
				if( LJ.user.state == 'hosting' )
				{
					$('#suspendEvent').text('this is a bug');
				}

				/* ThumbHeader View */
				LJ.$thumbWrap.find( 'h2#thumbName' ).text( LJ.user.name );
				var d = LJ.cloudinary.displayParamsHeaderUser;
					d.version = LJ.user.imgVersion;

				var imgTag = $.cloudinary.image( LJ.user.imgId, d );
					imgTag.addClass('left');

				LJ.$thumbWrap.find('.imgWrap').html('').append( imgTag );

		},
		displayContent: function( content, options ){
			
				options = options || {};			
				var rev = $('.revealed');

				rev.velocity( options.myWayOut || 'transition.fadeOut', {
					duration: options.duration || 400,
					complete: function(){
						rev.removeClass('revealed');
						content.addClass('revealed')
							   .velocity( options.myWayIn || 'transition.fadeIn', {
							   	duration: 800,
							   	display:'block',
							   	complete: function(){
							   		LJ.state.animatingContent = false;
							   		if(LJ.user.status === 'new'){
							   			LJ.fn.toggleOverlay('high', LJ.tpl.charte );
							   		}
							   	}
							   });
					}
				});

		},
		toggleChatWrapAskers: function( aBtn ){

			var $aWrap      = aBtn.parents('.a-item'),
			    $chatWrap  = $aWrap.find('.chatWrap'),
        	    $previous  = $('.a-active'),
        		$surfacing = $('.surfacing');

        	var chatId = $chatWrap.data('id');

        	 if( !$surfacing )
			     {
			     	$aWrap.addClass('surfacing')
			     			  .find('.chatWrap')
			     			  .velocity('transition.slideLeftIn', { duration: 400 });
			     	return;
			     }

		     if( $surfacing.is( $aWrap ))
		     {
		     	$aWrap.removeClass('surfacing')
		     			  .find('.chatWrap')
		     			  .velocity('transition.slideLeftOut', { duration: 300 });
		     	return;
		     }

    		$surfacing.removeClass('surfacing')
    				  .find('.chatWrap')
    				  .velocity('transition.slideLeftOut', { duration: 300 });

    		$aWrap.addClass('surfacing')
    				  .find('.chatWrap')
    				  .velocity('transition.slideLeftIn', { duration: 400 });

    		sleep(30, function(){ 
    			if( LJ.state.jspAPI[chatId] !== undefined )
    			{
           		  LJ.state.jspAPI[chatId].reinitialise();
        		  LJ.state.jspAPI[chatId].scrollToBottom();   
    			} 
    		});

		},
		toggleChatWrapEvents: function( chatIconWrap ){

			var $eventWrap = chatIconWrap.parents('.eventItemWrap'),
			    $chatWrap  = $eventWrap.find('.chatWrap'),
			    $previous  = $('.prev'),
			    $surfacing = $('.surfacing'); 

			$('#friendListWrap').velocity('transition.slideUpOut', { duration: 300 });
			$('.friendAddIconWrap.active').removeClass('active');

			var chatId = $chatWrap.data('chatid');

			     if( !$surfacing )
			     {
			     	chatIconWrap.addClass('active');
			     	$eventWrap.addClass('surfacing')
			     			  .find('.chatWrap')
			     			  .velocity('transition.slideUpIn', { duration: 550 });
			     	return;
			     }

			     if( $surfacing.is( $eventWrap ))
			     {
			     	chatIconWrap.removeClass('active');
			     	$eventWrap.removeClass('surfacing') 
			     			  .find('.chatWrap')
			     			  .velocity('transition.slideUpOut', { duration: 300 });
			     	return;
			     }

			    $('.chatIconWrap').removeClass('active');
			    chatIconWrap.addClass('active');

        		$surfacing.removeClass('surfacing')
        				  .find('.chatWrap')
        				  .velocity('transition.slideUpOut', { duration: 300 });

        		$eventWrap.addClass('surfacing')
        				  .find('.chatWrap')
        				  .velocity('transition.slideUpIn', { duration: 550 });

        		sleep( 30, function(){ 
        			if( LJ.state.jspAPI[chatId] !== undefined ){ 
	           		  LJ.state.jspAPI[chatId].reinitialise();
	        		  LJ.state.jspAPI[chatId].scrollToBottom();   
        			} 
        		});
             
		},
		initAppSettings: function(data){

			var user     = data.user,
				settings = data.settings;

			/* Init user settings */
            LJ.user = user;	

            /* Init app settings */
            LJ.settings = settings;

		},
		updateClientSettings: function(newSettings){

			_.keys(newSettings).forEach(function(el){
				LJ.user[el] = newSettings[el];
			});
		},
		toastMsg: function(msg, status, fixed){

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

			if( $( '.toast' ).length === 0 ){
				$( tpl ).prependTo('#mainWrap');
				    toast = $( toastStatus );
					toastMsg = toast.find('.toastMsg');
					toastMsg.text( msg );
					toast.velocity('transition.slideDownIn', {
					duration: 600,
					complete: function(){
					  if( !fixed ){
						toast.velocity('transition.slideUpOut', {
							duration:300,
							delay:2000,
							complete: function(){
								toast.remove();
							}
							});
						}
					  }
					});
			}

			else{
				toast = $( '.toast' );
				toast.finish().velocity('transition.slideUpOut',{
					duration: 200,
					complete: function(){
						toast.remove();
						LJ.fn.toastMsg( msg, status );
					}
				});
			}
		},
		replaceMainImage: function( imgId, imgVersion, d ){

		    	d.version = imgVersion;

			var $previousImg = $('#pictureWrap').find('img'),
				$newImg      = $.cloudinary.image( imgId, d ); 
				$newImg.addClass('mainPicture').addClass('none');
				$('#pictureWrap').prepend( $newImg );
 													
				$previousImg.velocity('transition.fadeOut', { 
					duration: 600,
					complete: function(){
						$newImg.velocity('transition.fadeIn', { duration: 700, complete: function(){} });
						$previousImg.remove();
					} 
				});

		},
		replaceThumbImage: function( id, version, d ){

			    d = d || LJ.cloudinary.displayParamsHeaderUser;
				d.version = version;

			var previousImg = $('#thumbWrap').find('img'),
				newImg      = $.cloudinary.image(id,d);
				newImg.hide();

				$('#thumbWrap').prepend( newImg );

				previousImg.fadeOut(700, function(){
					$(this).remove();
					newImg.fadeIn(700);
				});
		},
		initCloudinary: function(upload_tag){

			$.cloudinary.config( LJ.cloudinary.uploadParams );
			LJ.tpl.$placeholderImg = $.cloudinary.image( LJ.cloudinary.placeholder_id, LJ.cloudinary.displayParamsEventAsker );

			$('.upload_form').html('').append( upload_tag );

			$('.cloudinary-fileupload')

				.bind('fileuploadstart', function(){

					LJ.fn.showLoaders();

				})
				.bind('fileuploadprogress', function( e, data ){

  					$('.progress_bar').css('width', Math.round( (data.loaded * 100.0) / data.total ) + '%');

				}).bind('cloudinarydone',function( e, data ){

  							sleep( LJ.ui.artificialDelay,function(){

  								$('.progress_bar').velocity('transition.slideUpOut', {
  								 	duration: 400,
  								 	complete: function(){
  								 		$(this).css({ width: '0%' })
  								 			   .velocity('transition.slideUpIn');
  									} 
  								});

  								LJ.fn.hideLoaders();
  								LJ.fn.toastMsg('Votre photo de profile a été modifiée', 'info');

  								var imgId      = data.result.public_id;
  								var imgVersion = data.result.version;

                                LJ.user.imgVersion = imgVersion;
                                LJ.user.imgId      = imgId;

  								LJ.params.socket.emit('update picture', {
																			_id        : LJ.user._id,
																			imgId      : imgId,
																			imgVersion : imgVersion 
  																		});

  								LJ.fn.replaceMainImage( imgId, imgVersion, LJ.cloudinary.displayParamsProfile );
  								LJ.fn.replaceThumbImage( imgId, imgVersion, LJ.cloudinary.displayParamsHeaderUser );
					
  							});

  				}).cloudinary_fileupload();
  				
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

			var $askerThumb = $('#askersThumbs').find('.imgWrapThumb[data-askerid="'+askerId+'"]');
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
        initLayout: function( settings ){

        	/* Mise à jour dynamique des filters */
        	$( '.tags-wrap' ).html('').append( LJ.fn.renderTagsFilters() );
        	$( '.locs-wrap' ).html('').append( LJ.fn.renderLocsFilters() );
        	$( '#eventsListWrap' ).html('').append( LJ.tpl.noResult );

        	$('#friendListWrap').jScrollPane();
        	LJ.state.jspAPI['#friendListWrap'] = $('#friendListWrap').data('jsp');

			/* Affichage de la vue en fonction du state user */
        	sleep( LJ.ui.artificialDelay, function(){   

				if( LJ.state.connected ) return LJ.fn.toastMsg('Vous avez été reconnecté', 'success');
				
				LJ.state.connected = true;
				LJ.fn.toastMsg('Bienvenue '+LJ.user.name,'info');

				$('#thumbWrap').velocity('transition.slideUpIn');
				$('.menu-item-active').removeClass('menu-item-active');
				 
				switch( LJ.user.status )
				{
					case 'new':
						LJ.params.socket.emit('request welcome email', LJ.user._id );
						LJ.fn.displayViewAsNew();
						break;
					case 'idle':
						LJ.fn.displayViewAsIdle();
						break;
					case 'hosting':
						LJ.fn.displayViewAsHost();
						break;
					default:
						alert('No status available, contact us');
						break;
				}

				sleep( 2400, function() {
					
					$('.menu-item').velocity({ opacity: [1, 0] }, {
						display:'inline-block',
						duration: 800,
						complete: function(){
							$('.menu-item').each( function( i, el ){
								$(el).append('<span class="bubble filtered"></span>')
							});	
						}
					});
				});

			});

        },
        handleServerSuccess: function( msg ){

        	LJ.fn.toastMsg( msg, 'info');
        				if( $('.mood.modified').length != 0 ) $('.mood.selected').removeClass('selected');
        				if( $('.drink.modified').length != 0 ) $('.drink.selected').removeClass('selected');
        				$('.modified').removeClass('modified').addClass('selected');
        				$('.validating').removeClass('validating');
						$('.validating-btn').removeClass('validating-btn');
						$('.asking').removeClass('asking');
						$('.pending').removeClass('pending');
						LJ.fn.hideLoaders();

        },
        handleServerError: function( msg ){

        	LJ.fn.toastMsg( msg, 'error');
        				$('.validating').removeClass('validating');
						$('.validating-btn').removeClass('validating-btn');
						$('.asking').removeClass('asking');
						$('.pending').removeClass('pending');
						LJ.fn.hideLoaders();

        },
		initSocketEventListeners: function(){

				LJ.params.socket.on('connect', function(){

					csl('Client authenticated on the socket stream');
					var userId = LJ.user._id;

					/* Request all informations */
					LJ.params.socket.emit('fetch user and configuration', userId );

				});

				LJ.params.socket.on('refetch askers success', function( askers ){
					csl('Refetch askers success, askers = ' + askers );
					LJ.myAskers = askers;
					LJ.fn.addFriendLinks();
					$('#askersListWrap div.active').click(); // force update
					LJ.fn.refreshArrowDisplay();
				});


				LJ.params.socket.on('terminate events', function(){

					LJ.fn.toastMsg('Les évènements sont maintenant terminés!', 'info');
					LJ.fn.displayViewAsFrozen();

				});

				LJ.params.socket.on('restart events', function(){

					LJ.fn.toastMsg('Les évènements sont à présent ouverts!', 'info');
					LJ.fn.displayViewAsNormal();


				});

				LJ.params.socket.on('fetch user and configuration success', function( data ){

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
					LJ.fn.hideLoaders();

					var user 	 = data.user,
						settings = data.settings;

					LJ.fn.initAppSettings( data, settings );
					LJ.fn.displayUserSettings();

					LJ.fn.initRooms( LJ.user._id );					
					LJ.fn.initCloudinary( user.cloudTag );
					LJ.fn.initLayout( settings );

					LJ.fn.fetchEvents();
					LJ.fn.fetchUsers();
					LJ.fn.fetchFriends();

				});

				LJ.params.socket.on('update profile success', function(data){

					csl('update profile success received');

					sleep( LJ.ui.artificialDelay, function(){

						LJ.fn.updateClientSettings( data );
						$('#thumbName').text( data.name );
						LJ.fn.handleServerSuccess('Vos informations ont été modifiées');
				
						});

				});

				LJ.params.socket.on('update image success', function( data ){

					LJ.fn.updateClientSettings(data);
					csl(JSON.stringify(data,0,4));
				});

				LJ.params.socket.on('create event success', function( myEvent ){
					
					var eventId = myEvent._id,
						hostId = myEvent.hostId;
					
					sleep( LJ.ui.artificialDelay , function(){ 


						if( LJ.user._id === hostId )
						{
								LJ.user.status = 'hosting';
								LJ.fn.displayMenuStatus( function(){ $('#management').click(); } );
								LJ.user.hostedEventId = eventId;
								LJ.fn.hideLoaders();
								$('.themeBtn').removeClass('validating-btn');
								LJ.$createEventWrap.find('input, #eventDescription').val('');
								LJ.$createEventWrap.find('.selected').removeClass('selected');
								LJ.fn.refreshArrowDisplay();
						}
						else
						{	
							/* Réagir si un ami créé un évènement, MAJ les buttons */ 
							LJ.fn.toastMsg( myEvent.hostName + ' a créé un évènement !', 'info' );
							LJ.fn.bubbleUp( '#events' );
						}
 
						LJ.fn.insertEvent( myEvent );
						$('#refreshEventsFilters').click();

					});
				});

				LJ.params.socket.on('change state event success', function( data ){
					
					sleep( LJ.ui.artificialDelay , function(){ 

						var eventState = data.myEvent.state,
							eventId    = data.eventId;

						switch( eventState ){

						case 'canceled':
							LJ.fn.handleCancelEvent( data );
						break;

						case 'suspended':
							LJ.fn.handleSuspendEvent( data, 'suspended' );
						break;

						case 'open':
							LJ.fn.handleSuspendEvent( data, 'open' );
						break;

						default:
							LJ.fn.toastMsg('Strange thing happend', 'error');
						break;

						}

					});				

		        });

				LJ.params.socket.on('fetch user success', function( data ){ console.log(data); });

				LJ.params.socket.on('friend already in', function( data ){
					
					csl('Friend already in');
					sleep( LJ.ui.artificialDelay, function(){

						LJ.fn.hideLoaders();
						LJ.fn.displayAddFriendToPartyButton();
						LJ.fn.toastMsg('Votre ami s\'est ajouté à l\évènement entre temps', 'info');
					});

				});
 
				LJ.params.socket.on('fetch events success', function( events ){

					LJ.state.fetchingEvents = false;
					var L = events.length;

					for( var i=0; i<L; i++ ){

						LJ.myEvents[i] = events[i];
						LJ.myEvents[i].createdAt = new Date( events[i].createdAt );
						LJ.myEvents[i].beginsAt  = new Date( events[i].beginsAt );
					}

					/* L'array d'event est trié à l'initialisation */
					LJ.myEvents.sort( function( e1, e2 ){
						return e1.beginsAt -  e2.beginsAt ;
					});

					LJ.fn.displayEvents();
				});

				LJ.params.socket.on('request participation in success', function( data ){

					var hostId  	= data.hostId,
						userId 		= data.userId,
						eventId 	= data.eventId,
						requesterId = data.requesterId,
						asker   	= data.asker;						

					sleep( LJ.ui.artificialDelay, function(){

						LJ.fn.bubbleUp( '#management' )

						var d = LJ.cloudinary.displayParamsEventAsker;
							d.version = asker.imgVersion;

						var $askerImg = LJ.fn.renderAskerInEvent( asker.imgId, { dataList: [{ dataName: 'askerid', dataValue: asker._id }]});
						var $askedInWrap = $('.eventItemWrap[data-eventid="'+eventId+'"]').find('.askedInWrap');
							$askedInWrap.prepend( $askerImg );
							//$askedInWrap.find('img').last().remove();

						
							if( LJ.user._id == requesterId && LJ.user._id == userId )
							{
								LJ.fn.hideLoaders();
								LJ.fn.toastMsg('Votre demande a été envoyée', 'info');
								 $('.asking').removeClass('asking').removeClass('idle').addClass('asked').text('En attente')
										  .siblings('.chatIconWrap, .friendAddIconWrap').velocity('transition.fadeIn');
							}

							if( LJ.user._id != requesterId && LJ.user._id == userId )
							{
								LJ.fn.toastMsg('Un ami vous a ajouté à une soirée', 'info');
								$('.eventItemWrap[data-eventid="'+eventId+'"]').find('.askIn')
								          .removeClass('asking').removeClass('idle').addClass('asked').text('En attente')
										  .siblings('.chatIconWrap, .friendAddIconWrap').velocity('transition.fadeIn');
							}

							if( LJ.user._id == requesterId && LJ.user._id != userId )
							{
								LJ.fn.toastMsg('Votre ami a été ajouté', 'info');
								LJ.fn.hideLoaders();
								LJ.fn.displayAddFriendToPartyButton();
							}

						/* Pour l'host */
						if( LJ.user._id == hostId )
						{

							LJ.myAskers.push( asker );

							var askerMainHTML  = LJ.fn.renderAskerMain( asker ),
								askerThumbHTML = LJ.fn.renderAskerThumb ({ asker: asker });

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

								LJ.fn.refetchAskers();
							    LJ.fn.refreshArrowDisplay();
						}

						var $nbAskers = $('.eventItemWrap[data-eventid="'+eventId+'"]').find('.e-guests span.nbAskers');
							$nbAskers.text( parseInt( $nbAskers.text() ) + 1 );

					});

				});

				LJ.params.socket.on('request participation out success', function(data){

						console.log( data.asker.name +' asked out' );

						var userId  	= data.userId,
							hostId  	= data.hostId,
							eventId 	= data.eventId,
							asker   	= data.asker,
							requesterId = data.requesterId;


						var chatId = LJ.fn.buildChatId( eventId, hostId, userId ),
						    $aItemMain = LJ.$askersListWrap.find('.a-item[data-askerid="'+userId+'"]'),
						    $chatWrapAsHost = LJ.$askersListWrap.find('.chatWrap[data-chatid="'+chatId+'"]'),
						    $chatWrapAsUser = LJ.$eventsListWrap.find('.chatWrap[data-chatid="'+chatId+'"]');

						_.remove( LJ.myAskers, function( asker ){
							return asker._id === data.userId;
						});

						sleep( LJ.ui.artificialDelay, function(){

							LJ.fn.hideLoaders();

							/* Pour l'Host */
							if( hostId === LJ.user._id)
							{		
									$('.imgWrapThumb[data-askerid="' + asker._id + '"]').remove();
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

							
							var $nbAskers = $('.eventItemWrap[data-eventid="'+eventId+'"]').find('.e-guests span.nbAskers');
								$nbAskers.text( parseInt( $nbAskers.text() ) - 1 );

							$('.eventItemWrap[data-eventid="'+eventId+'"]').find('.askedInWrap')
																		   .find('img[data-askerid="'+asker._id+'"]')
																		   .remove(); 
						});
	
				});

				LJ.params.socket.on('accept asker success', function( data ){

					csl('Asker has been accepted');

					var eventId = data.eventId,
						hostId  = data.hostId,
						askerId = data.askerId;

					/* For everyone */
					var $nbAskers = $('.eventItemWrap[data-eventid="'+eventId+'"]').find('.e-guests span.nbAskers');
							$nbAskers.text( parseInt( $nbAskers.text() ) + 1 );

					/* Host exclusively */
					if( hostId = LJ.user._id )
					{

					}

				});

				LJ.params.socket.on('update settings success', function(data){

					sleep( LJ.ui.artificialDelay, function(){
						LJ.fn.toastMsg( data.msg, 'info');
						$('.validating-btn').removeClass('validating-btn');
						LJ.fn.hideLoaders();
					});

				});

				LJ.params.socket.on('send contact email success', function(){

					sleep( LJ.ui.artificialDelay, function(){
						LJ.fn.toastMsg( "Merci beaucoup!", 'info');
						$('.validating-btn').removeClass('validating-btn');
						LJ.fn.hideLoaders();
					});

				});

				LJ.params.socket.on('server error', function( data ){

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

				LJ.params.socket.on('disconnect', function(){

					LJ.fn.toastMsg("Quelque chose s'est produit, vous avez été déconnecté", 'error', true);
					LJ.params.socket.disconnect(LJ.user._id);

				});

                LJ.params.socket.on('fetch askers success', function( data ){
                	
                    LJ.state.fetchingAskers = false;
                    LJ.myAskers = data.askersList;

                    LJ.fn.displayAskers();   
                    LJ.fn.refetchAskers();

                });

                LJ.params.socket.on('receive message', function( data ){

                	LJ.fn.addChatLine(data);

                });

                LJ.params.socket.on('fetch friends success', function( data ){

                	csl('Friends fetched');
                	LJ.myFriends = data;

                	$('#myFriends').html( LJ.fn.renderUsersInFriendlist() );

                	LJ.fn.displayAddFriendToPartyButton();

                	if( LJ.nextCallback.context == 'fetch friends' )
                	{	
                		csl('Calling method, context detected');
                		LJ.nextCallback.fn();
                		LJ.nextCallback = {};
                	}
 
                });

                LJ.params.socket.on('fetch users success', function( data ){

                	csl('Users fetched');
                	LJ.myUsers = _.shuffle( data ); /*Not to have always the same user first*/
                    $('#searchUsers').html( LJ.fn.renderUsersInSearch() );

                    $( $('.u-item:not(.match)')[0] ).removeClass('none').css({ opacity: '.5 '});
					$( $('.u-item:not(.match)')[1] ).removeClass('none').css({ opacity: '.4 '});
					$( $('.u-item:not(.match)')[2] ).removeClass('none').css({ opacity: '.3 '});
					$( $('.u-item:not(.match)')[3] ).removeClass('none').css({ opacity: '.15 '});

                });

                LJ.params.socket.on('friend request in success host', function( data ){

                	var userId     = data.userId,
                		friendId   = data.friendId;

                	/* Host checks if he has to update his friendLinks, hence reload friends status*/
                	if( LJ.myAskers.length != 0 )
                	{
                		var askersId = _.pluck( LJ.myAskers, '_id' );
                		if( askersId.indexOf( userId ) != -1 && askersId.indexOf( friendId ) != -1 )
                			{ LJ.fn.refetchAskers(); }
                	}

                });

                LJ.params.socket.on('friend request in success', function( data ){

                	var userId     = data.userId,
                		friendId   = data.friendId,
                		upType     = data.updateType,
                		friendList = data.friendList;

                	/* Host checks if he has to update his friendLinks, hence reload friends status*/
                	if( LJ.myAskers.length != 0 )
                	{
                		var askersId = _.pluck( LJ.myAskers, '_id' );

                		if( askersId.indexOf( userId ) != -1 && askersId.indexOf( friendId ) != -1 )
                			{ LJ.fn.refetchAskers(); }

                	}

                	LJ.user.friendList = data.friendList;
					
					LJ.nextCallback.context = 'fetch friends';
					LJ.nextCallback.fn = function(){
                		 
                		csl('Calling function');
						sleep( LJ.ui.artificialDelay, function(){

						LJ.fn.displayAddUserAsFriendButton();

							if( upType == 'askedhim' )
							{
								LJ.fn.handleServerSuccess('Votre demande a été envoyée');
								return;
							}

							if( upType == 'askedme' )
							{
								LJ.fn.handleServerSuccess('Vous avez une demande d\'ami');
								LJ.fn.bubbleUp( '#search' )
								return;
							}

							if( (upType == 'mutual') && (userId == LJ.user._id) )
							{
								LJ.fn.handleServerSuccess('Vous êtes à présent amis');
								return;
							}

							if( (upType == 'mutual') && (friendId == LJ.user._id) )
							{
								LJ.fn.handleServerSuccess('Votre demande a été acceptée!');
								LJ.fn.bubbleUp( '#search' )
								return;
							}
						});
					}
					LJ.fn.fetchFriends();
                });
                
		},
		handleCancelEvent: function(data){
			
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
        			}
        		});

        	_.remove( LJ.myEvents, function(el){
        		return el.hostId == data.hostId; 
        	});

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
				$( eventHTML ).insertAfter( $('#noEvents') );
				$('#noEvents').addClass('none');
			}
			// myEvents just got incremented, hence the - 1
			if( idx == LJ.myEvents.length - 1){
				$( eventHTML ).insertAfter( $( $('.eventItemWrap')[idx-1] ) ).addClass('inserted');
			}else{
				$( eventHTML ).insertAfter( $( $('.eventItemWrap')[idx] ) ).addClass('inserted');
			}

		},
		fetchUsers: function(){ LJ.params.socket.emit('fetch users', LJ.user._id ); },
		fetchFriends: function(){ LJ.params.socket.emit('fetch friends', LJ.user._id ); },
		createEvent: function(){

			var tags = [];

			$('#createEventWrap .selected').each( function( i, $el ){
				var tag = $( $el) .attr('class').split(' ')[1].split('-')[1];						 
				tags.push(tag);
			});

			var e = {};
				e.hostId	  	  = LJ.user._id;
				e.hostName   	  = LJ.user.name;
				e.hostImgId 	  = LJ.user.imgId;
				e.hostImgVersion  = LJ.user.imgVersion;
				e.name 		  	  = $('#eventName').val();
				e.location    	  = $('#eventLocation').val();
				e.hour 		  	  = $('#eventHour').val();
				e.min  		  	  = $('#eventMinut').val();
				e.description 	  = $('#eventDescription').val();
				e.maxGuest        = $('#eventMaxGuest').val();
				e.tags            = tags;

				LJ.fn.showLoaders();
				LJ.params.socket.emit('create event', e);
		},
		fetchEvents: function(){

			if( LJ.state.fetchingEvents )
			{ 
				LJ.fn.toastMsg('Already fetching events', 'error');
			}
			else
			{
				LJ.state.fetchingEvents = true;
                LJ.params.socket.emit('fetch events', LJ.user._id );
            }
		},
        fetchAskers: function(){

            if( LJ.state.fetchingAskers )
            {
                LJ.fn.toastMsg("Already fetching askers", 'error');
            }
            else
            {
                LJ.state.fetchingAskers = true;
                LJ.params.socket.emit('fetch askers',{ eventId: LJ.user.hostedEventId, hostId: LJ.user._id });
            }

        },
        displayEvents: function(){

        	/* Mise à jour de la vue des évènements */
	        	var hour = (new Date()).getHours();
	        	if( hour < LJ.settings.eventsRestartAt && hour >= LJ.settings.eventsTerminateAt ){
        			csl('Displaying events frozen state');
	        		return LJ.fn.displayViewAsFrozen();
	        	}     		

            LJ.$eventsListWrap.html( LJ.fn.renderEvents( LJ.myEvents ) );
            $('.eventItemWrap').velocity("transition.slideLeftIn", {
            	display:'inline-block'
            });

        },
        displayAskers: function(){

            $('#askersMain').html('').append( LJ.fn.renderAskersMain() );
            $('#askersThumbs').html('').append( LJ.fn.renderAskersThumbs() );

            LJ.fn.refreshArrowDisplay();

        },
        refetchAskers: function(){

        	var idArray = _.pluck( LJ.myAskers, '_id' );
        	LJ.params.socket.emit('refetch askers', { userId: LJ.user._id, idArray: idArray });

        },
        addFriendLinks: function(){

        	var idArray = _.pluck( LJ.myAskers, '_id' );
	
        	for( var i = 0; i < LJ.myAskers.length ; i ++ )
        	{	
        		$('#askersThumbs .team-'+i).removeClass('team-'+i);
        		$('#askersThumbs .head-'+i).removeClass('head-'+i);
        		
        		console.log('Browsing for : '+ LJ.myAskers[i].name );
        		$('#askersThumbs div[data-askerid="'+ LJ.myAskers[i]._id +'"]').addClass('team-'+i).addClass('head-'+i);
        		
        		for( var k = 0 ; k < LJ.myAskers[i].friendList.length ; k++ )
        		{	
        			if( idArray.indexOf( LJ.myAskers[i].friendList[k].friendId ) == -1 )
        			{
        				console.log( 'Friend n° : '+k+'  '+LJ.myAskers[i].friendList[k].name + ' is not in the event' );
        			}
        			else
        			{	
        				console.log( LJ.myAskers[i].friendList[k].name + ' is in the event, status : ' + LJ.myAskers[i].friendList[k].status );
        				if( LJ.myAskers[i].friendList[k].status == 'mutual' )
        				{	
        					console.log('Adding link team-'+i+' , for  ' + LJ.myAskers[i].friendList[k].name );
        					$('#askersThumbs div[data-askerid="'+ LJ.myAskers[i].friendList[k].friendId+'"]').addClass('team-'+i);		  
        				}
        			}
        		} 
        	}
        	

        },
        filterEvents: function(tags, locations){

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

	        	console.log('Events to display : ' + eventsToDisplay );

        		/* Transforme un Array de jQuery objects, en un jQuery-Array */
        		LJ.$eventsToDisplay = $(eventsToDisplay).map( function(){ return this.toArray(); });
	        	
       		$('.eventItemWrap, #noEvents ').addClass('filtered');
       		LJ.$eventsToDisplay.removeClass('filtered');

       		if( LJ.$eventsToDisplay.length == 0){
       			LJ.fn.toastMsg( 'Aucun évènement trouvés', 'info');
       			$('#noEvents').removeClass('filtered').addClass('none')	
       						  .velocity('transition.slideLeftIn', { duration: 700 });

       		}else{
       			LJ.fn.toastMsg( LJ.$eventsToDisplay.length + ' soirées pour ces filtres!', 'info');	
       		}

        },
        requestIn: function( eventId, hostId, user, requesterId ){

            csl("requesting IN with id : "+ eventId);

            LJ.params.socket.emit("request participation in", {

                            userInfos: user,
                            hostId: hostId,
                            eventId: eventId,
                            requesterId: requesterId

            });

        },
        requestOut: function( eventId, hostId, user, requesterId ){  

        	csl("requesting OUT with id : "+ eventId);

        	LJ.params.socket.emit("request participation out", {

        					userInfos: LJ.user,
        					hostId: hostId,
        					eventId: eventId,
        					requesterId: requesterId
        	});

        },
        sendChat: function( submitInput ){

        	var textInput = submitInput.siblings('input[type="text"]');
        	var msg = textInput.val();

        		textInput.val('');

        		var askerId = submitInput.parents('.a-item').data('askerid') || LJ.user._id;
        		var hostId  = submitInput.parents('.eventItemWrap').data('hostid') || LJ.user._id;
        		var eventId = submitInput.parents('.eventItemWrap').data('eventid') || LJ.user.hostedEventId;

        		csl('Sending chat with id : '+eventId + ' and '+ hostId + ' and '+askerId);

        		LJ.params.socket.emit('send message',
        		{
        			msg: msg,
        			eventId: eventId,
        			hostId: hostId,
        			askerId: askerId,
        			senderId: LJ.user._id  /* = hostId ou askerId, selon le cas, utile pour le display only*/
        		});
        },
        bubbleUp: function( el ){

        	var $el = $(el);

        	var $bubble = $el.find('.bubble'),
        		n = $bubble.text() == 0 ? 0 : parseInt( $bubble.text() );

        	$bubble.removeClass('filtered');

        		if( n == 99 ) 
        			return $bubble.text(n+'+');

        	return $bubble.text( n + 1 );

        },
        displayAddUserAsFriendButton: function(){

        	var $users = $('#searchUsers .u-item.match');

        		$users.each( function( i, user ){

        			var $user = $(user),
        				userId = $user.attr('data-userid');

        			var button;

        			if( _.pluck( LJ.user.friendList, 'friendId' ).indexOf( userId ) != -1 )
        			{
        				if( _.find( LJ.user.friendList, function(el){ return el.friendId == userId ; }).status == 'mutual' )
        				    button =  '<button class="themeBtn onHold"><i class="icon icon-ok-1"></i></button>' ;

        				if( _.find( LJ.user.friendList, function(el){ return el.friendId == userId ; }).status == 'askedMe' )
        				    button = '<button class="themeBtn"><i class="icon icon-ellipsis"></i></button>' ;

        				if( _.find( LJ.user.friendList, function(el){ return el.friendId == userId ; }).status == 'askedHim' )
        				    button = '<button class="themeBtn onHold"><i class="icon icon-ellipsis"></i></button>' ; 
        			}
        			else
        			{
        				    button = '<button class="themeBtn"><i class="icon icon-user-add"></i></button>' ; 
        			}

        				$user.find('button').replaceWith( button );

        		});

        },
        displayAddFriendToPartyButton: function(){

        	var $friendListWrap = $('#friendListWrap'),
        		$eventWrap = $friendListWrap.parents('.eventItemWrap'),
        		$askedInWrap = $friendListWrap.parents('.eventItemWrap').find('.askedInWrap');

        	$friendListWrap.find('.f-item').each( function( i, el ){

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

	        	if( $askedInWrap.find('img[data-askerid="'+friendId+'"]').length == 1 )
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
        buildChatId: function( eventId, hostId, userId ){

        	return eventId + '_' + hostId + '-' + userId;

        },
        addChatLine: function( data ){

        	csl('Adding chatline');
            var cha;
            data.senderId === LJ.user._id ?  ha = 'cha-user' : cha = 'cha-other';

            var chatLineHtml = '<div class="chatLine none">'
								+'<div class="cha '+cha+'">'+data.msg+'</div>'
        						+'</div>';

       		var chatId = data.chatId;
       		
        	var $chatLineWrap = $('.chatWrap[data-chatid="'+chatId+'"]').find('.chatLineWrap');
        		
        		if( !$chatLineWrap.hasClass('jspScrollable') )
        		{
        			csl('Turning chatLineWrap scrollable');
        			$chatLineWrap.jScrollPane();
        			LJ.state.jspAPI[chatId] =  $chatLineWrap.data('jsp');
        		}

    		$chatLineWrap.find('.jspPane').append( chatLineHtml );
    		$chatLineWrap.find('.chatLine:last-child')
    					  .velocity("fadeIn", {
    					  	duration: 350,
    					  	complete: function(){
    					  	}
    					  });

    		sleep( 60, function(){
    							csl('Refreshing jsp API');
    							LJ.state.jspAPI[chatId].reinitialise();
    							LJ.state.jspAPI[chatId].scrollToBottom(); 
    						  });


        },
        initRooms: function( id ){

        	LJ.params.socket.emit( 'load rooms' , id );

        },
        cancelEvent: function( eventId, hostId ){

        	csl('canceling event : '+eventId+'  with hostId : '+hostId);
        	LJ.params.socket.emit( 'cancel event', { eventId: eventId, hostId: hostId });
        	$( '#cancelEvent' ).addClass( 'pending' );

        },
        suspendEvent: function( eventId, hostId ){

        	LJ.params.socket.emit( 'suspend event', { eventId: eventId, hostId: hostId });
        	$( '#suspendEvent' ).addClass( 'pending' );

        },
        showLoaders: function(){

        	$( '.loaderWrap, .m-loaderWrap' ).velocity( 'fadeIn', { duration: 400 });

        },
        hideLoaders: function(){

            $( '.loaderWrap, .m-loaderWrap' ).velocity( 'fadeOut', { duration: 250 });

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
        }, 
        toggleOverlay: function(type, html, speed){

    		var $overlay = $('.overlay-'+type );

    			$overlay.append( html );

			if( $overlay.hasClass('active') )
			{
				$overlay.removeClass('active')
						.velocity('fadeOut', { 
						duration: speed || 700,
						complete: function(){
							$overlay.find('.largeThumb').remove();
						} 
					});
			}
			else
			{
				$overlay.addClass('active')
						.velocity('fadeIn', { 
						duration: 700
					 });
			}

		}

}); //end LJ

$('document').ready(function(){

		//penser à remplacer ça par une récursion sur un setTimeout toutes les 300ms
		sleep(1000, function(){
		
		  FB.init({

				    appId      : '1509405206012202',
				    xfbml      : true,  // parse social plugins on this page
				    version    : 'v2.1' // use version 2.1

				  }); 
		
		csl('Application ready');
		LJ.fn.init();

	});


});