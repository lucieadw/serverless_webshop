package royalplants.domain.orders;

import com.amazonaws.services.dynamodbv2.document.*;
import com.amazonaws.services.dynamodbv2.document.spec.UpdateItemSpec;
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap;
import com.amazonaws.services.dynamodbv2.model.ReturnValue;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;
import royalplants.domain.orders.forms.Order;
import royalplants.domain.orders.forms.OrderStatus;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Repository
public class OrderRepository {

    private final Table table;

    public OrderRepository(@Qualifier("orderTable") Table table) {
        this.table = table;
    }

    public void save(Item orderItem) {
        table.putItem(orderItem);
    }

    public boolean updateItem(String orderNo, String userId) {
        var updateSpec = new UpdateItemSpec()
                .withPrimaryKey("userId", userId,
                        "orderNo", orderNo)
                .withReturnValues(ReturnValue.ALL_NEW)
                .withUpdateExpression("set orderStatus=:s")
                .withValueMap(new ValueMap().withString(":s", OrderStatus.Canceled.toString()));
        var out = table.updateItem(updateSpec);
        return out.getItem().numberOfAttributes() != 0;
    }

    public List<Order> findByUserId(String userId) {
        ItemCollection<QueryOutcome> out = table.query(new KeyAttribute("userId", userId));
        return StreamSupport.stream(out.spliterator(), false)
                .map(this::mapToOrder)
                .collect(Collectors.toList());
    }

    public Optional<Order> findByUserIdAndOrderNo(String userId, String orderNo) {
        return Optional.ofNullable(table.getItem("userId", userId, "orderNo", orderNo))
                .map(this::mapToOrder);
    }

    private Order mapToOrder(Item item) {
        return new Order(
                item.getString("userId"),
                item.getString("orderNo"),
                item.getString("name"),
                item.getString("email"),
                item.getString("street"),
                item.getString("housenr"),
                item.getString("postcode"),
                item.getString("city"),
                item.getFloat("sum"),
                item.getString("orderStatus"),
                item.getList("products")
        );
    }
}
