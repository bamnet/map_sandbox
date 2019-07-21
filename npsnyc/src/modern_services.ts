import { RateLimiter } from 'limiter';

export class PlacesService extends google.maps.places.PlacesService {
    rateLimiter = new RateLimiter(2, 'second');

    async findPlaceFromQueryAsync(req: google.maps.places.FindPlaceFromQueryRequest) {
        await this.waitForToken();
        return new Promise(
            (
                resolve: (result: google.maps.places.PlaceResult[]) => void,
                reject: (status: google.maps.places.PlacesServiceStatus) => void
            ) => {
                super.findPlaceFromQuery(req, (results, status) => {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        resolve(results);
                    } else {
                        reject(status);
                    }

                });
            });
    }

    private async waitForToken() {
        return new Promise((resolve) => {
            this.rateLimiter.removeTokens(1, () => resolve());
        });
    }
}

export class DirectionService extends google.maps.DirectionsService {
    rateLimiter = new RateLimiter(2, 'second');

    async routeAsync(req: google.maps.DirectionsRequest) {
        await this.waitForToken();
        return new Promise(
            (
                resolve: (result: google.maps.DirectionsResult) => void,
                reject: (status: google.maps.DirectionsStatus) => void
            ) => {
                super.route(req, (results, status) => {
                    if (status == google.maps.DirectionsStatus.OK) {
                        resolve(results);
                    } else {
                        reject(status);
                    }

                });
            });
    }

    private async waitForToken() {
        return new Promise((resolve) => {
            this.rateLimiter.removeTokens(1, () => resolve());
        });
    }
}

export class DistanceMatrixService extends google.maps.DistanceMatrixService {
    rateLimiter = new RateLimiter(2, 'second');

    static readonly maxElements = 100;

    async getDistanceMatrixAsync(req: google.maps.DistanceMatrixRequest) {
        // If the matrix is too big, we have to split up the requests into smaller chunks.
        if (req.origins!.length * req.destinations!.length > DistanceMatrixService.maxElements) {
            return this.shardedMatrix(req);
        }
        await this.waitForToken();
        return new Promise(
            (
                resolve: (result: google.maps.DistanceMatrixResponse) => void,
                reject: (status: google.maps.DistanceMatrixStatus) => void
            ) => {
                super.getDistanceMatrix(req, (results, status) => {
                    if (status == google.maps.DistanceMatrixStatus.OK) {
                        resolve(results);
                    } else {
                        reject(status);
                    }

                });
            });
    }

    private async shardedMatrix(originalReq: google.maps.DistanceMatrixRequest) {
        // TODO(???): Handle the scenario where we should shard on origins instead of destinations.
        const origins = originalReq.origins!.length;
        const destinations = originalReq.destinations!.length;
        const requests = Math.ceil(origins * destinations / DistanceMatrixService.maxElements);
        const interval = Math.floor(DistanceMatrixService.maxElements / origins);

        const result: google.maps.DistanceMatrixResponse = {
            originAddresses: new Array(origins),
            destinationAddresses: new Array(destinations),
            rows: [],
        };

        for (let i = 0; i < requests; i++) {
            const lowerBound = i * interval;
            const upperBound = Math.min(((i + 1) * interval), destinations);

            const req = Object.assign({}, originalReq);
            req.destinations = req.destinations!.slice(lowerBound, upperBound);
            const subset = await this.getDistanceMatrixAsync(req);

            if (subset) {
                result.originAddresses = subset.originAddresses;
                subset.destinationAddresses.forEach((a, j) => {
                    result.destinationAddresses[lowerBound + j] = a;
                });
                subset.rows.forEach((row, r) => {
                    row.elements.forEach((e, j) => {
                        if (!result.rows[r]) {
                            result.rows[r] = { elements: [] };
                        }
                        result.rows[r].elements[lowerBound + j] = e;
                    });
                });
            }
            await this.sleep(5000);
        }
        return result;
    }

    private async waitForToken() {
        return new Promise((resolve) => {
            this.rateLimiter.removeTokens(100, () => resolve());
        });
    }

    async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}