import { Handler, Context } from 'aws-lambda';
import { HttpResponse } from './http'

export async function hello(event: any, context: Context): Promise<HttpResponse> {
  return {
    statusCode: 200,
    body: 'Hello World!',
  };
};
