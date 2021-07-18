package basket;

import basket.forms.BasketProduct;
import basket.forms.SimpleProduct;
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

import java.util.List;
import java.util.Map;

public class AddToBasket implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard().build();
    DynamoDB dynamoDB = new DynamoDB(client);
    Table table = dynamoDB.getTable(System.getenv("BASKET_TABLE"));
    SimpleProduct form;

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            form = new Gson().fromJson(input.getBody(), SimpleProduct.class);
        } catch (Exception ex) {
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(400)
                    .withBody(ex.toString());
        }

        var newBasket = addToBasket(input.getPathParameters().get("userId"), form, table);

        PutItemOutcome newItem;

        try {
            newItem = table.putItem(newBasket);
        } catch (Exception ex) {
            ex.printStackTrace();
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withBody(ex.getMessage());
        }
        return new APIGatewayProxyResponseEvent()
                .withStatusCode(200)
                .withBody(new Gson().toJson("Produkt hinzugefügt"));
    }

    private Item addToBasket(String userId, SimpleProduct form, Table table) {
        var basketItem = table.getItem("userId", userId);

        //basket not yet present
        if (basketItem == null) {
            return new Item().withString("userId", userId)
                    .withList("products", List.of(new BasketProduct(form.getCategory(), form.getProductId(), 1).asMap()));
        } else {
            List<Map<String, Object>> products = basketItem.getList("products");
            var prod = products.stream()
                    .filter(p -> p.get("category").equals(form.getCategory()) && p.get("productId").equals(form.getProductId()))
                    .findAny();
            if (prod.isPresent()) {
                //increase amount of existing product
                prod.get().put("amount", ((Number) prod.get().get("amount")).intValue() + 1);
            } else {
                //add new product with amount 1
                products.add(new BasketProduct(form.getCategory(), form.getProductId(), 1).asMap());
            }

            return Item.fromMap(Map.of(
                    "userId", userId,
                    "products", products
            ));
        }
    }
}



