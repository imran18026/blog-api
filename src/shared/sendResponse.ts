import { Response } from 'express';

type IApiReponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  data?: T | null;
};

const sendResponse = <T>(res: Response, data: IApiReponse<T>): void => {
  const responseData: IApiReponse<T> = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message ?? null,
    ...(data.meta !== undefined && { meta: data.meta }),
    ...(data.data !== undefined && { data: data.data }),
  };

  res.status(data.statusCode).json(responseData);
};

export default sendResponse;
