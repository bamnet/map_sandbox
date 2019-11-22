window.google = window.google || {};
window.google.maps = new Proxy(window.google.maps || {}, {
  set: (obj, prop, val) => {
    obj[prop] = val;
    if (prop === 'version') {
      setTimeout(() => {
        console.log('google maps api loaded: ', google.maps.version);
      });
    }
    return true;
  }
});
