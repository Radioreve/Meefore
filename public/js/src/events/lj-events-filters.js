
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsFilters: function(){

			 LJ.$body.on('click', '.filter-date-item', function(){

                var $self = $(this);
              	$self.toggleClass('active');

              	LJ.fn.applyDateFilter();

            });

			
		},
		applyDateFilter: function(){

			var date_to_display = [];
			var override;

			var filter_opacity = 0.2;

			// Make sure no array is empty
			LJ.event_markers = LJ.event_markers || [];
			LJ.party_markers = LJ.party_markers || [];
			LJ.cache.parties = LJ.cache.parties || [];
			LJ.cache.events  = LJ.cache.events  || [];

			$('.filter-date-item.active').each(function( i, el ){
				date_to_display.push( moment( $(el).attr('data-dateid'), 'DD/MM/YYYY' ).dayOfYear() );
			});

			// In case we want to reset the filters, override control to put all opaciy back to 1
			if( date_to_display.length == 0 ){
				override = true;
			}


			// Filtering on events : all event that doesnt start on filtered date is filtered
			LJ.event_markers.forEach(function( marker ){

				if( date_to_display.indexOf( moment( marker.data.begins_at ).dayOfYear() ) == -1 && !override ){
					marker.marker.setOpacity( filter_opacity );
					marker.marker.setZIndex(-1);
				} else {
					marker.marker.setOpacity(1);
					marker.marker.setZIndex(1);
				}

			});


			// Filtering on parties : all party for which there are no partner party in the filtered date and no meefore going
			// need to be filtered
			LJ.party_markers.forEach(function( marker ){

				var no_partner_party = true;
				var no_meefore_going = true;

				var place_id = marker.id;

				// Check if at least one partner party starts for one of the specified filtered dates
				LJ.cache.parties.forEach(function( party ){

					if( date_to_display.indexOf( moment( party.begins_at ).dayOfYear() ) != -1 && party.address.place_id == place_id ){
						no_partner_party = false;
					}

				});

				// Check if at least one meefore goes for one of the specified filtered dates
				LJ.cache.events.forEach(function( evt ){

					if( date_to_display.indexOf( moment( evt.begins_at ).dayOfYear() ) != -1 && evt.party.address.place_id == place_id ){
						no_meefore_going = false;
					}

				});


				if( no_meefore_going && no_partner_party && !override ){
					marker.marker.setOpacity( filter_opacity );
					marker.marker.setZIndex(-1);
				} else {
					marker.marker.setOpacity(1);
					marker.marker.setZIndex(1);
				}

			});

		}

	});