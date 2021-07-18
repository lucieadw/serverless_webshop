package basket.forms;

import lombok.Data;
import lombok.NonNull;

import java.util.Map;

@Data
public class BasketProduct {
    @NonNull
    String category;
    @NonNull
    String productId;
    @NonNull
    int amount;

    public Map<String, Object> asMap() {
        return Map.of(
                "category", category,
                "productId", productId,
                "amount", amount
        );
    }
}
