window.callback = () => {
  console.log('Callback fired');
};

window.onScriptLoad = () {
  console.log('onLoad fired');
}

window.google = new Proxy({}, {
  set: (obj, prop, val) => {
    obj[prop] = val;
    console.log('google set', prop);
    setTimeout(() => {
      console.log('google set async', prop);
    });
    return true;
  }
});

window.google.maps = new Proxy({}, {
  set: (obj, prop, val) => {
    obj[prop] = val;
    console.log('maps set', prop);
    setTimeout(() => {
      console.log('maps set async', prop);
    });
    return true;
  }
});
