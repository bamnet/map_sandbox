/**
 * Load supplemental Javascript on a page.
 * Dynamically load some JavaScript on a page after it's already loaded,
 * useful for replacing some bad or incompatible code.
 *
 * @param {string} url The URL of the file to load.
 * @param {boolean=} opt_autoload Should we auto load the file or wait for the
 *    load call.  Defaults to true.
 * @param {function()=} opt_successCallback Callback when the file loads
 *    successfully.
 * @param {function()=} opt_errorCallback Callback for if the file does not load
 *    successfully or does not load before the timeout.
 * @param {number=} opt_timeout Number of milliseconds the URL has to load.
 * @constructor
 */
var Loader = function(url, opt_autoload, opt_successCallback,
    opt_errorCallback, opt_timeout) {
  this.url_ = url;

  var nullFunction = function() {};
  this.callbacks_ = {
    'success': opt_successCallback || nullFunction,
    'error': opt_errorCallback || nullFunction
  };

  this.timeout = opt_timeout || 500;

  this.loaded = false;

  if (opt_autoload) {
    this.load();
  }
};


/**
 * Start loading the URL.
 */
Loader.prototype.load = function() {
  this.script_ = document.createElement('script');
  this.script_.src = this.url_;
  this.script_.onload = this.handleOnload_.bind(this);
  document.body.appendChild(this.script_);

  this.error_timer_ = setTimeout(this.handleFailure_.bind(this), this.timeout);
};


/**
 * Handles the sucessful load of the file.
 * Remove any error handles and trigger the success callback.
 * @private
 */
Loader.prototype.handleOnload_ = function() {
  this.loaded = true;
  clearTimeout(this.error_timer_);
  this.callbacks_['success']();
};


/**
 * Handles an error to load the file.
 * When the timeout expires and the file hasn't finished loading, destroy the
 * script element and clear any timeouts.  Finally calls the error callback.
 * @private
 */
Loader.prototype.handleFailure_ = function() {
  if (this.loaded) {
    return;
  }
  document.body.removeChild(this.script_);
  this.script_.onload = function() {};
  clearTimeout(this.error_timer_);
  this.callbacks_['error']();
};
