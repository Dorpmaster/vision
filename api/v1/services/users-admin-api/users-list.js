import jsonApiResponse from '../../libs/response-lib';
import AWS from 'aws-sdk';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import doNotWaitForEmptyEventLoop
  from '@middy/do-not-wait-for-empty-event-loop';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import jsonApiFormatter from '../../middleware/jsonapi';
import cors from '@middy/http-cors';

const provider = new AWS.CognitoIdentityServiceProvider();

export const main = middy(async (event, context) => {
  const listUsersRequest = {
    UserPoolId: process.env.USER_POOL_ID,
    Limit: 10,
  };

  const users = await provider.listUsers(listUsersRequest).promise();
  const data = [];
  const meta = {
    paginationToken: users.PaginationToken || null,
  };

  if (users.Users && users.Users.length) {
    users.Users.forEach(user => {
      data.push({
        type: 'users',
        id: user.Username,
        attributes: user.Attributes,
      });
    });
  }

  return jsonApiResponse(data, meta);
}).use(doNotWaitForEmptyEventLoop())
  .use(httpEventNormalizer())
  .use(httpHeaderNormalizer())
  .use(jsonApiFormatter())
  .use(httpErrorHandler())
  .use(cors({credentials: true}));
