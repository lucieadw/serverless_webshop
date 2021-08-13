import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaes from '@aws-cdk/aws-lambda-event-sources';
import * as api from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as sns from '@aws-cdk/aws-sns';
import * as path from 'path';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';


export class MonolithJavaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const orderTopic = new sns.Topic(this, 'OrderRequestTopic')
    const productsTable = dynamodb.Table.fromTableArn(this, 'ProductTable', cdk.Fn.importValue('ProductTableArn'))
    const basketTable = dynamodb.Table.fromTableArn(this, 'BasketTable', cdk.Fn.importValue('BasketTableArn'))
    const ordersTable = dynamodb.Table.fromTableArn(this, 'OrderTable', cdk.Fn.importValue('OrderTableArn'))

    const environment = {
      'PRODUCTS_TABLE': productsTable.tableName,
      'BASKET_TABLE': basketTable.tableName,
      'ORDERS_TABLE': ordersTable.tableName,
      'ORDER_TOPIC': orderTopic.topicArn
    }

    const func = new lambda.Function(this, "MonolithJava", {
      runtime: lambda.Runtime.JAVA_11,
      code: lambda.Code.fromAsset(path.join(__dirname, `/../../monolith_java/build/distributions/monolith_java.zip`)),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      handler: 'lambda.Handler',
      environment
    })
    func.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:*', 'sns:*'],
      resources: ['*']
    }))
    const lambdaInt = new api.LambdaIntegration(func)

    const lambdaTarget = new targets.LambdaFunction(func, {
      event: events.RuleTargetInput.fromObject({
        resource: '/ping',
        httpMethod: 'GET'
      })
    });

    new events.Rule(this, 'WarmUpRule', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
      targets: [lambdaTarget],
    });

    /////////////////////////////////////////// REST API ///////////////////////////////////////////
    const restApi = new api.RestApi(this, 'MonolithJavaApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: api.Cors.ALL_ORIGINS,
        allowMethods: api.Cors.ALL_METHODS
      }
    })

    //************************ BASKET ************************
    const basketsRes = restApi.root.addResource('baskets')
    const basketRes = basketsRes.addResource('{userId}')
    basketRes.addMethod('get', lambdaInt)
    basketRes.addResource('add').addMethod('put', lambdaInt)

    //************************ ORDERS ************************
    const ordersRes = restApi.root.addResource('orders')
    const orderRes = ordersRes.addResource('{userId}')
    orderRes.addMethod('get', lambdaInt)
    orderRes.addMethod('post', lambdaInt)
    const orderNoRes = orderRes.addResource('{orderNo}')
    orderNoRes.addMethod('get', lambdaInt)
    orderNoRes.addMethod('delete', lambdaInt)
    // SNS Topic Message
    func.addEventSource(new lambdaes.SnsEventSource(orderTopic))

    //************************ PRODUCTS **********************
    const productsRes = restApi.root.addResource('products')
    productsRes.addMethod('get', lambdaInt)
    const prodCatRes = productsRes.addResource('{category}')
    prodCatRes.addMethod('get', lambdaInt)
    const prodCatIdRes = prodCatRes.addResource('{id}')
    prodCatIdRes.addMethod('get', lambdaInt)

  }
}
