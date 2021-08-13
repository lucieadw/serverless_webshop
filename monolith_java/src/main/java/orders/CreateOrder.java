package orders;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.document.spec.UpdateItemSpec;
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap;
import com.amazonaws.services.dynamodbv2.model.ReturnValue;
import com.amazonaws.services.lambda.runtime.Context;
import com.google.gson.Gson;
import orders.forms.Order;
import orders.forms.OrderProduct;
import orders.forms.OrderStatus;

import java.util.List;
import java.util.stream.Collectors;

public class CreateOrder {
    private final AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard().build();
    private final DynamoDB dynamoDB = new DynamoDB(client);
    private final Table table = dynamoDB.getTable(System.getenv("ORDERS_TABLE"));

    public void handleMessage(String message) {
        var order = new Gson().fromJson(message, Order.class);
        var sum = order.getProducts().stream().map(this::calcSum).reduce(0f, Float::sum);

        var item = new Item()
                .withKeyComponent("orderNo", order.getOrderNo())
                .withKeyComponent("userId", order.getUserId())
                .withString("name", order.getName())
                .withString("email", order.getEmail())
                .withString("street", order.getStreet())
                .withString("housenr", order.getHousenr())
                .withString("postcode", order.getPostcode())
                .withString("city", order.getCity())
                .withList("products", order.getProducts().stream().map(OrderProduct::asMap).collect(Collectors.toList()))
                .withNumber("sum", sum)
                .withString("orderStatus", OrderStatus.Confirmed.toString());

        // Validate order (check stock etc.)
        var allAvailable = order.getProducts().stream().allMatch(this::checkStock);
        //put product in database
        if (allAvailable) {
            try {
                table.putItem(item);
                order.getProducts().forEach(this::updateStock);
                emptyBasket(order.getUserId());

            } catch (Exception ex) {
                ex.printStackTrace();
                throw new RuntimeException(ex);
            }
        } else { //out of Stock
            item.withString("orderStatus", OrderStatus.OutOfStock.toString());
            table.putItem(item);
        }
    }

    private void emptyBasket(String userId) {
        AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard().build();
        DynamoDB dynamoDB = new DynamoDB(client);
        Table table = dynamoDB.getTable(System.getenv("BASKET_TABLE"));

        UpdateItemSpec updateItemSpec = new UpdateItemSpec()
                .withPrimaryKey("userId", userId)
                .withReturnValues(ReturnValue.ALL_NEW)
                .withUpdateExpression("set products=:newVal")
                .withValueMap(new ValueMap().withList(":newVal", List.of()));

        table.updateItem(updateItemSpec);
    }

    private void updateStock(OrderProduct p) {
        AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard().build();
        DynamoDB dynamoDB = new DynamoDB(client);
        Table table = dynamoDB.getTable(System.getenv("PRODUCTS_TABLE"));

        UpdateItemSpec updateItemSpec = new UpdateItemSpec()
                .withPrimaryKey("category", p.getCategory(), "productId", p.getProductId())
                .withReturnValues(ReturnValue.UPDATED_NEW)
                .withUpdateExpression("set stock=stock-:a")
                .withValueMap(new ValueMap().withInt(":a", p.getAmount()));

        table.updateItem(updateItemSpec);
    }

    private boolean checkStock(OrderProduct p) {
        AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard().build();
        DynamoDB dynamoDB = new DynamoDB(client);
        Table table = dynamoDB.getTable(System.getenv("PRODUCTS_TABLE"));

        var item = table.getItem("category", p.getCategory(), "productId", p.getProductId());

        return item.getInt("stock") >= p.getAmount();
    }


    private float calcSum(OrderProduct p) {
        AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard().build();
        DynamoDB dynamoDB = new DynamoDB(client);
        Table table = dynamoDB.getTable(System.getenv("PRODUCTS_TABLE"));

        var item = table.getItem("category", p.getCategory(), "productId", p.getProductId());

        return item.getFloat("price") * p.getAmount();
    }
}
