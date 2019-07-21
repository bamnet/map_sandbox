import { ListParks, Park } from './parks';

let placesSvc: import("./modern_services").PlacesService;
let directionSvc: import("./modern_services").DirectionService;
let distanceMatrixSvc: import("./modern_services").DistanceMatrixService;

async function initMap() {
    const services = await import('./modern_services');
    placesSvc = new services.PlacesService(<HTMLDivElement>document.getElementById('attr'));
    directionSvc = new services.DirectionService();
    distanceMatrixSvc = new services.DistanceMatrixService();

    const nycParks = filterParks(placesSvc);
    nycParks.then((parks) => {
        transitRoute(distanceMatrixSvc, parks);
        // routeBetween(directionSvc, parks);
    })
    console.log(nycParks);
};

async function filterParks(placesSvc: import("./modern_services").PlacesService): Promise<Park[]> {
    return Promise.all(ListParks().map((park) => park.findPlace(placesSvc))).then((parks) => {
        return parks.filter((park) => park.placeResult!.formatted_address!.includes("New York, NY"));
    });
}

async function routeBetween(directionSvc: import("./modern_services").DirectionService, parks: Park[]) {
    const waypoints: google.maps.DirectionsWaypoint[] = parks.map((p) => ({ location: p.place }));

    const req: google.maps.DirectionsRequest = {
        origin: 'New York Penn Station',
        destination: 'New York Penn Station',
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.WALKING,
        waypoints: waypoints,
    };
    console.log(req);
    directionSvc.routeAsync(req).then((res) => {
        const seconds = res.routes[0].legs.reduce((a, b) => (a + b.duration.value), 0);
        console.log(seconds);
    });
}

async function transitRoute(distanceMatrixSvc: import("./modern_services").DistanceMatrixService, parks: Park[]) {
    const points = parks.map((p) => p.place);
    const req: google.maps.DistanceMatrixRequest = {
        origins: points,
        destinations: points,
        travelMode: google.maps.TravelMode.TRANSIT,
    };
    distanceMatrixSvc.getDistanceMatrixAsync(req).then((res) => {
        console.log(res);
    });
}

(<any>window).initMap = initMap;
