import { DynamoDB } from 'aws-sdk';
import { HttpRequest, HttpResponse } from '../http'

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const params = {
    TableName: process.env.ORDERS_TABLE!,
    Key: {
      userId: event.requestContext.authorizer.claims.username,
      orderNo: event.pathParameters.orderNo
    },
  }

  try {
    const data = await ddb.get(params).promise()
    if (data.Item) {
      const order = data.Item
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify(order)
      }
    }
    return {
      statusCode: 404,
      body: "Item not found"
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: "Internal Server Error Oops" + err
    }
  }
}
