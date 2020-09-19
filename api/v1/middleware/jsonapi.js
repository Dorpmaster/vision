import {author, version} from '../package.json';

const responseFormatter = async handler => {
  handler.response = handler.response || {
    statusCode: 200,
    body: {},
    headers: {},
  };

  handler.response.headers = Object.assign(
      {},
      {
        'Content-Type': 'application/vnd.api+json',
      },
      handler.response.headers,
  );

  const body = {
    jsonapi: {version: '1.0'},
    meta: {
      version: `v${version}`,
      authors: author,
      now: new Date().toISOString(),
    },
    data: [],
  };

  const responseBody = handler.response.body;

  handler.response.body = Object.assign({}, body, responseBody);

  if (responseBody.jsonapi) {
    handler.response.body.jsonapi = Object.assign({}, body.jsonapi,
        responseBody.jsonapi);
  }

  if (responseBody.meta) {
    handler.response.body.meta = Object.assign({}, body.meta,
        responseBody.meta);
  }

  if (responseBody.data) {
    handler.response.body.data = responseBody.data;
  }

  handler.response.body = JSON.stringify(handler.response.body);
};

export default () => ({
  after: responseFormatter,
});
