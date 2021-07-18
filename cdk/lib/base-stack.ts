import * as cdk from '@aws-cdk/core';
import * as sns from '@aws-cdk/aws-sns';
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class BaseStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = new dynamodb.Table(this, 'ProductTable', {
      tableName: 'ProductTable',
      partitionKey: {
        name: 'category',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'productId',
        type: dynamodb.AttributeType.STRING
      }
    })
    new cdk.CfnOutput(this, 'ProductTableArn', {
      exportName: 'ProductTableArn',
      value: productsTable.tableArn
    })

    const basketTable = new dynamodb.Table(this, 'BasketTable', {
      tableName: 'BasketTable',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING
      }
    })
    new cdk.CfnOutput(this, 'BasketTableArn', {
      exportName: 'BasketTableArn',
      value: basketTable.tableArn
    })

    const ordersTable = new dynamodb.Table(this, 'OrderTable', {
      tableName: 'OrderTable',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'orderNo',
        type: dynamodb.AttributeType.STRING
      }
    })
    new cdk.CfnOutput(this, 'OrderTableArn', {
      exportName: 'OrderTableArn',
      value: ordersTable.tableArn
    })
  }
}
