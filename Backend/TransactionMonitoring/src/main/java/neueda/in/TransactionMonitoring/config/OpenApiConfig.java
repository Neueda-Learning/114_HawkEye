package neueda.in.TransactionMonitoring.config;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI transactionMonitoringOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Transaction Monitoring & Alerts API")
                .description("REST API for HawkEye Transaction Monitoring - Alerts, Rules & Transactions")
                .version("1.0.0")
                .contact(new Contact().name("Neueda Training").email("training@neueda.com"))
                .license(new License().name("Internal Use Only")));
    }
}
