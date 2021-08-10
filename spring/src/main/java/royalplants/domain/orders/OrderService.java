package royalplants.domain.orders;

import com.amazonaws.services.dynamodbv2.document.Item;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import royalplants.domain.basket.BasketService;
import royalplants.domain.orders.forms.Order;
import royalplants.domain.orders.forms.OrderProduct;
import royalplants.domain.orders.forms.OrderRequest;
import royalplants.domain.orders.forms.OrderStatus;
import royalplants.domain.products.ProductService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final BasketService basketService;

    public String createOrderRequest(String userId, final OrderRequest form) {
        var orderRequest = new OrderRequest(form.getName(), form.getEmail(),
                form.getStreet(), form.getHousenr(), form.getPostcode(), form.getCity(), form.getProducts());

        createOrder(orderRequest, userId);
        return "Order abgelegt";
    }

    public boolean cancelOrder(String orderNo, String userId) {
        return orderRepository.updateItem(orderNo, userId);
    }

    public List<Order> getAllOrders(final String userId) {
        return orderRepository.findByUserId(userId);
    }

    public Optional<Order> getOrder(final String orderNo, String userId) {
        return orderRepository.findByUserIdAndOrderNo(orderNo, userId);
    }

    private void createOrder(OrderRequest orderReq, String userId) {
        var sum = orderReq.getProducts().stream().map(this::calcSum).reduce(0f, Float::sum);
        var item = new Item()
                .withKeyComponent("orderNo", UUID.randomUUID().toString())
                .withKeyComponent("userId", userId)
                .withString("name", orderReq.getName())
                .withString("email", orderReq.getEmail())
                .withString("street", orderReq.getStreet())
                .withString("housenr", orderReq.getHousenr())
                .withString("postcode", orderReq.getPostcode())
                .withString("city", orderReq.getCity())
                .withList("products", orderReq.getProducts().stream().map(OrderProduct::asMap).collect(Collectors.toList()))
                .withNumber("sum", sum)
                .withString("orderStatus", OrderStatus.Confirmed.toString());
        var allAvailable = orderReq.getProducts().stream().allMatch(this::checkStock);
        if (allAvailable) {
            orderReq.getProducts().forEach(productService::reduceStock);
            basketService.clearBasket(userId);
        } else {
            item.withString("orderStatus", OrderStatus.OutOfStock.toString());
        }

        orderRepository.save(item);
    }

    private float calcSum(OrderProduct p) {
        var product = productService.getProduct(p.getCategory(), p.getProductId());
        return product.map(value -> value.getPrice() * p.getAmount()).orElse(0f);
    }

    private boolean checkStock(OrderProduct p) {
        var product = productService.getProduct(p.getCategory(), p.getProductId());
        return product.map(value -> value.getStock() >= p.getAmount()).orElse(false);
    }


}
