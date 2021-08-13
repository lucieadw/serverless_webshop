#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BaseStack } from '../lib/base-stack';
import { DynamoTsStack } from '../lib/dynamo-ts-stack';
import { DynamoJavaStack } from '../lib/dynamo-java-stack';
import { SqlTsStack } from '../lib/sql-ts-stack';
import {DynamoGoStack} from "../lib/dynamo-go-stack";
import { MonolithTsStack } from '../lib/monolith-ts-stack';
import { MonolithJavaStack } from '../lib/monolith-java-stack';
import { SpringStack } from '../lib/spring';

const env = { account: '243037674803', region: 'eu-central-1' }

const app = new cdk.App();
new BaseStack(app, 'Base', { env });
new DynamoTsStack(app, 'DynamoTs', { env });
new MonolithTsStack(app, 'MonolithTs', { env });
new MonolithJavaStack(app, 'MonolithJava', { env });
new DynamoJavaStack(app, 'DynamoJava', { env });
new DynamoGoStack(app, 'DynamoGo', { env });
new SqlTsStack(app, 'SqlTs', { env });
new SpringStack(app, 'Spring', { env });
