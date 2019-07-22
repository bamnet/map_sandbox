import { PlacesService } from "./modern_services";

const ParkNames = [
    'African Burial Ground NM',
    'Castle Clinton NM',
    'Eleanor Roosevelt NHS',
    // 'Ellis Island Immigration Museum',
    'Federal Hall N MEM',
    'Fire Island NS',
    'Fort Stanwix NM',
    'Gateway NRA',
    'General Grant N MEM',
    'Governors Island NM',
    'Hamilton Grange N MEM',
    'Harriet Tubman National Historical Park',
    'Home of Franklin D. Roosevelt NHS',
    'Lower East Side Tenement Museum NHS',
    'Martin Van Buren NHS',
    'National Parks of New York Harbor',
    'Sagamore Hill NHS',
    'Saint Paul’s Church NHS',
    'Saratoga NHP',
   // 'Statue of Liberty NM',
    'Stonewall NM',
    'Theodore Roosevelt Birthplace NHS',
    'Theodore Roosevelt Inaugural NHS',
    // 'Theodore Roosevelt NHS', 
    'Thomas Cole NHS',
    'Upper Delaware SRR',
    'Vanderbilt Mansion NHS',
    'Women’s Rights NHP',
];

export class Park {
    // Name of the park.
    name: string;

    // Place ID, once found.
    placeId?: string;

    // Cached Google Places API result.
    _placeResult?: google.maps.places.PlaceResult;

    set placeResult(result: google.maps.places.PlaceResult | undefined) {
        this._placeResult = result;
        if (result) {
            this.placeId = result.place_id
        } else {
            this.placeId = undefined;
        };
    }

    get placeResult(): google.maps.places.PlaceResult | undefined {
        return this._placeResult;
    }

    get place(): google.maps.Place {
        return {placeId: this.placeId};
    }

    constructor(name: string) {
        this.name = name;
    }

    async findPlace(svc: PlacesService) {
        const req = {
            query: this.name,
            locationBias: { lat: 40.730610, lng: -73.935242 },
            fields: ['place_id', 'formatted_address', 'name'],
        };
        return svc.findPlaceFromQueryAsync(req).then((results) => {
            this.placeResult = results[0];
            return this;
        });
    }
}

export function ListParks(): Park[] {
    return ParkNames.map(s => new Park(s));
}