clear:
	rm -rf cdk/cdk.out

build-dynamo-java:
	cd dynamo_java && ./gradlew packageFat

deploy-base: clear
	cd cdk && cdk deploy Base

deploy-dynamo-ts: clear
	cd cdk && cdk deploy DynamoTs

destroy-dynamo-ts: clear
	cd cdk && cdk destroy DynamoTs

deploy-sql-ts: clear
	cd cdk && cdk deploy SqlTs

deploy-dynamo-java: clear build-dynamo-java
	cd cdk && cdk deploy DynamoJava
