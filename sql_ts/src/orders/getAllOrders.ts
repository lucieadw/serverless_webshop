import { DynamoDB } from 'aws-sdk';
import { HttpRequest, HttpResponse } from '../http'

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const userId = event.pathParameters['userId']
  const params = {
    TableName: process.env.ORDERS_TABLE!,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId
    },
  }

  try {
    const data = await ddb.query(params).promise()
    if (data.Items) {
      const order = data.Items
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(order)
      }
    }
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: "Item not found"
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: err.statusCode || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: "Internal Server Error Oops" + err
    }
  }
}

