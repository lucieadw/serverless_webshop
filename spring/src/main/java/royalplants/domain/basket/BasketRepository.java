package royalplants.domain.basket;

import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.document.spec.UpdateItemSpec;
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap;
import com.amazonaws.services.dynamodbv2.model.ReturnValue;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;
import royalplants.domain.basket.forms.Basket;
import royalplants.domain.basket.forms.BasketProduct;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class BasketRepository {

    private final Table table;

    public BasketRepository(@Qualifier("basketTable") Table table) {
        this.table = table;
    }

    public Optional<Basket> findById(String userId) {
        return Optional.ofNullable(table.getItem("userId", userId))
                .map(this::mapToBasket);
    }

    public void putItem(Item basket) {
        table.putItem(basket);
    }

    public void clearBasket(String userId) {
        UpdateItemSpec updateItemSpec = new UpdateItemSpec()
                .withPrimaryKey("userId", userId)
                .withReturnValues(ReturnValue.ALL_NEW)
                .withUpdateExpression("set products=:newVal")
                .withValueMap(new ValueMap().withList(":newVal", List.of()));
        table.updateItem(updateItemSpec);
    }

    private Basket mapToBasket(Item item) {
        return new Basket(
                item.getString("userId"),
                item.<Map<String, Object>>getList("products").stream().map(this::mapToProduct).collect(Collectors.toList())
        );
    }

    private BasketProduct mapToProduct(Map<String, ?> map) {
        return new BasketProduct(
                (String) map.get("category"),
                (String) map.get("productId"),
                ((BigDecimal) map.get("amount")).intValue()
        );
    }
}
