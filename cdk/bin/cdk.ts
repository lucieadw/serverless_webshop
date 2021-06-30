#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BaseStack } from '../lib/base-stack';
import { DynamoTsStack } from '../lib/dynamo-ts-stack';

const env = { account: '243037674803', region: 'eu-central-1' }

const app = new cdk.App();
// new BaseStack(app, 'Base', { env });
new DynamoTsStack(app, 'DynamoTs', { env });