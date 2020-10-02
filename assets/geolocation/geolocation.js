( function( $ ) {

  let geolocation_wrapper = $( '.geolocation-field-wrapper' );
  let basic_gmap_url = "https://maps.google.com/maps?q=$QUERY$&t=&z=$ZOOM$&ie=UTF8&iwloc=&output=embed"

  if( geolocation_wrapper.length ) {

    function get_hidden_input_val($hidden_input){
      let db_val = $hidden_input.val();
      if(db_val === ""){
        db_val = {};
      } else {
        db_val = JSON.parse(db_val);
      }
      return db_val;
    }

    geolocation_wrapper.each( function( idx, elem ) {
      let $wrapper = $( elem );

      // Radio buttons
      let $search_radio = $wrapper.find( '.geolocation-radio-search > input' );
      let $latlong_radio = $wrapper.find( '.geolocation-radio-latlong > input' );

      // Text inputs
      let $search_input = $wrapper.find( '.geolocation-field-search > input' );
      let $lat_input = $wrapper.find( '.geolocation-field-lat > input' );
      let $long_input = $wrapper.find( '.geolocation-field-long > input' );

      // Hidden input which actually saves the data in the DB
      let $hidden_input = $wrapper.find( '.js-geolocation-val');

      // Toggle inputs depending on which radio is active
      $search_radio.add($latlong_radio).on('change', function(e){
        let $this = $(this);
        let hidden_input_val = get_hidden_input_val($hidden_input);

        if($this.parent().hasClass('geolocation-radio-search')){
          $search_input.parent().removeClass('d-none');
          $lat_input.parent().addClass('d-none');
          $long_input.parent().addClass('d-none');
          hidden_input_val.selected = 'search';
        } else {
          $search_input.parent().addClass('d-none');
          $lat_input.parent().removeClass('d-none');
          $long_input.parent().removeClass('d-none');
          hidden_input_val.selected = 'latlong';
        }

        hidden_input_val.zoom = $hidden_zoom_input.val();

        $hidden_input.val(JSON.stringify(hidden_input_val));

      });

      // Toggle inputs depending on which radio is active
      $search_input.add($lat_input).add($long_input).on('change keyup', function(e){
        let $this = $(this);
        let $parent = $this.parent();
        let value = $this.val();

        let hidden_input_val = get_hidden_input_val($hidden_input);

        if($parent.hasClass('geolocation-field-search')){
          hidden_input_val.search = value;
        } else if($parent.hasClass('geolocation-field-lat')) {
          hidden_input_val.lat = value;
        } else if($parent.hasClass('geolocation-field-long')) {
          hidden_input_val.long = value;
        }

        hidden_input_val.zoom = $hidden_zoom_input.val();

        $hidden_input.val(JSON.stringify(hidden_input_val));

      });

      // ========== GMAP ==========

      // Update GMap Button
      let $update_gmap_btn = $wrapper.find('.js-update-gmap');

      // Update GMap Preview when clicking on button
      $update_gmap_btn.on('click', function(e){
        let gmap_url = "";
        if($search_radio.is(':checked')){
          let search_val = $search_input.val();
          gmap_url = basic_gmap_url.replace('$QUERY$', search_val);
        } else {
          let lat = $lat_input.val();
          let long = $long_input.val();
          let query = lat + ',' + long;
          gmap_url = basic_gmap_url.replace('$QUERY$', query);
        }

        let zoom = $('.js-geolocation-zoom').val();
        gmap_url = gmap_url.replace('$ZOOM$', zoom);
        $wrapper.find('.js-gmap').attr('src', encodeURI(gmap_url));

        // Update hidden input
        let hidden_input_val = get_hidden_input_val($hidden_input);
        hidden_input_val.zoom = zoom;

        $hidden_input.val(JSON.stringify(hidden_input_val));

      });

      // Zoom GMap Buttons
      let $zoom_gmap_in = $wrapper.find('.js-zoom-gmap-in');
      let $zoom_gmap_out = $wrapper.find('.js-zoom-gmap-out');
      let $hidden_zoom_input = $wrapper.find('.js-geolocation-zoom');

      // Zoom GMap Preview when clicking on buttons
      $zoom_gmap_in.add($zoom_gmap_out).on('click', function(e){
        let current_zoom = parseInt($hidden_zoom_input.val());
        let new_zoom = current_zoom;

        if($(this).hasClass('js-zoom-gmap-in')){
          if(current_zoom < 19){
            new_zoom = current_zoom + 1;
          }
        } else if($(this).hasClass('js-zoom-gmap-out')) {
          if(current_zoom > 0){
            new_zoom = current_zoom - 1;
          }
        }

        $hidden_zoom_input.val(new_zoom);
        $update_gmap_btn.trigger('click');
      });

    } );

  }

} )( $ );
