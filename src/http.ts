import { DynamoDB } from "aws-sdk";

export interface HttpResponse {
  readonly statusCode: number;
  readonly headers?: object;
  readonly body: string;
}

export interface HttpRequest {
  readonly body: string;
  readonly pathParameters: Record<string, string>;
}
