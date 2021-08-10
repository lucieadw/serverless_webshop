export interface HttpResponse {
  readonly statusCode: number;
  readonly headers?: object;
  readonly body: string;
}

export interface HttpRequest {
  readonly body: string;
  readonly resource: string;
  readonly httpMethod: string;
  readonly pathParameters: Record<string, string>;
}
