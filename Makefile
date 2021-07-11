clear:
	rm -rf cdk/cdk.out

build-dynamo-java:
	cd dynamo_java && ./gradlew packageFat

deploy-base: clear
	cd cdk && cdk deploy Base

deploy-dynamo-ts: clear
	cd cdk && cdk deploy DynamoTs

deploy-dynamo-java: clear build-dynamo-java
	cd cdk && cdk deploy DynamoJava
