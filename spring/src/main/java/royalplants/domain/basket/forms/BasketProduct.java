package royalplants.domain.basket.forms;

import lombok.Data;
import lombok.NonNull;

import java.util.Map;

@Data
public class BasketProduct {
    @NonNull
    private String category;
    @NonNull
    private String productId;
    @NonNull
    private int amount;

    public Map<String, Object> asMap() {
        return Map.of(
                "category", category,
                "productId", productId,
                "amount", amount
        );
    }
}