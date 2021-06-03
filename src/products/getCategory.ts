import { DynamoDB } from 'aws-sdk';
import { HttpRequest, HttpResponse } from '../http'

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(event: HttpRequest): Promise<HttpResponse> {

  const params = {
    TableName: process.env.PRODUCTS_TABLE!,
    KeyConditionExpression: "category = :category",
    ExpressionAttributeValues: {
      ":category": event.pathParameters.category
    }
  }

  try {
    const data = await ddb.query(params).promise()
    if (data) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(data.Items)
      }
    }
    return {
      statusCode: 404,
      body: "Category not found"
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: "Internal Server Error Oops" + err
    }
  }
}