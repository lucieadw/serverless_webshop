import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecr from '@aws-cdk/aws-ecr';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';

export class SpringStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repository = new ecr.Repository(this, 'WebshopImages')

    const cluster = new ecs.Cluster(this, 'WebshopCluster')
    cluster.addCapacity('WebshopASG', {
      instanceType: new ec2.InstanceType('t2.micro'),
      desiredCapacity: 4
    })

    const ecsRole = new iam.Role(this, 'WebshopALBRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
    })
    ecsRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:*'],
      resources: ['*']
    }))

    new ecsPatterns.ApplicationLoadBalancedEc2Service(this, 'WebshopALB', {
      cluster,
      memoryLimitMiB: 512,
      cpu: 5,
      desiredCount: 4,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repository),
        containerPort: 8080,
        taskRole: ecsRole
      },
      publicLoadBalancer: true
    })
  }
}
