import { ListParks, Park } from './parks';
import { TSPSolver } from './tsp_solver';

interface TripSummary {
    parks: Park[],
    duration: number,
    path: google.maps.LatLng[],
}

let placesSvc: import("./modern_services").PlacesService;
let directionSvc: import("./modern_services").DirectionService;
let distanceMatrixSvc: import("./modern_services").DistanceMatrixService;

async function initMap() {
    const services = await import('./modern_services');
    placesSvc = new services.PlacesService(<HTMLDivElement>document.getElementById('attr'));
    directionSvc = new services.DirectionService();
    distanceMatrixSvc = new services.DistanceMatrixService();

    const map = setupMap(document.getElementById('map')!);

    const nycParks = filterParks(placesSvc);
    nycParks.then((parks) => {
        return transitRoute(distanceMatrixSvc, directionSvc, parks);
        // return routeBetween(directionSvc, parks);
    }).then(res => {
        console.log(res);

        new google.maps.Polyline({
            path: res.path,
            map: map,
        });

        res.parks.forEach((p, i) => {
            console.log(p.placeResult);
            const marker = new google.maps.Marker({
                position: p.placeResult!.geometry!.location,
                label: `${i}`,
                title: p.name,
                map: map,
            });
        });
    });
};

function setupMap(elem: Element) {
    return new google.maps.Map(elem, {
        center: { lat: 40.745178, lng: -73.994294 },
        zoom: 13,
    });
}

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
    return directionSvc.routeAsync(req).then((res) => {
        const seconds = res.routes[0].legs.reduce((a, b) => (a + b.duration.value), 0);
        return <TripSummary>{
            parks: res.routes[0].waypoint_order.map(i => parks[i]),
            duration: seconds,
            path: res.routes[0].overview_path,
        };
    });
}

async function transitRoute(distanceMatrixSvc: import("./modern_services").DistanceMatrixService, directionSvc: import("./modern_services").DirectionService, parks: Park[]) {
    const origin = 'New York Penn Station';
    const points = parks.map((p) => p.place);
    points.unshift({ query: origin });
    const req: google.maps.DistanceMatrixRequest = {
        origins: points,
        destinations: points,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {modes: [
            google.maps.TransitMode.RAIL,
            google.maps.TransitMode.SUBWAY,
            google.maps.TransitMode.TRAIN,
            google.maps.TransitMode.TRAM,
        ]},
    };
    return distanceMatrixSvc.getDistanceMatrixAsync(req).then((res) => {
        const matrix = res.rows.map(row => row.elements.map(e => (e.duration ? e.duration.value : 999999999)));
        return TSPSolver(matrix);
    }).then((result) => {
        const orderedParks = result.path.filter(i => i != 0).map(i => parks[i - 1]);
        return Promise.all(orderedParks.map((p, i) => {
            const req: google.maps.DirectionsRequest = {
                origin: (i == 0 ? origin : { placeId: orderedParks[i - 1].placeId }),
                destination: { placeId: p.placeId },
                travelMode: google.maps.TravelMode.TRANSIT,
                transitOptions: {modes: [
                    google.maps.TransitMode.RAIL,
                    google.maps.TransitMode.SUBWAY,
                    google.maps.TransitMode.TRAIN,
                    google.maps.TransitMode.TRAM,
                ]},
            };
            return directionSvc.routeAsync(req);
        })).then((results) => {
            const result: TripSummary = {
                parks: orderedParks,
                duration: 0,
                path: [],
            };
            return results.reduce((a, b) => {
                a.duration += b.routes[0].legs.reduce((a, b) => (a + b.duration.value), 0);
                a.path.push(...b.routes[0].overview_path);
                return a;
            }, result);
        });
    });
}

(<any>window).initMap = initMap;
