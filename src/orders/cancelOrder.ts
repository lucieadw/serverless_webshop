import { DynamoDB } from 'aws-sdk';
import { HttpRequest, HttpResponse } from '../http'
import { OrderStatus } from './forms';


const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(event: HttpRequest): Promise<HttpResponse> {

  const params = {
    TableName: process.env.ORDERS_TABLE!,
    Key: {
      userId: event.requestContext.authorizer.claims.username,
      orderNo: event.pathParameters.orderNo
    },
    UpdateExpression: "set orderStatus=:s",
    ExpressionAttributeValues: {
      ":s": OrderStatus.Canceled,
    },
    ReturnValues: "ALL_NEW"
  }
  
  try {
    const data = await ddb.update(params).promise()
    if (data.Attributes) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        },
        body: 'Order was canceled'
      }
    }
    return {
      statusCode: 404,
      body: "Item not found"
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: "Internal Server Error Oops: " + err
    }
  }
}
