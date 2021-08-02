import mysql from 'mysql2'
import { HttpRequest, HttpResponse } from '../http'

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const body = JSON.parse(event.body)

  const amount = body.amount
  const category = body.category

  console.log(`Connecting to: ${process.env.DB_URL}:${process.env.DB_PORT}`)
  const conn = mysql.createConnection({
    host: process.env.DB_URL,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  switch (category) {
    case "plant":
      await Promise.all(generate(amount, "Zimmerpflanze ", "Eine dekorative Zimmerpflanze", "plant", conn))
      break;
    case "edible":
      await Promise.all(generate(amount, "Gemüse & Kräuter ", "Eine leckere Gemüse- oder Kräuterplanze", "edible", conn))
      break;
    case "flower":
      await Promise.all(generate(amount, "Blume ", "Eine schöne Blume", "flower", conn))
      break;
  }

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: "Created " + amount + " entries in category " + category
  }
}

function generate(amount: number, name: string, des: string, cat: string, conn: mysql.Connection): Promise<any>[] {
  const promises = Array<Promise<any>>()

  for (let i = 1; i <= amount; i++) {
    const productId = cat.charAt(0) + ('0000000000' + i).slice(-10)
    const price = getRandomPrice()
    const stock = getRandomStock()

    promises.push(conn.promise().query(
      `REPLACE INTO Products VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [productId, cat, stock, price, name + 1, des, '']))
  }

  return promises
}

function getRandomStock(): number {
  return Math.floor(Math.random() * 51)
}

function getRandomPrice(): number {
  return Math.floor(Math.random() * 70) + 1
}


