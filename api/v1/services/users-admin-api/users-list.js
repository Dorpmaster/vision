import {success, internalServerError} from '../../libs/response-lib';
import AWS from 'aws-sdk';

const provider = new AWS.CognitoIdentityServiceProvider();

export const main = async (event, context) => {
  const listUsersRequest = {
    UserPoolId: process.env.USER_POOL_ID,
    Limit: 10,
  };

  try {
    const users = await provider.listUsers(listUsersRequest).promise();
    console.log(JSON.stringify(users));

    return success({
      users: users.Users ? users.Users : [],
      token: users.PaginationToken ? users.PaginationToken : null,
    });
  } catch (err) {
    return internalServerError(err.message);
  }
};