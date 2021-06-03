import { DynamoDB } from 'aws-sdk';
import { CognitoEvent } from '../cognito';

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(event: CognitoEvent): Promise<CognitoEvent> {
  if(await newUser(event.userName)){
    const params = {
      TableName: process.env.BASKET_TABLE!,
      Item: {
        userId: event.userName,
        products: [] //empty array basketProduct
      }
    }
    try {
      await ddb.put(params).promise()
      console.log("Basket created for " + event.userName)
    } catch (err) {
      console.error(err)
    }
  }
  return event
}

async function newUser(userId: string): Promise<boolean>{
  const params = {
    TableName: process.env.BASKET_TABLE!,
    Key: {
      userId
    },
  }
  const data = await ddb.get(params).promise()
  if(data.Item){ //falls daten gefunden wurden, muss nicht neu angelegt werden
    return false
  }
  return true
}
