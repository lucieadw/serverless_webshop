package orders.forms;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAttribute;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBHashKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBRangeKey;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;

import java.util.List;

@Data
@AllArgsConstructor
@NonNull
public class Order {
    String userId;
    String orderNo;
    String name;
    String email;
    String street;
    String housenr;
    String postcode;
    String city;
    List<OrderProduct> products;

    @DynamoDBRangeKey(attributeName = "orderNo")
    public String getOrderNo() {
        return orderNo;
    }

    @DynamoDBHashKey(attributeName = "userId")
    public String getUserId() {
        return userId;
    }

    @DynamoDBAttribute(attributeName = "name")
    public String getName() {
        return name;
    }

    @DynamoDBAttribute(attributeName = "email")
    public String getEmail() {
        return email;
    }

    @DynamoDBAttribute(attributeName = "street")
    public String getStreet() {
        return street;
    }

    @DynamoDBAttribute(attributeName = "housenr")
    public String getHousenr() {
        return housenr;
    }

    @DynamoDBAttribute(attributeName = "postcode")
    public String getPostcode() {
        return postcode;
    }

    @DynamoDBAttribute(attributeName = "city")
    public String getCity() {
        return city;
    }

    @DynamoDBAttribute(attributeName = "products")
    public List<OrderProduct> getProducts() {
        return products;
    }
}
