import { DynamoDB } from 'aws-sdk';
import { HttpRequest, HttpResponse } from './http'
import * as uuid from 'uuid'

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function populate(event: HttpRequest): Promise<HttpResponse> {
  const body = JSON.parse(event.body)

  const amount = body.amount

  generatePlant(amount, "Zimmerpflanze ", "Eine dekorative Zimmerpflanze", "house")
  generatePlant(amount, "Gemüse & Kräuter ", "Eine leckere Gemüse- oder Kräuterplanze", "edible")
  generatePlant(amount, "Blume ", "Eine schöne Blume", "flower")

  return {
    statusCode: 201,
    body: "Created " + amount + " entries in three categories"
  }
}


function generatePlant(amount: number, name: string, des: string, cat: string): Promise<any>[] {
  const promises = Array<any>()
  for (let i = 1; i <= amount; i++) {

    const params = {
      TableName: process.env.PRODUCTS_TABLE!,
      Item: {
        id: uuid.v4(),
        name: name + i,
        description: des,
        price: getRandomPrice(),
        stock: getRandomStock(),
        category: cat
      }
    }
    promises.push(ddb.put(params).promise())
  }
  return promises
}

function getRandomStock(): number {
  return Math.floor(Math.random() * 51)
}
function getRandomPrice(): number {
  return Math.floor(Math.random() * 70) + 1
} 