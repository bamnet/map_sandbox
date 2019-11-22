window.callback = () => {
  console.debug('Callback fired');
};

window.onScriptLoad = () {
  console.debug('onLoad fired');
}

window.google = new Proxy(window.google || {}, {
  set: (obj, prop, val) => {
    obj[prop] = val;
    console.debug('google set', prop);
    setTimeout(() => {
      console.debug('google set async', prop);
    });
    return true;
  }
});

window.google.maps = new Proxy(window.google.maps || {}, {
  set: (obj, prop, val) => {
    obj[prop] = val;
    console.debug('maps set', prop);
    setTimeout(() => {
      console.debug('maps set async', prop);
    });
    return true;
  }
});
