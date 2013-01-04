/**
 * Show a map in an InfoWindow at a point.
 * Creates an InfoWindow and shows a zoomed in map at the location, providing
 * a blown-up view of the map on top of the current map.
 *
 * Similiar functionality exists in the V2 API via GMap2.showMapBlowup and
 * GMarker.showMapBlowup.
 *
 * @param {LatLng} position The LatLng at which to display the InfoWindow and
 *     the center of the zoomed in map.
 * @param {Map} map The map to display the InfoWindow on.
 * @param {InfoWindowOptions=} opt_opts InfoWindow options with the addition of
 *     a zoomLevel and mapType option which is passed to the close-up map.
 *     A size option can be used to control the size of the map.
 * @private
 */
function showMapBlowup_(position, map, opt_opts) {
  var opts = opt_opts || {};

  var container = document.createElement('div');
  container.className = 'mapBlowup';

  // Default to a size that the V2 API uses, but let users override it by
  // passing in the size option which must provide height and width properties.
  var size = opts['size'] || new google.maps.Size(219, 202);
  if (typeof size['width'] == 'number') {
    container.style.width = size['width'] + 'px';
  } else {
    container.style.width = size['width'];
  }
  if (typeof size['height'] == 'number') {
    container.style.height = size['height'] + 'px';
  } else {
    container.style.height = size['height'];
  }
  delete opts['size'];

  // Default the mini map to be zoomed +2 levels beyond the current map and
  // share the same map type.  Also turn off dragging.
  var miniMapOptions = {
    zoom: opts['zoomLevel'] || (map.getZoom() + 2),
    center: position,
    mapTypeId: opts['mapType'] || map.getMapTypeId(),
    draggable: false
  };
  delete opts['zoomLevel'];
  delete opts['mapType'];
  var miniMap = new google.maps.Map(container, miniMapOptions);

  // Add some InfoWindow specific options.
  var infoWindowOptions = opts;
  infoWindowOptions['position'] = position;
  infoWindowOptions['content'] = container;

  var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

  // Setup the handler to resize the map after the InfoWindow is ready.
  // Also needs to recenter the map since that may chance post-resize.
  var domreadyHandler = function() {
    google.maps.event.trigger(miniMap, 'resize');
    miniMap.setCenter(position);
  };
  google.maps.event.addListener(infoWindow, 'domready', domreadyHandler);

  infoWindow.open(map);
}


/**
 * Shows a map in an InfoWindow at a point on the map.
 * This replicates the functionality of GMap2.showMapBlowup.
 *
 * @param {LatLng} position The LatLng at which to display the InfoWindow and
 *     the center of the close-up map.
 * @param {InfoWindowOptions=} opt_opts InfoWindow options with the addition of
 *     a zoomLevel and mapType option which is passed to the close-up map.
 */
google.maps.Map.prototype.showMapBlowup = function(position, opt_opts) {
  showMapBlowup_(position, this, opt_opts);
};


/**
 * Shows a map in an InfoWindow at marker.
 * This replicates the functionality of GMarker.showMapBlowup.
 *
 * @param {InfoWindowOptions=} opt_opts InfoWindow options with the addition of
 *     a zoomLevel and mapType option which is passed to the close-up map.
 */
google.maps.Marker.prototype.showMapBlowup = function(opt_opts) {
  var map = this.getMap();
  var position = this.getPosition();
  showMapBlowup_(position, map, opt_opts);
};
