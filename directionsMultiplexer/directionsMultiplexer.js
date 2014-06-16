/**
 * Support more than the max waypoints for the DirectionService by splitting
 * and merging the results.
 *
 * @param {String} start The start location.
 * @param {String} end The end location.
 * @param {Array.<String>} waypoints Array of waypoints to visit along the way.
 * @param {Number} max_waypoints_per_request The max waypoints per request.
 * @param {Function} callback Function to call with the final DirectionsResult.
 */
function multiDirectionsRequester(start, end, waypoints,
                                  max_waypoints_per_request, callback) {
  // Number of seperate requests we will make.
  var max_requests = Math.ceil(
      (1 + waypoints.length) / (max_waypoints_per_request - 1));

  // Service to make the requests with.
  var directionsService = new google.maps.DirectionsService();

  // Array to hold the results before we can merge them.
  var results = [];

  for (var i = 0; i < max_requests; i++) {
    var request = {
      optimizeWaypoints: false,
      travelMode: google.maps.DirectionsTravelMode.DRIVING,
      waypoints: []
    };
    var remaining = waypoints.length + 2 - i * (max_waypoints_per_request - 1);
    var request_remaining = Math.min(max_waypoints_per_request, remaining);
    for (var j = 0; j < request_remaining; j++) {
      /*
       * The logic in here is a bit more complicated than I'd like,
       * but seems necessary to work with the `start` and `end` variables.
       * TODO: Remove this complexity and add start and end to the array.
       */
      var waypoint_index = i * (max_waypoints_per_request - 1) - 1;
      if (j == 0) {
        if (i == 0) {
          request.origin = start;
        } else {
          request.origin = waypoints[waypoint_index];
        }
      } else {
        if (request.destination) {
          request.waypoints.push({
            location: request.destination,
            stopover: true
          });
        }
        if (i == (max_requests - 1) && j == (remaining - 1)) {
          request.destination = end;
        } else {
          request.destination = waypoints[waypoint_index + j];
        }
      }
    }
    var results_callback = wrappedDirectionCallback(
        results, i, max_requests, callback);
    directionsService.route(request, results_callback);
  }
}


/**
 * Generate a callback function for the directions service.
 *
 * Stuff the results, in order, in a global array.
 *
 * @param {Array} results Array to merge results into.
 * @param {Number} request_id The order id of this request so we can
 *     re-assemble them in order.
 * @param {Number} max_requests The total number of requests to be made.
 *     Used to determine when we should merge the results.
 * @param {Function} callback Function to be called when all the results
 *     are done.
 * @return {Function} Properly bound callback function.
 */
function wrappedDirectionCallback(results, request_id,
                                  max_requests, callback) {
  return function(result, status) {
    results[request_id] = result;
    // If the array is full of actual results, merge then
    // run the callback.
    if (results.filter(String).length == max_requests) {
      var overall = mergeResults(results);
      callback(overall, google.maps.DirectionsStatus.OK);
    }
  }
}


/**
 * Merge a bunch of DirectionsResults together.
 *
 * Merges the first route from an array of DirectionsResult objects to
 * build one huge DirectionsResult object.
 *
 * @param {Array.<google.maps.DirectionsResult>} directionsResults An array
 *     of DirectionsResult objects.
 * @return {google.maps.DirectionsResult} Merged results.
 */
function mergeResults(directionsResults) {
  var overall_results;
  for (var i = 0; i < directionsResults.length; i++) {
    result = directionsResults[i];
    if (!overall_results) {
      // We use the first result as the base.
      overall_results = result;
    } else {
      // Append the route data arrays (legs and paths) to the overall.
      overall_results.routes[0].legs.push.apply(
          overall_results.routes[0].legs,
          result.routes[0].legs
      );
      overall_results.routes[0].overview_path.push.apply(
          overall_results.routes[0].overview_path,
          result.routes[0].overview_path
      );
      // Update the bounds to include the new route area.
      overall_results.routes[0].bounds.union(result.routes[0].bounds);
    }
  }
  return overall_results;
}
