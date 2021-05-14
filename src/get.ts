import { DynamoDB } from 'aws-sdk';
import { HttpRequest, HttpResponse } from './http'

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function getById(event: HttpRequest): Promise<HttpResponse> {
  const params = {
    TableName: process.env.PRODUCTS_TABLE!,
    Key: {
      id: event.pathParameters.id,
    },
  }

  try {
    const data = await ddb.get(params).promise()
    if (data.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(data.Item)
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