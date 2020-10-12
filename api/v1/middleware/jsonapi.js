import {author, version} from '../package.json';
import _ from 'lodash';
import createError from 'http-errors';

const defaults = {
  allowedFields: {},
};

const addContentTypeHeader = handler => {
  handler.response.headers = Object.assign(
      {},
      {
        'Content-Type': 'application/vnd.api+json',
      },
      handler.response.headers,
  );
}

const responseFormatter = async handler => {
  handler.response = handler.response || {
    statusCode: 200,
    body: {},
    headers: {},
  };

  addContentTypeHeader(handler);

  const body = {
    jsonapi: {version: '1.0'},
    meta: {
      version: `v${version}`,
      authors: author,
      now: new Date().toISOString(),
    },
    data: [],
    links: {},
    included: [],
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

  if (responseBody.links) {
    handler.response.body.links = responseBody.links;
  }

  if (_.isEmpty(handler.response.body.links)) {
    delete (handler.response.body.links);
  }

  if (responseBody.included) {
    handler.response.body.included = responseBody.included;
  }

  if (_.isEmpty(handler.response.body.included)) {
    delete (handler.response.body.included);
  }

  handler.response.body = JSON.stringify(handler.response.body);
};

const requestProcessor = async (config, handler) => {
  const options = Object.assign({}, defaults, config);

  handler.event.jsonapi = {
    fields: {},
    include: {},
  };

  const multiValueQueryStringParameters = _.get(handler,
      'event.multiValueQueryStringParameters', {});
  const queryStringParameters = _.get(handler, 'event.queryStringParameters',
      {});

  if (_.has(queryStringParameters, 'fields')) {
    throw new createError.BadRequest(
        'The fields parameter MUST be like a "fields[TYPE]".');
  }

  _.forIn(queryStringParameters, (value, key) => {
    const resourceMatch = key.match(/^fields\[(\w+)]$/);
    if (!resourceMatch) return;

    const [, resource] = resourceMatch;

    const multiValueParam = _.get(multiValueQueryStringParameters, key);
    if (multiValueParam) {
      handler.event.jsonapi.fields[resource] = _.sortBy(
          _.uniq(
              _.flattenDeep(
                  _.map(multiValueParam, value => {
                    return _.split(value, ',');
                  }),
              ),
          ),
      );
    } else {
      handler.event.jsonapi.fields[resource] = [value];
    }
  });

  if (!_.isEmpty(options.allowedFields) &&
      !_.isEmpty(handler.event.jsonapi.fields)) {
    _.forIn(options.allowedFields, (value, key) => {
      if (!_.has(handler.event.jsonapi.fields, key)) return;

      const disallowedFields = _.difference(handler.event.jsonapi.fields[key],
          options.allowedFields[key]);
      if (!_.isEmpty(disallowedFields)) {
        let message;
        const allowedFieldsList = _.join(options.allowedFields[key], ', ');

        if (options.allowedFields[key].length > 1) {
          message = `Only ${allowedFieldsList} fields are allowed for the ${key} resource.`;
        } else {
          message = `Only ${allowedFieldsList} field is allowed for the ${key} resource.`;
        }

        throw new createError.BadRequest(message);
      }
    });
  }
};

const errorFormatter = async handler => {
  handler.response = handler.response || {
    statusCode: 500,
    body: {},
    headers: {},
  };

  addContentTypeHeader(handler);

  const body = {
    jsonapi: {version: '1.0'},
    errors: [
      {
        status: '500',
        title: 'Internal Server Error',
        detail: 'Please contact the author and provide `X-Request-ID` value.',
      },
    ],
  };

  const responseBody = handler.response.body;

  handler.response.body = Object.assign({}, body, responseBody);

  if (responseBody.jsonapi) {
    handler.response.body.jsonapi = Object.assign({}, body.jsonapi,
        responseBody.jsonapi);
  }

  if (responseBody.meta) {
    handler.response.body.meta = responseBody.meta;
  }

  if (handler.error instanceof createError.HttpError) {
    handler.response.statusCode = handler.error.statusCode;
    handler.response.body.errors = [
      {
        status: handler.error.statusCode.toString(),
        title: handler.error.name,
        detail: handler.error.message,
      }
    ];
  }

  handler.response.body = JSON.stringify(handler.response.body);
};

export default (config) => ({
  before: requestProcessor.bind(null, config),
  after: responseFormatter,
  onError: errorFormatter,
});
