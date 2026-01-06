import { Prisma } from '@prisma/client';
import { IGenericErrorMessage } from '../interfaces/error';
import { IGenericErrorResponse } from '../interfaces/common';

const handleClientError = (
  error: Prisma.PrismaClientKnownRequestError
): IGenericErrorResponse => {
  let errors: IGenericErrorMessage[] = [];
  let message = '';
  const statusCode = 400;

  if (error.code === 'P2025') {
    message = (error.meta?.cause as string) || 'Record not found!';
    errors = [
      {
        path: '',
        message,
      },
    ];
  } else if (error.code === 'P2003') {
    if (error.message.includes('delete()` invocation:')) {
      message = 'Delete failed';
      errors = [
        {
          path: '',
          message,
        },
      ];
    }
  } else if (error.code === 'P2002') {
    const target = error.meta?.target as string[] | undefined;
    const field = target?.[0] || 'field';
    message = `Unique constraint failed on the ${field}`;
    errors = [
      {
        path: field,
        message,
      },
    ];
  }

  return {
    statusCode,
    message,
    errorMessages: errors,
  };
};

export default handleClientError;
