package royalplants.api.orders;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import royalplants.api.BadRequestException;
import royalplants.domain.orders.OrderService;
import royalplants.domain.orders.forms.Order;
import royalplants.domain.orders.forms.OrderRequest;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrdersRestController {
    private final OrderService orderService;

    @GetMapping("/{userId}")
    public List<Order> getAllOrders(@PathVariable("userId") String userId) {
        return orderService.getAllOrders(userId);
    }

    @GetMapping("/{userId}/{orderNo}")
    public Order getOrder(@PathVariable("userId") String userId, @PathVariable("orderNo") String orderNo) {
        return orderService.getOrder(userId, orderNo).orElseThrow(() -> new OrderNotFoundException("Order Not Found"));
    }

    @PostMapping("/{userId}")
    public String createOrder(@PathVariable("userId") String userId, @RequestBody OrderRequest body) {
        return orderService.createOrderRequest(userId, body);
    }

    @DeleteMapping("/{userId}/{orderNo}")
    public String cancelOrder(@PathVariable("userId") String userId, @PathVariable("orderNo") String orderNo) {
        if (orderService.cancelOrder(orderNo, userId)) {
            return "Order canceled";
        }
        throw new BadRequestException("Invalid cancel order request");
    }
}
