import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as lambdaes from '@aws-cdk/aws-lambda-event-sources';
import * as api from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';
import * as path from 'path';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import * as sns from '@aws-cdk/aws-sns';

export class SqlTsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const orderTopic = new sns.Topic(this, 'OrderRequestTopic')

    const vpc = ec2.Vpc.fromVpcAttributes(this, 'Vpc', {
      vpcId: 'vpc-11b1d67b',
      privateSubnetIds: ['subnet-66024c0c', 'subnet-51eb6e2d', 'subnet-6b971f27'],
      availabilityZones: ['eu-central-1a', 'eu-central-1b', 'eu-central-1c'],
    })

    const dbCredentials = {
      username: 'test',
      password: 'test1234'
    }
    const database = new rds.DatabaseInstance(this, 'SqlDatabase', {
      engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0_23 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      publiclyAccessible: false,
      allocatedStorage: 5,
      backupRetention: cdk.Duration.days(0),
      credentials: {
        username: dbCredentials.username,
        password: cdk.SecretValue.plainText(dbCredentials.password)
      },
      vpc
    })

    const env = {
      'DB_USERNAME': dbCredentials.username,
      'DB_PASSWORD': dbCredentials.password,
      'DB_URL': database.dbInstanceEndpointAddress,
      'DB_PORT': database.dbInstanceEndpointPort,
      'ORDER_TOPIC': orderTopic.topicArn
    }

    /////////////////////////////////////////// REST API ///////////////////////////////////////////
    const restApi = new api.RestApi(this, 'SqlTsApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: api.Cors.ALL_ORIGINS,
        allowMethods: api.Cors.ALL_METHODS
      }
    })

    //************************ BASKET ************************
    /*const basketsRes = restApi.root.addResource('baskets')
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
    createOrder.addEventSource(new lambdaes.SnsEventSource(orderTopic))*/

    //************************ PRODUCTS **********************
    /*const productsRes = restApi.root.addResource('products')
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
    generatorRes.addMethod('post', this.createLambdaInt('GenerateProducts', 'products/generator.ts', env))*/
  }
  // Integration for APIGATEWAY
  createLambdaInt(name: string, entry: string, environment: { [key: string]: string }): api.LambdaIntegration {
    return new api.LambdaIntegration(this.createLambda(name, entry, environment))
  }

  createLambda(name: string, entry: string, environment: { [key: string]: string }): lambda.NodejsFunction {
    const func = new lambda.NodejsFunction(this, name, {
      entry: path.join(__dirname, `/../../dynamo_ts/src/${entry}`),
      environment
    })
    func.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sns:*', 'rds:*'],
      resources: ['*']
    }))
    return func
  }
}
