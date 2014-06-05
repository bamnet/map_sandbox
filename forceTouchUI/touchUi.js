/**
 * Trick the Maps API into using the Touch UI.
 * Replaces the UserAgent to look more like an android device
 * and less like a desktop computer.
 */


/**
 * Only enable the touch UI if the device supports touch events.
 */
function optionallyEnableTouchUI(){
  // Check if the browser supports touch events
  if('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch) {
    forceTouchUI();
  }
}

/**
 * Force the API to use a Touch UI which disables mouse input.
 *
 * This method should be called before any map is initialized on the page.
 * 
 * Tested on a Chromebook Pixel, but should work on any device.
 * Note: If you do not have touch input, you will not be able to interact
 * with the UI or map at all.
 *
 * Star https://code.google.com/p/gmaps-api-issues/issues/detail?id=4599.
 */
function forceTouchUI(){
  // Trick the API into thinking we are using an android-like device to get the touch UI
  var newUserAgent = navigator.userAgent.toLowerCase();
  var osBlacklist = ['x11', 'macintosh', 'windows'];
  for(var i = 0; i < osBlacklist.length; ++i){
    newUserAgent = newUserAgent.replace(osBlacklist[i], 'android');
  }

  navigator.__defineGetter__('userAgent', function(){
    return newUserAgent;
  });
}
