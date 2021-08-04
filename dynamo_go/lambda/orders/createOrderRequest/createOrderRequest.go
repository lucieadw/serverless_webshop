package main

import (
	"encoding/json"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sns"
	uuid "github.com/nu7hatch/gouuid"
	"os"
	"webshop/internal/apigw"
	"webshop/internal/forms"
)

func Handler(event events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {

	var createForm forms.OrderRequest
	if err := json.Unmarshal([]byte(event.Body), &createForm); err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	newSns := sns.New(session.New())

	createForm.UserId = aws.String(event.PathParameters["userId"])

	id, err := uuid.NewV4()
	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}
	createForm.OrderNo = aws.String(id.String())

	jsonStr, err := json.Marshal(createForm)
	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	_, err = newSns.Publish(&sns.PublishInput{
		Message:  aws.String(string(jsonStr)),
		TopicArn: aws.String(os.Getenv("ORDER_TOPIC")),
	})
	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	return apigw.CreateResponse(200, "Order abgelegt, Status pending"), err
}

func main() {
	lambda.Start(Handler)
}
