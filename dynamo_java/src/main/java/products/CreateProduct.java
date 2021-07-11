package products;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.PutItemOutcome;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import products.forms.CreateProductForm;

public class CreateProduct implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard().build();
    DynamoDB dynamoDB = new DynamoDB(client);

    Table table = dynamoDB.getTable(System.getenv("PRODUCTS_TABLE"));

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        CreateProductForm form = new Gson().fromJson(input.getBody(), CreateProductForm.class);
        var validationErr = form.validateCreateProduct();

        if (!validationErr.isEmpty()) {
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(400)
                    .withBody(validationErr);
        }

        var item = new Item()
                .withKeyComponent("category", form.getCategory())
                .withKeyComponent("productId", form.getProductId());

        //put product in database
        try {
            PutItemOutcome outcome = table.putItem(item);
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(201)
                    .withBody(new Gson().toJson(outcome.getItem().asMap()));
        } catch (Exception ex) {
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withBody(ex.toString());
        }

    }
}
