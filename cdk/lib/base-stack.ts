import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as sqs from '@aws-cdk/aws-sqs';

export class BaseStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'WebshopUserPool',
      signInCaseSensitive: false,
      signInAliases: { email: true }
    })
    new cdk.CfnOutput(this, 'UserPoolArn', {
      exportName: 'UserPoolArn',
      value: userPool.userPoolArn
    })

    new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      userPoolClientName: 'FrontendClient',
      generateSecret: false,
      authFlows: { userSrp: true },
      supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO],
      preventUserExistenceErrors: true,
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.COGNITO_ADMIN, cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL]
      }
    })

    const orderReqQueue = new sqs.Queue(this, 'OrderRequestQueue')
    new cdk.CfnOutput(this, 'OrderRequestQueueUrl', {
      exportName: 'OrderRequestQueueUrl',
      value: orderReqQueue.queueUrl
    })
    new cdk.CfnOutput(this, 'OrderRequestQueueArn', {
      exportName: 'OrderRequestQueueArn',
      value: orderReqQueue.queueArn
    })
  }
}
