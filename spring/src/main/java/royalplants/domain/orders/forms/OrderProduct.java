package royalplants.domain.orders.forms;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Map;

@Data
@AllArgsConstructor
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
                "picture", picture != null ? picture : "",
                "amount", amount
        );
    }
}