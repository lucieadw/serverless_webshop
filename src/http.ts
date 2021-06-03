import { DynamoDB } from "aws-sdk";

export interface HttpResponse {
  readonly statusCode: number;
  readonly headers?: object;
  readonly body: string;
}

interface Claims {
  readonly username: string;
}

interface Authorizer {
  readonly claims: Claims;
}

interface RequestContext {
  readonly authorizer: Authorizer
}

export interface HttpRequest {
  readonly body: string;
  readonly pathParameters: Record<string, string>;
  readonly requestContext: RequestContext
}
