import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaes from '@aws-cdk/aws-lambda-event-sources';
import * as api from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as sns from '@aws-cdk/aws-sns';
import * as path from 'path';

export class DynamoGoStack extends cdk.Stack {
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
        const restApi = new api.RestApi(this, 'DynamoGoApi', {
            defaultCorsPreflightOptions: {
                allowOrigins: api.Cors.ALL_ORIGINS,
                allowMethods: api.Cors.ALL_METHODS
            }
        })

        //************************ BASKET ************************
         const basketsRes = restApi.root.addResource('baskets')
         const basketRes = basketsRes.addResource('{userId}')
         basketRes.addMethod('get', this.createLambdaInt('GetBasket', 'basket/getBasket', env))
         const addBasketRes = basketRes.addResource('add')
         addBasketRes.addMethod('put', this.createLambdaInt('AddToBasket', 'basket/addToBasket', env))

        //************************ ORDERS ************************
         const ordersRes = restApi.root.addResource('orders')
         const orderRes = ordersRes.addResource('{userId}')
         orderRes.addMethod('get', this.createLambdaInt('GetAllOrders', 'orders/getAll', env))
         orderRes.addMethod('post', this.createLambdaInt('CreateOrderRequest', 'orders/createOrderRequest', env))
         const orderNoRes = orderRes.addResource('{orderNo}')
         orderNoRes.addMethod('get', this.createLambdaInt('GetOrder', 'orders/get', env))
         orderNoRes.addMethod('delete', this.createLambdaInt('CancelOrder', 'orders/cancel', env))
         // SNS Topic Message
         const createOrder = this.createLambda('CreateOrder', 'orders/createOrder', env)
         createOrder.addEventSource(new lambdaes.SnsEventSource(orderTopic))

        //************************ PRODUCTS **********************
         const productsRes = restApi.root.addResource('products')
         productsRes.addMethod('get', this.createLambdaInt('GetAllProducts', 'products/getAll', env))
         productsRes.addMethod('post', this.createLambdaInt('CreateProduct', 'products/create', env))
         const prodCatRes = productsRes.addResource('{category}')
         prodCatRes.addMethod('get', this.createLambdaInt('GetCategory', 'products/getCategory', env))
         const prodCatIdRes = prodCatRes.addResource('{id}')
         prodCatIdRes.addMethod('get', this.createLambdaInt('GetProduct', 'products/get', env))

    }

    // Integration for APIGATEWAY
    createLambdaInt(name: string, handler: string, environment: { [key: string]: string }): api.LambdaIntegration {
        return new api.LambdaIntegration(this.createLambda(name, handler, environment))
    }

    createLambda(name: string, handler: string, environment: { [key: string]: string }): lambda.Function {
      const func = new lambda.Function(this, name, {
        runtime: lambda.Runtime.GO_1_X,
        code: lambda.Code.fromAsset(path.join(__dirname, `/../../dynamo_go/bin`)),
        timeout: cdk.Duration.seconds(30),
        handler,
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
