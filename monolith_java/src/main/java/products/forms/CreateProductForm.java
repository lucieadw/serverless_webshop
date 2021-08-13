package products.forms;

import lombok.Data;

@Data
public class CreateProductForm {
    String category;
    String productId;
    String name;
    String description;
    float price;
    int stock;
    String picture;

    public String validateCreateProduct() {
        if (productId == null || productId.isEmpty()) {
            return "ProductID must be type string and cannot be null";
        }
        if (name == null || name.isEmpty()) {
            return "Name must be type string and cannot be null";
        }
        if (price <= 0) {
            return "Price must be type number and greater than 0";
        }
        if (description == null) {
            return "Description must be type string";
        }
        if (stock < 0) {
            return "Stock must be zero or more";
        }
        if (category == null || category.isEmpty()) {
            return "Category must be type string and cannot be null";
        }
        if (picture == null) {
            return "Picture must be type string";
        }
        return "";
    }
}
