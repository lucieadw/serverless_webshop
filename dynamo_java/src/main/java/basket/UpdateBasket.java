package basket;

import basket.forms.BasketProduct;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UpdateBasket implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard().build();
    DynamoDB dynamoDB = new DynamoDB(client);
    Table table = dynamoDB.getTable(System.getenv("BASKET_TABLE"));

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {

        var basketProd = new Gson().fromJson(input.getBody(), BasketProduct.class);
        var userId = input.getPathParameters().get("userId");
        var basketItem = table.getItem("userId", userId);
        Item newBasket;

        if (basketItem != null) {
            newBasket = updateBasket(userId, basketItem, basketProd);
        } else {
            newBasket = new Item().withString("userId", userId)
                    .withList("products", List.of(
                            new BasketProduct(basketProd.getCategory(), basketProd.getProductId(), basketProd.getAmount())
                                    .asMap()));
        }

        try {
            table.putItem(newBasket);
        } catch (Exception ex) {
            ex.printStackTrace();
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withBody(ex.getMessage());
        }

        var enrichedBasket = enrichProducts(newBasket);

        return new APIGatewayProxyResponseEvent()
                .withStatusCode(200)
                .withBody(new Gson().toJson(enrichedBasket));
    }

    private Item enrichProducts(Item basketItem) {
        AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard().build();
        DynamoDB dynamoDB = new DynamoDB(client);
        Table table = dynamoDB.getTable(System.getenv("PRODUCTS_TABLE"));

        List<Map<String, Object>> products = basketItem.getList("products");
        List<Map<String, Object>> newProducts = new ArrayList<>();

        for (Map<String, Object> product : products) {
            var prodItem = table.getItem("category", product.get("category"),
                    "productId", product.get("productId"));

            var productMap = new HashMap<String, Object>();
            productMap.put("category", prodItem.get("category"));
            productMap.put("productId", prodItem.get("productId"));
            productMap.put("name", prodItem.get("name"));
            productMap.put("description", prodItem.get("description"));
            productMap.put("picture", prodItem.get("picture"));
            productMap.put("price", prodItem.get("price"));
            productMap.put("amount", product.get("amount"));
            newProducts.add(productMap);
        }

        return Item.fromMap(Map.of(
                "userId", basketItem.get("userId"),
                "products", newProducts
        ));
    }


    private Item updateBasket(String userId, Item basket, BasketProduct basketProd) {
        List<Map<String, Object>> products = basket.getList("products");
        var prod = products.stream()
                .filter(p -> p.get("category").equals(basketProd.getCategory())
                        && p.get("productId").equals(basketProd.getProductId()))
                .findAny();
        if (prod.isPresent()) {
            //update amount of existing product
            if (basketProd.getAmount() == 0) {
                products.remove(prod.get());
            } else {
                prod.get().put("amount", basketProd.getAmount());
            }
        } else {
            //add new product with given amount
            products.add(new BasketProduct(basketProd.getCategory(), basketProd.getProductId(), basketProd.getAmount())
                    .asMap());
        }
        return Item.fromMap(Map.of(
                "userId", userId,
                "products", products
        ));
    }
}
