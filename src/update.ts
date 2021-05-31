import { DynamoDB } from 'aws-sdk';
import { CreateProduct, validateUpdateProduct } from './forms';
import { HttpRequest, HttpResponse } from './http'

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const form: CreateProduct = JSON.parse(event.body)
  const validationErr = validateUpdateProduct(form)

  if (validationErr) {
    return {
      statusCode: 400,
      body: validationErr
    }
  }

  const params = {
    TableName: process.env.PRODUCTS_TABLE!,
    Key: {
      category: event.pathParameters.category,
      productId: event.pathParameters.id
    },
    UpdateExpression: "set #name=:n, description=:d, price=:p, stock=:s, picture=:pic",
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ExpressionAttributeValues: {
      ":n": form.name,
      ":d": form.description,
      ":p": form.price,
      ":s": form.stock,
      ":pic": form.picture

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
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(data.Attributes)
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