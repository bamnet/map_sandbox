class Stub {}

const listeners = new Map();

/**
 * Open Issues:
 *
 * - Since we're redefining `window.google.maps` this may impact other code
 *   which is attemping to detect if the Maps API is loaded.
 *
 * - `stub` function can only be used once. A second class calling stub() would
 *   have unknown effects since google would now exist, but not necessarily with
 *   the correctly stubbed classes.  <-- This feels fixable.
 *
 * - `applyMixins` doesn't walk up the tree, copying the prototype of parents.
 *   This requires us to manually define the inheritance tree N+1 levels,
 *   specifying that `google.maps.OverlayView` and `google.maps.MVCObject` both
 *   need to be applied.
 *
 * - To detect when the Google Maps API fully loads, we use a Proxy which might
 *   be too cool for older browers (unknown compatility). I think we should
 *   break the "how to tell when the google maps api loads" problem into it's
 *   own seperate space.
 */

/**
 * `stub` creates an empty placeholder which can be extended.
 *
 * It sets up a Proxy to detect when the actual class is loaded, so we know
 * when to mix back in the correct prototype.
 *
 */
export function stub(modules: string[]) {
  if (typeof google === 'undefined') {
    modules.forEach(module => {
      const frag = module.split('.');
      frag.reduce((o, i, j) => {
        if (j === frag.length - 2) {
          o[i] = new Proxy(Stub, {
            set: (obj, prop, value) => {
              obj[prop] = value;
              if (prop === frag[frag.length - 1] && value != Stub) {
                listeners.get(module)();
              }
              return true;
            }
          });
        } else {
          o[i] = Stub;
        }
        return o[i];
      }, window);
    });
  }
}

/**
 * `deferMixin` sets up a listener to apply mixins to a klass when a module
 * is set.  As an example, when modules='google.maps.OverlayView' is loaded,
 * we should apply mixins to the klass=USGSOverlay.
 *
 */
export function deferMixin(klass: Function, modules: string[]) {
  modules.forEach(module => {
    listeners.set(module, () => {
      applyMixins(klass, [
        module.split('.').reduce((o, i) => o[i], window), google.maps.MVCObject
      ]);
    });
  });
}

/**
 * `applyMixins` copies properties between classes, implementing a simple mixin
 * pattern.
 *
 */
function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(
          derivedCtor.prototype, name,
          Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
    });
  });
}
