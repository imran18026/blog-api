import { IGenericErrorResponse } from '../interfaces/common';

const handleJWTError = (error: Error): IGenericErrorResponse => {
  let message = 'Invalid token';

  if (error.name === 'TokenExpiredError') {
    message = 'Token expired';
  } else if (error.message === 'invalid signature') {
    message = 'Invalid token signature';
  } else if (error.message === 'jwt malformed') {
    message = 'Malformed token';
  } else if (error.message === 'jwt must be provided') {
    message = 'Token must be provided';
  } else {
    message = error.message;
  }

  const statusCode = 401;

  return {
    statusCode,
    message,
    errorMessages: [
      {
        path: 'token',
        message,
      },
    ],
  };
};

export default handleJWTError;
