import mysql from 'mysql2'
import { HttpResponse } from '../http'

export async function handler(): Promise<HttpResponse> {
  console.log(`Connecting to: ${process.env.DB_URL}:${process.env.DB_PORT}`)
  const conn = mysql.createConnection({
    host: process.env.DB_URL,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
  try {
    console.log('Creating product table')
    await conn.promise().query(
      `CREATE TABLE Products (
          productid VARCHAR(11) PRIMARY KEY,
          category VARCHAR(100),
          stock INT,
          price DECIMAL(6, 2),
          item TEXT
      );`
    )
    console.log('Creating basket table')
    await conn.promise().query(
      `CREATE TABLE Baskets (
        id VARCHAR(100) PRIMARY KEY,
        products TEXT
      );`
    )
    console.log('Creating order table')
    await conn.promise().query(
      `CREATE TABLE Orders (
        orderNo VARCHAR(100) PRIMARY KEY,
        id VARCHAR(100),
        orderStatus VARCHAR(50),
        sum DECIMAL(8, 2),
        products TEXT,
        adress TEXT
      );`
    )
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: "Migration complete"
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(err)
    }
  }
}
