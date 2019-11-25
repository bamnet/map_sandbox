window.google = window.google || {};
window.google.maps = window.google.maps || {};

Object.defineProperties(window.google.maps, {
  'version': {
    set(val) {
      this._version = val;
      setTimeout(() => {
        console.log('google maps api loaded: ', google.maps.version);
      });
    },
    get() {
      return this._version;
    }
  }
});
