const PATH = 'https://us-central1-river-carrier-523.cloudfunctions.net/tsp_solver';

interface TSPRequest {
    matrix: number[][];
}

interface TSPResponse {
    duration: number,
    path: number[],
}

export async function TSPSolver(matrix: number[][]): Promise<TSPResponse> {
    const req: TSPRequest = { matrix: matrix };
    return fetch(PATH, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req)
    }).then((raw_resp) => {
        return raw_resp.json() as Promise<TSPResponse>;
    });
}