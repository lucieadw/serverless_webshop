import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as lambdaes from '@aws-cdk/aws-lambda-event-sources';
import * as api from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as sns from '@aws-cdk/aws-sns';
import * as path from 'path';

export class DynamoTsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const orderTopic = new sns.Topic(this, 'OrderRequestTopic')
    const productsTable = dynamodb.Table.fromTableArn(this, 'ProductTable', cdk.Fn.importValue('ProductTableArn'))
    const basketTable = dynamodb.Table.fromTableArn(this, 'BasketTable', cdk.Fn.importValue('BasketTableArn'))
    const ordersTable = dynamodb.Table.fromTableArn(this, 'OrderTable', cdk.Fn.importValue('OrderTableArn'))

    const env = {
      'PRODUCTS_TABLE': productsTable.tableName,
      'BASKET_TABLE': basketTable.tableName,
      'ORDERS_TABLE': ordersTable.tableName,
      'ORDER_TOPIC': orderTopic.topicArn
    }

    /////////////////////////////////////////// REST API ///////////////////////////////////////////
    const restApi = new api.RestApi(this, 'DynamoTsApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: api.Cors.ALL_ORIGINS,
        allowMethods: api.Cors.ALL_METHODS
      }
    })

    //************************ BASKET ************************
    const basketsRes = restApi.root.addResource('baskets')
    const basketRes = basketsRes.addResource('{userId}')
    basketRes.addMethod('get', this.createLambdaInt('GetBasket', 'basket/getBasket.ts', env))
    basketRes.addResource('update').addMethod('put', this.createLambdaInt('UpdateBasket', 'basket/updateBasket.ts', env))
    basketRes.addResource('add').addMethod('put', this.createLambdaInt('AddToBasket', 'basket/addToBasket.ts', env))

    //************************ ORDERS ************************
    const ordersRes = restApi.root.addResource('orders')
    const orderRes = ordersRes.addResource('{userId}')
    orderRes.addMethod('get', this.createLambdaInt('GetAllOrders', 'orders/getAllOrders.ts', env))
    orderRes.addMethod('post', this.createLambdaInt('CreateOrderRequest', 'orders/createOrderRequest.ts', env))
    const orderNoRes = orderRes.addResource('{orderNo}')
    orderNoRes.addMethod('get', this.createLambdaInt('GetOrder', 'orders/getOrder.ts', env))
    orderNoRes.addMethod('delete', this.createLambdaInt('CancelOrder', 'orders/cancelOrder.ts', env))
    // SNS Topic Message
    const createOrder = this.createLambda('CreateOrder', 'orders/createOrder.ts', env)
    createOrder.addEventSource(new lambdaes.SnsEventSource(orderTopic))

    //************************ PRODUCTS **********************
    const productsRes = restApi.root.addResource('products')
    productsRes.addMethod('get', this.createLambdaInt('GetAllProducts', 'products/getAll.ts', env))
    productsRes.addMethod('post', this.createLambdaInt('CreateProduct', 'products/create.ts', env))
    const prodCatRes = productsRes.addResource('{category}')
    prodCatRes.addMethod('get', this.createLambdaInt('GetCategroy', 'products/getCategory.ts', env))
    const prodCatIdRes = prodCatRes.addResource('{id}')
    prodCatIdRes.addMethod('get', this.createLambdaInt('GetProduct', '/products/get.ts', env))
    prodCatIdRes.addMethod('delete', this.createLambdaInt('DeleteProduct', '/products/delete.ts', env))
    prodCatIdRes.addMethod('put', this.createLambdaInt('UpdateProduct', '/products/update.ts', env))

    //************************ GENERATOR **********************
    const generatorRes = restApi.root.addResource('generator')
    generatorRes.addMethod('post', this.createLambdaInt('GenerateProducts', 'products/generator.ts', env))
  }

  // Integration for APIGATEWAY
  createLambdaInt(name: string, entry: string, environment: { [key: string]: string }): api.LambdaIntegration {
    return new api.LambdaIntegration(this.createLambda(name, entry, environment))
  }

  createLambda(name: string, entry: string, environment: { [key: string]: string }): lambda.NodejsFunction {
    const func = new lambda.NodejsFunction(this, name, {
      entry: path.join(__dirname, `/../../dynamo_ts/src/${entry}`),
      timeout: cdk.Duration.seconds(30),
      environment
    })
    func.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:*', 'sns:*'],
      resources: ['*']
    }))
    return func
  }
}
