import { DynamoDB } from 'aws-sdk';
import { HttpRequest, HttpResponse } from './http'

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const params = {
    TableName: process.env.PRODUCTS_TABLE!,
    Key: {
      category: event.pathParameters.category,
      productId: event.pathParameters.id
    },
  }

  try {
    await ddb.delete(params).promise()
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: "Item deleted"
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: "Internal Server Error Oops" + err
    }
  }
}