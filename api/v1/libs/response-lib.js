export function success(body) {
  return buildResponse(200, body);
}

export function internalServerError(body) {
  return buildResponse(500, body);
}

function buildResponse(httpStatusCode, body) {
  return {
    statusCode: httpStatusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
  };
}