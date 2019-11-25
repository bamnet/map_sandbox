export class LoadDetector {
  private static instance: LoadDetector;

  private callbacks: Array<() => void> = [];

  private constructor() {
    window.google = window.google || {};
    window.google.maps = window.google.maps || {};

    if (this.alreadyLoaded()) {
      return;
    }

    if (window['Proxy']) {
      this.installListener();
    } else {
      this.installFallbackListener();
    }
  }

  static getInstance() {
    if (!LoadDetector.instance) {
      LoadDetector.instance = new LoadDetector();
    }
    return LoadDetector.instance;
  }

  onLoad(callback: () => void) {
    if (this.alreadyLoaded()) {
      callback();
      return;
    }
    this.callbacks.push(callback);
  }

  runCallbacks() {
    this.callbacks.forEach(c => c());
  }

  private installListener() {
    console.debug('Installed Proxy listener in google.maps.version');
    window.google.maps = new Proxy(window.google.maps, {
      set: (obj, prop, val) => {
        obj[prop] = val;
        if (prop === 'version') {
          LoadDetector.getInstance().runCallbacks();
        }
        return true;
      }
    });
  }

  private installFallbackListener() {
    console.debug('Installed set-based listener in google.maps.version');

    Object.defineProperties(window.google.maps, {
      'version': {
        set(val) {
          this._version = val;
          LoadDetector.getInstance().runCallbacks();
        },
        get() {
          return this._version;
        },
      }
    });
  }

  private alreadyLoaded() {
    return Boolean('version' in google.maps && google.maps.version);
  }
}

export function whenLoaded(callback: () => void) {
  LoadDetector.getInstance().onLoad(callback);
}
