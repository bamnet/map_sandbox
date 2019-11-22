import {LateUSGSOverlay} from './late_usgs';

window.initMap = () => {
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: {lat: 62.323907, lng: -150.109291},
    mapTypeId: 'satellite'
  });

  const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(62.281819, -150.287132),
      new google.maps.LatLng(62.400471, -150.005608));

  // The photograph is courtesy of the U.S. Geological Survey.
  const srcImage =
      'https://developers.google.com/maps/documentation/javascript/examples/full/images/talkeetna.png';

  // const ;
  const overlay = new LateUSGSOverlay(bounds, srcImage, map);
};
