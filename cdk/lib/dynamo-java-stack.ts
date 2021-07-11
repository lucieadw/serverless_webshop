import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda'; //wie java
import * as api from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';
import * as path from 'path';

export class DynamoJavaStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // const userPool = new cognito.UserPool(this, 'UserPool', {
        //   userPoolName: 'WebshopUserPool',
        //   signInCaseSensitive: false,
        //   signInAliases: { email: true }
        // })
        //
        // new cognito.UserPoolClient(this, 'UserPoolClient', {
        //   userPool,
        //   userPoolClientName: 'FrontendClient',
        //   generateSecret: false,
        //   authFlows: { userSrp: true },
        //   supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO],
        //   preventUserExistenceErrors: true,
        //   oAuth: {
        //     flows: { authorizationCodeGrant: true },
        //     scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL]
        //   }
        // })

        // const orderReqQueue = new sqs.Queue(this, 'OrderRequestQueue')

        // const productsTable = new dynamodb.Table(this, 'Products', {
        //   tableName: 'Products',
        //   partitionKey: {
        //     name: 'category',
        //     type: dynamodb.AttributeType.STRING
        //   },
        //   sortKey: {
        //     name: 'productId',
        //     type: dynamodb.AttributeType.STRING
        //   }
        // })
        //
        // const basketTable = new dynamodb.Table(this, 'Basket', {
        //   tableName: 'Basket',
        //   partitionKey: {
        //     name: 'userId',
        //     type: dynamodb.AttributeType.STRING
        //   }
        // })
        //
        // const ordersTable = new dynamodb.Table(this, 'Orders', {
        //   tableName: 'Orders',
        //   partitionKey: {
        //     name: 'userId',
        //     type: dynamodb.AttributeType.STRING
        //   },
        //   sortKey: {
        //     name: 'orderNo',
        //     type: dynamodb.AttributeType.STRING
        //   }
        // })

        const env = {
            //   'PRODUCTS_TABLE': productsTable.tableName,
            //   'BASKET_TABLE': basketTable.tableName,
            //   'ORDERS_TABLE': ordersTable.tableName,
            //   'ORDER_QUEUE_URL': orderReqQueue.queueUrl
        }

        /////////////////////////////////////////// REST API ///////////////////////////////////////////
        const restApi = new api.RestApi(this, 'DynamoJavaApi', {
            defaultCorsPreflightOptions: {
                allowOrigins: api.Cors.ALL_ORIGINS,
                allowMethods: api.Cors.ALL_METHODS
            }
        })

        //************************ BASKET ************************
        // userPool.addTrigger(cognito.UserPoolOperation.POST_AUTHENTICATION, this.createLambda('CreateBasket', 'basket/createBasket.ts', env))
        // const basketRes = restApi.root.addResource('basket')
        // basketRes.addMethod('get', this.createLambdaInt('GetBasket', 'basket/getBasket.ts', env), authOpts)
        // // basketRes.addMethod('post', this.createLambdaInt('CreateBasket', 'basket/createBasket.ts', env), authOpts)
        // const updateBasketRes = basketRes.addResource('update')
        // updateBasketRes.addMethod('put', this.createLambdaInt('UpdateBasket', 'basket/updateBasket.ts', env), authOpts)
        // const addBasketRes = basketRes.addResource('add')
        // addBasketRes.addMethod('put', this.createLambdaInt('AddToBasket', 'basket/addToBasket.ts', env), authOpts)

        //************************ ORDERS ************************
        // const ordersRes = restApi.root.addResource('orders')
        // ordersRes.addMethod('get', this.createLambdaInt('GetAllOrders', 'orders/getAllOrders.ts', env), authOpts)
        // ordersRes.addMethod('post', this.createLambdaInt('CreateOrderRequest', 'orders/createOrderRequest.ts', env), authOpts)
        // const orderNoRes = ordersRes.addResource('{orderNo}')
        // orderNoRes.addMethod('get', this.createLambdaInt('GetOrder', 'orders/getOrder.ts', env), authOpts)
        // orderNoRes.addMethod('delete', this.createLambdaInt('CancelOrder', 'orders/cancelOrder.ts', env), authOpts)
        // // SQS Queue Message
        // const createOrder = this.createLambda('CreateOrder', 'orders/createOrder.ts', env)
        // createOrder.addEventSource(new lambdaes.SqsEventSource(orderReqQueue))

        //************************ PRODUCTS **********************
        const productsRes = restApi.root.addResource('products')
        productsRes.addMethod('get', this.createLambdaInt('GetAllProducts', 'products.GetAllProducts', env))
        productsRes.addMethod('get', this.createLambdaInt('CreateProduct', 'products.CreateProduct', env))
        // const prodCatRes = productsRes.addResource('{category}')
        // prodCatRes.addMethod('get', this.createLambdaInt('GetCategroy', 'products/getCategory.ts', env))
        // const prodCatIdRes = prodCatRes.addResource('{id}')
        // prodCatIdRes.addMethod('get', this.createLambdaInt('GetProduct', '/products/getProduct.ts', env))
        // prodCatIdRes.addMethod('delete', this.createLambdaInt('DeleteProduct', '/products/deleteProduct.ts', env))
        // prodCatIdRes.addMethod('put', this.createLambdaInt('UpdateProduct', '/products/updateProduct.ts', env))

        //************************ GENERATOR **********************
        // const generatorRes = restApi.root.addResource('generator')
        // generatorRes.addMethod('post', this.createLambdaInt('GenerateProducts', 'products/generator.ts', env), authOpts)
    }

    // Integration for APIGATEWAY
    createLambdaInt(name: string, handler: string, environment: { [key: string]: string }): api.LambdaIntegration {
        return new api.LambdaIntegration(this.createLambda(name, handler, environment))
    }

    createLambda(name: string, handler: string, environment: { [key: string]: string }): lambda.Function {
        const func = new lambda.Function(this, name, {
            runtime: lambda.Runtime.JAVA_11,
            code: lambda.Code.fromAsset(path.join(__dirname, `/../../dynamo_java/build/distributions/dynamo_java.zip`)),
            handler,
            environment
        })
        func.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['dynamodb:*', 'sqs:*'],
            resources: ['*']
        }))
        return func
    }
}
