import { DynamoDB } from 'aws-sdk';
import { HttpRequest, HttpResponse } from '../http'

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const body = JSON.parse(event.body)

  const amount = body.amount
  const category = body.category

/*   await Promise.all(
    generatePlant(amount, "Zimmerpflanze ", "Eine dekorative Zimmerpflanze", "plant")
      .concat(generatePlant(amount, "Gemüse & Kräuter ", "Eine leckere Gemüse- oder Kräuterplanze", "edible"))
      .concat(generatePlant(amount, "Blume ", "Eine schöne Blume", "flower"))
  ) */

  switch (category) {
    case "plant":
       await Promise.all(generatePlant(amount, "Zimmerpflanze ", "Eine dekorative Zimmerpflanze", "plant"))
      break;
    case "edible":
      await Promise.all(generatePlant(amount, "Gemüse & Kräuter ", "Eine leckere Gemüse- oder Kräuterplanze", "edible"))
      break;
    case "flower":
      await Promise.all(generatePlant(amount, "Blume ", "Eine schöne Blume", "flower"))
      break;
  }

  return {
    statusCode: 201,
    body: "Created " + amount + " entries in category " + category
  }
}

function generatePlant(amount: number, name: string, des: string, cat: string): Promise<any>[] {
  const promises = Array<Promise<any>>()

  for (let i = 1; i <= amount; i++) {
    const params = {
      TableName: process.env.PRODUCTS_TABLE!,
      Item: {
        productId: cat.charAt(0) + ('0000000000' + i).slice(-10),
        name: name + i,
        description: des,
        price: getRandomPrice(),
        stock: getRandomStock(),
        category: cat,
        picture: ""
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
