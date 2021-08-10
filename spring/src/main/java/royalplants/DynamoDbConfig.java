package royalplants;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Table;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:application.yml")
public class DynamoDbConfig {

    @Bean
    public DynamoDB dynamoDB() {
        return new DynamoDB(AmazonDynamoDBClientBuilder.standard().withRegion(Regions.EU_CENTRAL_1).build());
    }

    @Bean
    public Table productTable(DynamoDB dynamoDB, @Value("${productTable}") String tableName) {
        return dynamoDB.getTable(tableName);
    }

    @Bean
    public Table orderTable(DynamoDB dynamoDB, @Value("${orderTable}") String tableName) {
        return dynamoDB.getTable(tableName);
    }

    @Bean
    public Table basketTable(DynamoDB dynamoDB, @Value("${basketTable}") String tableName) {
        return dynamoDB.getTable(tableName);
    }

}
