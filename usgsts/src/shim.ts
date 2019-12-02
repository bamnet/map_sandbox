class Stub {}

/**
 * Open Issues:
 *
 * - Since we're redefining `window.google.maps` this may impact other code
 *   which is attemping to detect if the Maps API is loaded.
 *
 * - `applyMixins` doesn't walk up the tree, copying the prototype of parents.
 *   This requires us to manually define the inheritance tree N+1 levels,
 *   specifying that `google.maps.OverlayView` and `google.maps.MVCObject` both
 *   need to be applied.
 *
 */

/**
 * `stub` creates an empty placeholder which can be extended.
 *
 * It sets up a Proxy to detect when the actual class is loaded, so we know
 * when to mix back in the correct prototype.
 *
 */
export function stub(modules: string[]) {
  // Only try stubbing if google is undefined and there's no
  // google.maps.version available. version looks like a good
  // indicator for when the API is loaded.
  if (typeof google === 'undefined' || !google?.maps?.version) {
    modules.forEach(module => {
      const frag = module.split('.');
      frag.reduce((o, i, j) => {
        // Only stub when it's undefined.
        if (o[i] === undefined) {
          o[i] = Stub;
        }
        return o[i];
      }, window);
    });
  }
}

/**
 * `applyMixins` copies properties between classes, implementing a simple mixin
 * pattern.
 *
 */
export function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(
          derivedCtor.prototype, name,
          Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
    });
  });
}
