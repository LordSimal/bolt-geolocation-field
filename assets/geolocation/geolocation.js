( function( $ ) {

  let geolocation_wrapper = $( '.geolocation-field-wrapper' );

  if( geolocation_wrapper.length ) {
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
        let db_val = $hidden_input.val();
        if(db_val === ""){
          db_val = {};
        } else {
          db_val = JSON.parse(db_val);
        }

        let $is_search = false;
        if($this.parent().hasClass('geolocation-radio-search')){
          $is_search = true;
        }

        if($is_search){
          $search_input.parent().removeClass('d-none');
          $lat_input.parent().addClass('d-none');
          $long_input.parent().addClass('d-none');
          db_val.selected = 'search';
        } else {
          $search_input.parent().addClass('d-none');
          $lat_input.parent().removeClass('d-none');
          $long_input.parent().removeClass('d-none');
          db_val.selected = 'latlong';
        }

        $hidden_input.val(JSON.stringify(db_val));

      });

      // Toggle inputs depending on which radio is active
      $search_input.add($lat_input).add($long_input).on('change keyup', function(e){
        let $this = $(this);
        let $parent = $this.parent();
        let value = $this.val();

        let db_val = $hidden_input.val();
        if(db_val === ""){
          db_val = {};
        } else {
          db_val = JSON.parse(db_val);
        }

        if($parent.hasClass('geolocation-field-search')){
          db_val.search = value;
        } else if($parent.hasClass('geolocation-field-lat')) {
          db_val.lat = value;
        } else if($parent.hasClass('geolocation-field-long')) {
          db_val.long = value;
        }

        $hidden_input.val(JSON.stringify(db_val));

      });


    } );

  }

} )( $ );
