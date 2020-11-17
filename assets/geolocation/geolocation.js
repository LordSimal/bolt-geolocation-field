var GEOLOCATION = GEOLOCATION || {};

// Class to better extract relative DOM elements
GEOLOCATION.Field = ( function( $ ) {
  'use strict';

  var $window, $document;

  // constructor
  function Field( options ) {
    var that = this

    that.$search_radio = that.$latlong_radio = that.$search_input = that.$lat_input = that.$long_input =
      that.$update_gmap_btn = that.$hidden_input = that.$zoom_gmap_in = that.$zoom_gmap_out =
        that.$hidden_zoom_input = that.gmap = "";

    that.options = $.extend( {}, that.options, options );
    that.$wrapper = that.options.$wrapper;

    // ready
    $( function() {
      that.init();
    } );
  }

  Field.prototype.init = function() {
    $window = $( window );
    $document = $( document );

    // Radio buttons
    this.$search_radio = this.$wrapper.find( '.geolocation-radio-search > input' );
    this.$latlong_radio = this.$wrapper.find( '.geolocation-radio-latlong > input' );

    // Text inputs
    this.$search_input = this.$wrapper.find( '.geolocation-field-search > input' );
    this.$lat_input = this.$wrapper.find( '.geolocation-field-lat > input' );
    this.$long_input = this.$wrapper.find( '.geolocation-field-long > input' );

    // Update GMap Button
    this.$update_gmap_btn = this.$wrapper.find( '.js-update-gmap' );

    // Hidden input which actually saves the data in the DB
    this.$hidden_input = this.$wrapper.find( '.js-geolocation-val' );

    // Zoom GMap Buttons
    this.$zoom_gmap_in = this.$wrapper.find( '.js-zoom-gmap-in' );
    this.$zoom_gmap_out = this.$wrapper.find( '.js-zoom-gmap-out' );
    this.$hidden_zoom_input = this.$wrapper.find( '.js-geolocation-zoom' );

    // Init all necessary listeners
    this.init_radio_listeners();
    this.init_input_listeners();
    this.init_gmap_listeners();

    // Update initial map with data present after page load
    // This also works for search because we write lat and long of searched result into DB as well
    this.updateGMapLatLong();
  };

  // Toggle inputs depending on which radio is active
  Field.prototype.init_radio_listeners = function() {
    let that = this;

    this.$search_radio.add( this.$latlong_radio ).on( 'change', function( e ) {
      let $this = $( this );
      let hidden_input_val = that.get_hidden_input_val();

      if( $this.parent().hasClass( 'geolocation-radio-search' ) ) {
        that.$search_input.parent().removeClass( 'd-none' );
        that.$lat_input.parent().addClass( 'd-none' );
        that.$long_input.parent().addClass( 'd-none' );
        that.$update_gmap_btn.addClass( 'd-none' );
        hidden_input_val.selected = 'search';
      } else {
        that.$search_input.parent().addClass( 'd-none' );
        that.$lat_input.parent().removeClass( 'd-none' );
        that.$long_input.parent().removeClass( 'd-none' );
        that.$update_gmap_btn.removeClass( 'd-none' );
        hidden_input_val.selected = 'latlong';
      }

      that.$zoom_gmap_in.add(that.$zoom_gmap_out).removeClass('d-none');

      hidden_input_val.zoom = that.$hidden_zoom_input.val();
      that.$hidden_input.val( JSON.stringify( hidden_input_val ) );
    } );
  }

  // Transfer currently present DOM data into hidden input field on change/keyup
  Field.prototype.init_input_listeners = function() {
    let that = this;

    this.$search_input.add( this.$lat_input ).add( this.$long_input ).on( 'change keyup', function( e ) {
      let $this = $( this );
      let $parent = $this.parent();
      let value = $this.val();

      let hidden_input_val = that.get_hidden_input_val();

      if( $parent.hasClass( 'geolocation-field-search' ) ) {
        hidden_input_val.search = value;
      } else if( $parent.hasClass( 'geolocation-field-lat' ) ) {
        hidden_input_val.lat = value;
      } else if( $parent.hasClass( 'geolocation-field-long' ) ) {
        hidden_input_val.long = value;
      }

      hidden_input_val.zoom = that.$hidden_zoom_input.val();
      that.$hidden_input.val( JSON.stringify( hidden_input_val ) );
    } );
  }

  // Helper function to parse the stringified JSON in the hidden input field
  Field.prototype.get_hidden_input_val = function() {
    let db_val = this.$hidden_input.val();
    if( db_val === "" ) {
      db_val = {};
    } else {
      db_val = JSON.parse( db_val );
    }
    return db_val;
  }

  // Init all GMap related listeners like clicking the update or zoom buttons
  Field.prototype.init_gmap_listeners = function() {
    let that = this;

    // Update GMap Preview when clicking on button
    that.$update_gmap_btn.on( 'click', function( e ) {
      let zoom = that.$wrapper.find( '.js-geolocation-zoom' ).val();
      that.$wrapper.find( '.geolocation-field-wrapper__gmap-wrapper' ).removeClass( 'd-none' );

      // Update hidden input
      let hidden_input_val = that.get_hidden_input_val();
      hidden_input_val.zoom = zoom;

      that.$hidden_input.val( JSON.stringify( hidden_input_val ) );
      that.updateGMapLatLong();
    } );

    // Zoom GMap Preview depending on which zoom button was clicked
    that.$zoom_gmap_in.add( that.$zoom_gmap_out ).on( 'click', function( e ) {
      let current_zoom = parseInt( that.$hidden_zoom_input.val() );
      let new_zoom = current_zoom;

      if( $( this ).hasClass( 'js-zoom-gmap-in' ) ) {
        if( current_zoom < 19 ) {
          new_zoom = current_zoom + 1;
        }
      } else if( $( this ).hasClass( 'js-zoom-gmap-out' ) ) {
        if( current_zoom > 0 ) {
          new_zoom = current_zoom - 1;
        }
      }

      that.$hidden_zoom_input.val( new_zoom );
      that.gmap.setZoom( new_zoom );

      let hidden_input_val = that.get_hidden_input_val();
      hidden_input_val.zoom = new_zoom;
      that.$hidden_input.val( JSON.stringify( hidden_input_val ) );

    } );

    that.init_gmap_autocomplete();
  }

  // Init the search autocomplete field
  Field.prototype.init_gmap_autocomplete = function() {
    let that = this;
    let $map = that.$wrapper.find( '.geolocation-field-wrapper__gmap' );

    that.gmap = new google.maps.Map( $map[0], {
      center: { lat: 48.2, lng: 16.4 }, // Vienna
      zoom: 13,
    } );

    const input = that.$wrapper.find( '.geolocation-field-search > input' )[0];
    const autocomplete = new google.maps.places.Autocomplete( input );
    // Set the data fields to return when the user selects a place.
    autocomplete.setFields( ["geometry", "name", "formatted_address", "address_components"] );
    autocomplete.addListener( "place_changed", () => {
      const place = autocomplete.getPlace();

      if( !place.geometry ) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        alert( "No details available for input: '" + place.name + "'" );
        return;
      }

      that.$wrapper.find( '.geolocation-field-wrapper__gmap-wrapper' ).removeClass( 'd-none' );
      google.maps.event.trigger(that.gmap, 'resize');
      that.gmap.setCenter( place.geometry.location );

      var hidden_input_val = that.get_hidden_input_val();
      var zoom = parseInt( hidden_input_val.zoom );
      that.gmap.setZoom( zoom );

      const marker = new google.maps.Marker( {
        map: that.gmap,
        position: place.geometry.location
      } );

      hidden_input_val.search = place.formatted_address;
      hidden_input_val.lat = place.geometry.location.lat();
      hidden_input_val.long = place.geometry.location.lng();
      hidden_input_val.zipCode = null;
      hidden_input_val.city = null;
      hidden_input_val.country = null;

      for(const component of place.address_components) {
        if(component.types.includes('postal_code')) {
          hidden_input_val.zipCode = component.long_name;
        }
        if(component.types.includes('locality')) {
          hidden_input_val.city = component.long_name;
        }
        if(component.types.includes('country')) {
          hidden_input_val.country = component.long_name;
        }
      }

      that.$hidden_input.val( JSON.stringify( hidden_input_val ) );
    } );
  }

  // Extra function to update Gmap when changing Lat/Long values
  Field.prototype.updateGMapLatLong = function() {
    let that = this;
    let $map = this.$wrapper.find( '.geolocation-field-wrapper__gmap' );
    let hidden_input_val = this.get_hidden_input_val();

    let lat = parseFloat( hidden_input_val.lat );
    let long = parseFloat( hidden_input_val.long );
    let zoom = parseInt( hidden_input_val.zoom );

    if(!isNaN(lat) && !isNaN(long)){
      const mapOptions = {
        center: { lat: lat, lng: long },
        zoom: zoom,
      };

      that.gmap = new google.maps.Map( $map[0], mapOptions );
      that.gmap.setOptions( mapOptions );

      const marker = new google.maps.Marker( {
        // The below line is equivalent to writing:
        // position: new google.maps.LatLng(-34.397, 150.644)
        position: { lat: lat, lng: long },
        map: that.gmap,
      } );

      const infowindow = new google.maps.InfoWindow( {
        content: "<p>Marker Location:" + marker.getPosition() + "</p>",
      } );
      google.maps.event.addListener( marker, "click", () => {
        infowindow.open( that.gmap, marker );
      } );
    }

  }

  // exports
  return Field;
}( $ ) );

// Called via GMap URL in injector.html.twig
function gmapCallback() {

  let geolocation_wrapper = $( '.geolocation-field-wrapper' );

  // Check if we have elements
  if( geolocation_wrapper.length ) {

    geolocation_wrapper.each( function( idx, elem ) {
      let $wrapper = $( elem );

      new GEOLOCATION.Field( {
        $wrapper: $wrapper,
      } );

    } );

  }
}

