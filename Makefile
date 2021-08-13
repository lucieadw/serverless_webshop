clear:
	rm -rf cdk/cdk.out

build-dynamo-java:
	rm -rf dynamo_java/build
	cd dynamo_java && ./gradlew packageFat

build-monolith-java:
	rm -rf monolith_java/build
	cd monolith_java && ./gradlew packageFat

build-spring:
	rm -rf spring/build
	cd spring && ./gradlew bootJar
	cd spring && docker build -t webshop-app .
	docker tag webshop-app 243037674803.dkr.ecr.eu-central-1.amazonaws.com/spring-webshopimagesfe98a8bf-f2da8o5qdtan
	docker push 243037674803.dkr.ecr.eu-central-1.amazonaws.com/spring-webshopimagesfe98a8bf-f2da8o5qdtan
  # spring-webshopimagesfe98a8bf-f2da8o5qdtan
	# 243037674803

build-dynamo-go:
	cd dynamo_go && GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/products/get lambda/products/get/getProduct.go
	cd dynamo_go && GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/products/getAll lambda/products/getAll/getAllProducts.go
	cd dynamo_go && GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/products/create lambda/products/create/createProduct.go
	cd dynamo_go && GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/products/getCategory lambda/products/getCategory/getCategory.go
	cd dynamo_go && GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/orders/cancel lambda/orders/cancel/cancelOrder.go
	cd dynamo_go && GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/orders/get lambda/orders/get/getOrder.go
	cd dynamo_go && GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/orders/getAll lambda/orders/getAll/getAllOrders.go
	cd dynamo_go && GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/orders/createOrder lambda/orders/createOrder/createOrder.go
	cd dynamo_go && GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/orders/createOrderRequest lambda/orders/createOrderRequest/createOrderRequest.go
	cd dynamo_go && GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/basket/getBasket lambda/basket/getBasket/getBasket.go
	cd dynamo_go && GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/basket/addToBasket lambda/basket/addToBasket/addToBasket.go

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

deploy-dynamo-go: clear build-dynamo-go
	cd cdk && cdk deploy DynamoGo

deploy-monolith-ts: clear
	cd cdk && cdk deploy MonolithTs

deploy-monolith-java: clear build-monolith-java
	cd cdk && cdk deploy MonolithJava

# aws ecr get-login-password --region eu-central-1
# docker login -u AWS -p <token> 243037674803.dkr.ecr.eu-central-1.amazonaws.com
deploy-spring: clear build-spring
	cd cdk && cdk deploy Spring
