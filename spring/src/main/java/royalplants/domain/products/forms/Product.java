package royalplants.domain.products.forms;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAttribute;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBHashKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBRangeKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTable;
import lombok.AllArgsConstructor;
import lombok.Setter;

@DynamoDBTable(tableName = "Products")
@Setter
@AllArgsConstructor
public class Product {

    private String productId;
    private String category;
    private String name;
    private String description;
    private String picture;
    private float price;
    private int stock;

    @DynamoDBRangeKey(attributeName = "productId")
    public String getProductId() {
        return productId;
    }

    @DynamoDBHashKey(attributeName = "category")
    public String getCategory() {
        return category;
    }

    @DynamoDBAttribute(attributeName = "name")
    public String getName() {
        return name;
    }

    @DynamoDBAttribute(attributeName = "description")
    public String getDescription() {
        return description;
    }

    @DynamoDBAttribute(attributeName = "picture")
    public String getPicture() {
        return picture;
    }

    @DynamoDBAttribute(attributeName = "stock")
    public int getStock() {
        return stock;
    }

    @DynamoDBAttribute(attributeName = "price")
    public float getPrice() {
        return price;
    }
}
