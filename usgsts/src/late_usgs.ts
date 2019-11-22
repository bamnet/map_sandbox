import {deferMixin, stub} from './shim';

stub(['google.maps.OverlayView']);
export class LateUSGSOverlay extends google.maps.OverlayView {
  private bounds: google.maps.LatLngBounds;
  private image: string;
  private map: google.maps.Map;
  private div: HTMLDivElement;

  constructor(
      bounds: google.maps.LatLngBounds, image: string, map: google.maps.Map) {
    super();

    this.bounds = bounds;
    this.image = image;
    this.map = map;

    this.div = null;
    this.setMap(this.map);
  }

  onAdd() {
    const div = document.createElement('div');
    div.style.border = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';

    // Create the img element and attach it to the div.
    const img = document.createElement('img');
    img.src = this.image;
    img.style.width = '100%';
    img.style.height = '100%';
    div.appendChild(img);

    this.div = div;

    // Add the element to the "overlayImage" pane.
    const panes = this.getPanes();
    panes.overlayImage.appendChild(this.div);
  }

  draw() {
    const overlayProjection = this.getProjection();

    const sw =
        overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest());
    const ne =
        overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast());

    // Resize the image's div to fit the indicated dimensions.
    const div = this.div;
    div.style.left = sw.x + 'px';
    div.style.top = ne.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (sw.y - ne.y) + 'px';
  }

  onRemove() {
    this.div.parentNode.removeChild(this.div);
  }
}
deferMixin(LateUSGSOverlay, ['google.maps.OverlayView']);
