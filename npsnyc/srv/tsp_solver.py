import flask

from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp


def tsp_solver(request):
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    request_json = request.get_json(silent=True)
    distance_matrix = request_json['matrix']

    manager = pywrapcp.RoutingIndexManager(len(distance_matrix), 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    def compute_distance(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(compute_distance)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

    solution = routing.SolveWithParameters(search_parameters)

    result = {
        'duration': -1,
        'path': [],
    }
    if solution:
        result['duration'] = solution.ObjectiveValue()
        index = routing.Start(0)
        while not routing.IsEnd(index):
            result['path'].append(manager.IndexToNode(index))
            index = solution.Value(routing.NextVar(index))
        result['path'].append(manager.IndexToNode(index))
    return (flask.jsonify(result), 200, {'Access-Control-Allow-Origin': '*'})
