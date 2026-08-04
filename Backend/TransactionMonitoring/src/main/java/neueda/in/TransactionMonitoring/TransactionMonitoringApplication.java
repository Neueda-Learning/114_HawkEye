package neueda.in.TransactionMonitoring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class TransactionMonitoringApplication {

	public static void main(String[] args) {
		SpringApplication.run(TransactionMonitoringApplication.class, args);
	}

}
