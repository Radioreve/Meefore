
	window.LJ.ui = _.merge( window.LJ.ui || {}, {

		show_modal_duration: 350,
		hide_modal_duration: 350, 
		show_modal_delay   : 200,
		hide_modal_delay   : 100,

		showModalAndFetch: function( options ){
			return LJ.promise(function( resolve, reject ){
				LJ.Promise.all([
					options.fetchPromise(),
					LJ.ui.showModal( _.extend(options, {show_loader: true}) )
				]).then(function( results ){
					resolve( results[0] );
				}).catch(reject);

			})

		},	
		showModal: function( options ){
			return LJ.promise(function( resolve, reject ){

				options = options || {};

				var $modal = $( LJ.ui.renderModal( options ) );

				LJ.ui.showCurtain({ duration: 500, opacity: .75 });

				if( LJ.isMobileMode() ){
					LJ.ui.deactivateHtmlScroll();
				}

				$modal.hide().appendTo( $('.curtain') );

				if( typeof options.done == "function" ){
					options.done();
				}

				$modal.velocity('shradeIn', {
					  	delay: LJ.ui.show_modal_delay,
					  	display: 'flex',
					  	duration: LJ.ui.show_modal_duration,
					  	complete: function(){

					  		if( options.jsp_body ){
					  			$('.modal-body').jScrollPane();
					  		}


					  		if( options.search_input ){
					  			var item_id = $('.modal').attr('data-item-id');
					  			$('.modal-item[data-item-id="' + item_id + '"]').remove();
					  			$modal.find('input').focus();
					  		}

					  		return resolve();
					  	}
					  })
					  .on('click', '.modal__close', LJ.ui.hideModal )

			});
		},
		hideModal: function(){
			return LJ.promise(function( resolve, reject ){

				if( LJ.user ){
					LJ.ui.activateHtmlScroll();
				}

				$('.modal').velocity('shradeOut', {
					duration: LJ.ui.hide_modal_duration
				});

				$('.curtain').velocity('fadeOut', {
					duration: LJ.ui.hide_modal_duration,
					delay: LJ.ui.hide_modal_delay,
					complete: function(){
						$(this).remove();
						resolve();
					}
				});
			})

		},
		loaderifyModal: function(){
			
			$('<div class="modal-overlay"></div>')
				.hide()
				.appendTo('.modal')
				.css({
					'position': 'absolute',
					'top': '0',
					'bottom': '0',
					'left': '0',
					'right': '0',
					'margin': 'auto',
					'width': '100%',
					'height': '100%',
					'z-index': '9',
					'background': 'rgba(255,255,255, 0.6)'
				})
				.velocity('fadeIn', {
					duration: 500
				})

			$( LJ.static.renderStaticImage('modal_loader') )
				.css({
					'position': 'absolute',
					'top': '0',
					'bottom': '0',
					'left': '0',
					'right': '0',
					'margin': 'auto',
					'z-index': '10'
				})
				.hide()
				.appendTo('.modal')
				.velocity('shradeIn', {
					duration: 300
				});


		},
		deloaderifyModal: function(){

			$('.modal-overlay')
				.remove();

			$('.modal')
				.children('img')
				.remove();

		},
		shadeModal: function(){
			return LJ.promise(function( resolve, reject ){

				$('.modal').velocity('bounceOut', {
					duration: 600,
					display : 'none'
				});

				LJ.delay(300)
					.then(function(){
						$('.curtain')
							.css({ 'transition': 'all ease-in-out .6s' })
							.css({ 'background': 'rgba(19,19,19,1) '});
					})
					.then(function(){
						return LJ.delay(600)
					})
					.then(function(){
						$('.curtain')
							.css({ 'transition': 'none' });
						resolve();
					})

			});
		},
		renderModal: function( options ){

			var modifier  = 'x--' + options.type;

			if( !options.body ){
				body_html = '';
			} else {
				body_html = '<section class="modal-body">' + options.body + '</section>';
			}

			if( options.show_loader ){
				body_html = '<section class="modal-body">' + LJ.static.renderStaticImage('modal_loader') + '</section>';
			}

			var attributes = [];
			if( options.attributes ){
				options.attributes.forEach(function( attr_object ){
					attributes.push('data-' + attr_object.name  + '="' + attr_object.val + '"');
				});
			}
			if( options.max_items ){
				attributes.push('data-max-items="'+ options.max_items +'"' );
			}
			attributes = attributes.join(' ');

			var search_input_html = '';
			var disabled = '';
			if( options.search_input && !LJ.isMobileMode() ){
				disabled = 'x--disabled';
				search_input_html = LJ.ui.renderModalSearchInput();
			}

			var footer_html = [
				'<footer class="modal-footer">',
					options.footer,
				'</footer>'
			].join('');

			if( options.no_footer ){
				footer_html = '';
			}

			return [

				'<div class="modal ' + modifier + ' ' + disabled + '" ' + attributes + '>',
					'<header class="modal-header">',
						'<div class="modal__close">',
							'<i class="icon icon-cross-fat"></i>',
						'</div>',
						'<div class="modal__title">',
							'<h1>' + options.title + '</h1>',
						'</div>',
					'</header>',
					'<div class="modal-subheader">',
						options.subtitle,
					'</div>',
					search_input_html,
					body_html,
					footer_html,
				'</div>'

			].join('');

		},
		renderModalSearchInput: function(){

			return LJ.ui.render([
					'<div class="modal-search__input">',
						'<input data-lid="modal_search_input_placeholder" />',
					'</div>'
				].join(''));

		},
		filterModalResults: function(){
			
			
			LJ.delay( 100 ).then(function(){
				
				var $modal = $('.modal');
				var $input = $modal.find('.modal-search__input input');
				var text   = $input.val().toLowerCase();

				if( text == '' ){
					return $('.modal-item').removeClass('nonei');
				}

				$('.modal-item:not(.x--selected):not([data-name^="' + text + '"])')
					.addClass('nonei');

				$('.modal-item:not(.x--selected)[data-name^="' + text + '"]')
					.removeClass('nonei');
					
				});	
							
		},
		handleModalItemClicked: function(){

			var $s = $(this);
			
			if( $s.hasClass('x--noselect') ){
				return;
			}
			
			var max = $('.modal').attr('data-max-items');

			if( max && $('.modal-item.x--selected').length == parseInt( max ) && !$s.hasClass('x--selected') ){
				return LJ.wlog('Already max items');
			}

			var $modal = $('.modal');
			$s.toggleClass('x--selected');

			LJ.ui.refreshModalState();
			$('.modal-search__input input').val('');
			
			LJ.ui.filterModalResults();

		},
		refreshModalState: function( min ){

			var $modal = $('.modal');
			var min    = parseInt( $modal.attr('data-min-items') );
			var max    = parseInt( $modal.attr('data-max-items') );

			if( typeof min != "number" || typeof max != "number" ){
				return LJ.wlog("unable to parse the min/max number");
			}

			if( $('.modal-item.x--selected').length == min ){
				$modal.addClass('x--disabled');
			} else {
				$modal.removeClass('x--disabled');
			}

			if( $('.modal-item.x--selected').length == max ){
				$('.modal-item:not(.x--selected)').addClass('x--unselectable');
			} else {
				$('.modal-item:not(.x--selected)').removeClass('x--unselectable');
			}

		},
		getModalItemIds: function( max ){
			return LJ.promise(function( resolve, reject ){

				if( !$('.modal').hasClass('js-listeners-attached') ){
					$('.modal').addClass('js-listeners-attached');
					$('.modal-item').click( LJ.ui.handleModalItemClicked );
				}

				$('.modal__close').click( reject );
				$('.modal-footer button').click(function(){

					var $modal = $('.modal');
					if( $modal.hasClass('x--disabled') ){
						return;
					} else {
						$modal.addClass('x--pending');
					}

					var item_ids = [];
					$('.modal-item.x--selected').each(function( i, itm ){
						item_ids.push( $(itm).attr('data-item-id') );
					});
					
					resolve( item_ids );

				});


			});

		},
		noSelectModalRow: function( item_id, message ){
			
			var $item = $('.modal-item[data-item-id="'+ item_id +'"]');

			$item.find('.item-modal__noselect').remove(); // clear
			$item.removeClass('x--selected')
				 .addClass('x--noselect')
				 .addClass('x--unselectable')
				 .append('<span class="item-modal__noselect">'+ message +'</span>');


		},
		cancelify: function( opts ){

			if( opts.$wrap.length == 0 ) return;

			LJ.ui.shadeify( opts.$wrap, 400 );

			var html = [ '<div class="ui-overlay__message">',
				opts.message_html,
			'</div>' ].join('');

			$( html ).hide()
					 .appendTo( opts.$wrap )
					 .velocity('shradeIn', {
					 	duration : 400,
					 	delay    : 350,
					 	display  : 'flex'
					 });

			LJ.delay( opts.duration || 5000 ).then(function(){
				if( typeof opts.callback == "function" ){
					opts.callback();
				}
			});

		},
		shadeify: function( $wrap, duration, theme ){

			var theme = theme || "dark";
			var final_opacity = theme == "dark" ? 0.7 : 1;

			$('<div class="ui-overlay ui-overlay--'+ theme +'"></div>')
				.css({ 'opacity': 0 })
				.appendTo( $wrap )
				.velocity({ opacity: [ final_opacity, 0 ] }, {
					duration : duration,
					display  : 'flex'
				});

		},
		synchronify: function( opts ){

			return LJ.promise(function( resolve, reject ){

				if( opts.$wrap.length == 0 ){
					return reject("No $wrapper element was found");
				};

				LJ.ui.shadeify( opts.$wrap, 200, 'light' );

				var content = '<div class="ui-overlay__message">' + opts.message_html + '</div>';
				var loader  = LJ.static.renderStaticImage('slide_loader');

				$('<div class="ui-synchronify">'+ content + loader + '</div>')
						 .hide()
						 .appendTo( opts.$wrap )
						 .velocity('shradeIn', {
						 	duration : 200,
						 	delay    : 100,
						 	display  : 'flex'
						 });

				LJ.delay( 200 ).then( resolve );
				
			});

		},
		desynchronify: function( opts ){

			if( opts.$wrap.length == 0 ){
				return LJ.warn("No $wrapper element was found");
			};

			$( opts.$wrap.find('.ui-overlay, .ui-synchronify') )
				.velocity('fadeOut', {
					duration : 350,
					complete : function(){
						$( this ).remove();
					}
				})


		}

	});






	testModal = function(){
		LJ.ui.showModal({
			"title": "Félicitations !",
			"subtitle": "Vous allez désormais pouvoir créer votre propre évènement privé avec vos amis.",
			"body": "Then there goes the body...",
			"footer": "<button class='x--rounded'><i class='icon icon-check'></i></button>"
		});
	};

	testModalFetch = function(){

		LJ.ui.showModalAndFetch({

			"type"			: "facebook",
			"title"			: "Félicitations fetch!",
			"subtitle"		: "Vous allez désormais pouvoir créer votre propre évènement privé avec vos amis.",
			"footer"		: "<button class='x--rounded'><i class='icon icon-plus'></i></button>",

			"fetchPromise"	: LJ.facebook.fetchProfilePictures

		}).then(function( results ){
			console.log('Call went thru!');
			
			var html = [];
			results.data.forEach(function( picture_object ){
				picture_object.images.forEach(function( image_object ){
					if( image_object.width > LJ.ui.facebook_img_min_width && image_object.width < LJ.ui.facebook_img_max_width ){
						html.push( LJ.facebook.renderPicture( image_object.source ) );
					}
				});
			});

			$('.modal-body').append( html.join('') )
							.find('.modal__loader')
							.velocity('shradeOut', {
								duration: 500,
								delay: 1000,
								complete: function(){
									$(this).siblings()
										   .velocity('shradeIn', {
										   		display: 'block'
										   });
								}
							})

		});

	}