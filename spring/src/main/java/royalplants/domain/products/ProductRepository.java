package royalplants.domain.products;

import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.KeyAttribute;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.document.spec.UpdateItemSpec;
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap;
import com.amazonaws.services.dynamodbv2.model.ReturnValue;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;
import royalplants.domain.products.forms.Product;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Repository
public class ProductRepository {

    private final Table table;

    public ProductRepository(@Qualifier("productTable") Table table) {
        this.table = table;
    }

    public List<Product> findAll() {
        var out = table.scan();
        return StreamSupport.stream(out.spliterator(), false)
                .map(this::mapToProduct)
                .collect(Collectors.toList());
    }

    public List<Product> findByCategory(String category) {
        var out = table.query(new KeyAttribute("category", category));
        return StreamSupport.stream(out.spliterator(), false)
                .map(this::mapToProduct)
                .collect(Collectors.toList());
    }

    public Optional<Product> findByCategoryAndProductId(String category, String productId) {
        return Optional.ofNullable(table.getItem("category", category, "productId", productId))
                .map(this::mapToProduct);
    }

    public void reduceStock(String category, String productId, int reducedAmount) {
        var updateItemSpec = new UpdateItemSpec()
                .withPrimaryKey("category", category, "productId", productId)
                .withReturnValues(ReturnValue.UPDATED_NEW)
                .withUpdateExpression("set stock=stock-:a")
                .withValueMap(new ValueMap().withInt(":a", reducedAmount));
        table.updateItem(updateItemSpec);
    }

    private Product mapToProduct(Item item) {
        return new Product(
                item.getString("productId"),
                item.getString("category"),
                item.getString("name"),
                item.getString("description"),
                item.getString("picture"),
                item.getFloat("price"),
                item.getInt("stock")
        );
    }
}
