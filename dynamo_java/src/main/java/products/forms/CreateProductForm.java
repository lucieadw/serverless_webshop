package products.forms;

public class CreateProductForm {
    private final String category;
    private final String productId;
    private final String name;
    private final String description;
    private final float price;
    private final int stock;
    private final String picture;


    public CreateProductForm(String name, String category, String productId, String description, float price, int stock, String picture) {
        this.category = category;
        this.productId = productId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.picture = picture;
    }

    public String validateCreateProduct() {
        if (productId==null || productId.isEmpty()) {
            return "ProductID must be type string and cannot be null";
        }
        if (name==null || name.isEmpty()) {
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
        if (category == null || category.isEmpty()){
            return "Category must be type string and cannot be null";
        }
        if(picture == null) {
            return "Picture must be type string";
        }
        return "";
    }

    public String getCategory() {
        return category;
    }

    public String getProductId() {
        return productId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Number getPrice() {
        return price;
    }

    public Number getStock() {
        return stock;
    }

    public String getPicture() {
        return picture;
    }
}
