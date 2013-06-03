/**
 * Google Earth Asynchonous Loader.
 * Allow the Google Earth API to be loaded asynchronously by polling to see
 * when the API is available and triggering callbacks when that happens.
 */


/**
 * Load the Earth API on demand.
 * @param {{success: function(), error: function(),
 *          maxRetries: number, retryDelay: number}} options
 *          Options when intiailizing the Earth API, passed directly to the
 *          google.load call. success and error are callbacks used when the JS
 *          API loads sucessfully or doesn't.  maxRetries controls the number
 *          of times we poll to see if the API has loaded.  retryDelay controls
 *          the delay between the if loaded check.
 */
function loadEarthApi(options) {
  // The callback is important, without a callback the
  // loader seems to destroy the DOM.  An empty callback
  // saves the DOM, but is not called at any useful time.
  options['callback'] = function() {};

  // Start loading the API if needed.
  if (!isEarthLoaded()) {
    google.load('earth', '1', options);
  }

  var successCallback = options['success'] || function() {};
  var errorCallback = options['error'] || function() {};
  var maxRetries = options['maxRetries'] || 20;
  var retryDelay = options['retryDelay'] || 100;

  // Wait for it to load, and then run the callbacks.
  initEarthAsync(maxRetries, retryDelay, successCallback, errorCallback);
}


/**
 * Wait for the API to load.
 * Loop waiting for the Earth API to load in the background.
 * @param {number} maxRetries Max number of times to try loading the API.
 * @param {number} retryDelay Milliseconds of delay between attempts to load.
 * @param {function} successCallback Function to call when the API
 *    has successfully loaded.  Usually this draws Earth.
 * @param {function} failureCallback Function to call when the API
 *    fails to load, either due to timeout or system incompatability.
 */
function initEarthAsync(maxRetries, retryDelay,
                        successCallback, failureCallback) {
  maxRetries--;
  if (isEarthLoaded()) {
    // Hooray, the JS API has loaded!
    successCallback();
  } else {
    // The API has not loaded yet.
    if (maxRetries > 0) {
      // We haven't retried too many times, try again.
      var retryInit = function() {
        initEarthAsync(maxRetries, retryDelay,
                       successCallback, failureCallback);
      };
      // Wait retryDelay before running retryInit.
      setTimeout(retryInit, retryDelay);
    } else {
      // The API didn't load between
      console.log('Unable to load the Earth API within the timeout');
      failureCallback();
    }
  }
}


/**
 * Quick test to see if the Earth API is loaded.
 * google.earth indicates the loader has requested to load the API.
 * google.earth.createInstance indicates the API has finished loading.
 * @return {boolean} True if the Earth API has finished loading.
 */
function isEarthLoaded() {
  return (google.earth !== undefined &&
          google.earth.createInstance !== undefined);
}
