export default (data, meta) => {
  const body = {
    data: data,
    meta: meta || {},
  };
  return apiGetawayResponse(200, body);
};

function apiGetawayResponse(httpStatusCode, body) {
  return {
    statusCode: httpStatusCode,
    body: body,
  };
}