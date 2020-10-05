export default ({data = [], meta = {}, links = {}, included = []}) => {
  const body = {
    data,
    meta,
    links,
    included,
  };
  return apiGetawayResponse(200, body);
};

function apiGetawayResponse(httpStatusCode, body) {
  return {
    statusCode: httpStatusCode,
    body: body,
  };
}