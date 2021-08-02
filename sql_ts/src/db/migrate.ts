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
    await conn.promise().query('DROP TABLE Products')
    await conn.promise().query('DROP TABLE Baskets')
    await conn.promise().query('DROP TABLE Orders')
    await conn.promise().query(
      `CREATE TABLE Products (
          productId VARCHAR(11) PRIMARY KEY,
          category VARCHAR(100),
          stock INT,
          price DECIMAL(6, 2),
          name VARCHAR(100),
          description TEXT,
          picture VARCHAR(100)
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
        name VARCHAR(50),
        email VARCHAR(50),
        street VARCHAR(50),
        housenr VARCHAR(50),
        city VARCHAR(50),
        postcode VARCHAR(50),
        products TEXT,
        sum DECIMAL(8, 2),
        orderStatus VARCHAR(50)
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
