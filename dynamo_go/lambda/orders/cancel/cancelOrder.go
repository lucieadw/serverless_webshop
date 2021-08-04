package main

import (
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"os"
	"webshop/internal/apigw"
)

func Handler(event events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	ddb := dynamodb.New(session.New())

	_, err := ddb.UpdateItem(&dynamodb.UpdateItemInput{
		TableName: aws.String(os.Getenv("ORDERS_TABLE")), //aws.String macht wert zu einem  pointer
		Key: map[string]*dynamodb.AttributeValue{
			"orderNo": {S: aws.String(event.PathParameters["orderNo"])},
			"userId":  {S: aws.String(event.PathParameters["userId"])},
		},
		UpdateExpression: aws.String("set orderStatus=:s"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":s": {S: aws.String("Canceled")},
		},
		ReturnValues: aws.String("ALL_NEW"),
	})

	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	return apigw.CreateResponse(200, "Order Canceled"), err
}

func main() {
	lambda.Start(Handler)
}
