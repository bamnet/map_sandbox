/**
 * An update file for the remoteUpdater test.
 */


/**
 * A non-broken mapDragHandler.
 * Updates the document title with the lat, lng.
 */
function mapDragHandler() {
  var center = map.getCenter();
  document.title = center.lat() + ', ' + center.lng();
}


/**
 * Install the new event handler, removing the old one.
 */
function installUpdate() {
  google.maps.event.clearListeners(map, 'center_changed');
  google.maps.event.addListener(map, 'center_changed', mapDragHandler);
}


installUpdate();
