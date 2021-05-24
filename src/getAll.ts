import { DynamoDB } from 'aws-sdk';
import { HttpResponse } from './http'

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(): Promise<HttpResponse> {
  const params = {
    TableName: process.env.PRODUCTS_TABLE!
  }
  // fetch items from database
  try {
    const data = await ddb.scan(params).promise()
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(data.Items)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: "Internal Server Error Oops" + err
    }
  }
}

