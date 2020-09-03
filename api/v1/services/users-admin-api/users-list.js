import {success} from '../../libs/response-lib';

export const main = async (event, context) => {
  return success({
    test: 'test',
  });
};