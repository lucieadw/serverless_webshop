package orders.forms;

import lombok.Data;

import java.util.Map;

@Data
public class OrderProduct {
    String category;
    String productId;
    String name;
    String description;
    float price;
    String picture;
    int amount;

    public Map<String, Object> asMap() {
        return Map.of(
                "category", category,
                "productId", productId,
                "name", name,
                "description", description,
                "price", price,
                "picture", picture,
                "amount", amount
        );
    }
}
