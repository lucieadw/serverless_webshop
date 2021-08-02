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

    const sg = ec2.SecurityGroup.fromSecurityGroupId(this, 'SecGroup', 'sg-ce5657bb')

    //const vpc = ec2.Vpc.fromLookup(this, 'Vpc', { vpcId: 'vpc-11b1d67b' })
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'Vpc', {
      vpcId: 'vpc-11b1d67b',
      privateSubnetIds: ['subnet-66024c0c', 'subnet-51eb6e2d', 'subnet-6b971f27'],
      privateSubnetRouteTableIds: ['rtb-6c574f06', 'rtb-6c574f06', 'rtb-6c574f06'],
      availabilityZones: ['eu-central-1a', 'eu-central-1b', 'eu-central-1c'],
    })
    const dbCredentials = {
      username: 'test',
      password: 'test1234',
      name: 'SqlDatabase'
    }
    const database = new rds.DatabaseInstance(this, 'SqlDatabase', {
      databaseName: dbCredentials.name,
      engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0_23 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      publiclyAccessible: true,
      allocatedStorage: 5,
      backupRetention: cdk.Duration.days(0),
      credentials: {
        username: dbCredentials.username,
        password: cdk.SecretValue.plainText(dbCredentials.password)
      },
      vpc,
      securityGroups: [sg]
    })

    const env = {
      'DB_USERNAME': dbCredentials.username,
      'DB_PASSWORD': dbCredentials.password,
      'DB_NAME': dbCredentials.name,
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

    //************************ DB ************************
    const dbRes = restApi.root.addResource('db')
    dbRes.addMethod('post', this.createLambdaInt('MigrateDb', 'db/migrate.ts', env, vpc, sg))
    dbRes.addMethod('put', this.createLambdaInt('PopulateDb', 'db/populate.ts', env, vpc, sg))

    //************************ BASKET ************************
    const basketsRes = restApi.root.addResource('baskets')
    const basketRes = basketsRes.addResource('{userId}')
    basketRes.addMethod('get', this.createLambdaInt('GetBasket', 'basket/getBasket.ts', env, vpc, sg))
    //basketRes.addResource('update').addMethod('put', this.createLambdaInt('UpdateBasket', 'basket/updateBasket.ts', env))
    basketRes.addResource('add').addMethod('put', this.createLambdaInt('AddToBasket', 'basket/addToBasket.ts', env, vpc, sg))

    //************************ ORDERS ************************
    const ordersRes = restApi.root.addResource('orders')
    const orderRes = ordersRes.addResource('{userId}')
    orderRes.addMethod('get', this.createLambdaInt('GetAllOrders', 'orders/getAllOrders.ts', env, vpc, sg))
    orderRes.addMethod('post', this.createLambdaInt('CreateOrderRequest', 'orders/createOrderRequest.ts', env, vpc, sg))
    const orderNoRes = orderRes.addResource('{orderNo}')
    // orderNoRes.addMethod('get', this.createLambdaInt('GetOrder', 'orders/getOrder.ts', env, vpc, sg))
    orderNoRes.addMethod('delete', this.createLambdaInt('CancelOrder', 'orders/cancelOrder.ts', env, vpc, sg))
    // SNS Topic Message
    const createOrder = this.createLambda('CreateOrder', 'orders/createOrder.ts', env, vpc, sg)
    createOrder.addEventSource(new lambdaes.SnsEventSource(orderTopic))

    //************************ PRODUCTS **********************
    const productsRes = restApi.root.addResource('products')
    productsRes.addMethod('get', this.createLambdaInt('GetAllProducts', 'products/getAll.ts', env, vpc, sg))
    //productsRes.addMethod('post', this.createLambdaInt('CreateProduct', 'products/create.ts', env))
    const prodCatRes = productsRes.addResource('{category}')
    prodCatRes.addMethod('get', this.createLambdaInt('GetCategroy', 'products/getCategory.ts', env, vpc, sg))
    const prodCatIdRes = prodCatRes.addResource('{id}')
    prodCatIdRes.addMethod('get', this.createLambdaInt('GetProduct', '/products/get.ts', env, vpc, sg))
    prodCatIdRes.addMethod('delete', this.createLambdaInt('DeleteProduct', '/products/delete.ts', env, vpc, sg))
    prodCatIdRes.addMethod('put', this.createLambdaInt('UpdateProductStock', '/products/updateStock.ts', env, vpc, sg))
    //prodCatIdRes.addMethod('put', this.createLambdaInt('UpdateProduct', '/products/update.ts', env))
  }
  // Integration for APIGATEWAY
  createLambdaInt(
    name: string,
    entry: string,
    environment: { [key: string]: string },
    vpc: ec2.IVpc,
    sg: ec2.ISecurityGroup
  ): api.LambdaIntegration {
    return new api.LambdaIntegration(this.createLambda(name, entry, environment, vpc, sg))
  }

  createLambda(
    name: string,
    entry: string,
    environment: { [key: string]: string },
    vpc: ec2.IVpc,
    sg: ec2.ISecurityGroup
  ): lambda.NodejsFunction {
    const func = new lambda.NodejsFunction(this, name, {
      entry: path.join(__dirname, `/../../sql_ts/src/${entry}`),
      timeout: cdk.Duration.seconds(30),
      environment,
      vpc,
      securityGroups: [sg]
    })
    func.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sns:*', 'rds:*'],
      resources: ['*']
    }))
    return func
  }
}
