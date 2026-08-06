package neueda.in.TransactionMonitoring.seeder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import neueda.in.TransactionMonitoring.entity.Account;
import neueda.in.TransactionMonitoring.entity.Payee;
import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.enums.AccountStatus;
import neueda.in.TransactionMonitoring.enums.AccountType;
import neueda.in.TransactionMonitoring.enums.TransactionStatus;
import neueda.in.TransactionMonitoring.enums.TransactionType;
import neueda.in.TransactionMonitoring.repository.AccountRepository;
import neueda.in.TransactionMonitoring.repository.PayeeRepository;
import neueda.in.TransactionMonitoring.repository.TransactionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Seeds demo data on startup — runs only when the accounts table is empty.
 * Safe to restart: checks existence before inserting.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final AccountRepository     accountRepository;
    private final PayeeRepository       payeeRepository;
    private final TransactionRepository transactionRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (accountRepository.count() > 0) {
            log.info("DataSeeder — data already exists, skipping seed.");
            return;
        }
        log.info("DataSeeder — seeding demo data...");
        seedAccounts();
        seedPayees();
        seedTransactions();
        log.info("DataSeeder — done. Accounts: {}, Payees: {}, Transactions: {}",
                accountRepository.count(),
                payeeRepository.count(),
                transactionRepository.count());
    }

    // ── Accounts ─────────────────────────────────────────────────────────────

    private void seedAccounts() {
        accountRepository.save(Account.builder()
                .accountId("ACC-001")
                .accountName("fourgrads")
                .accountType(AccountType.PERSONAL)
                .dailyLimit(new BigDecimal("50000.00"))
                .status(AccountStatus.ACTIVE)
                .build());

        accountRepository.save(Account.builder()
                .accountId("ACC-002")
                .accountName("ABC Corporation")
                .accountType(AccountType.CORPORATE)
                .dailyLimit(new BigDecimal("100000.00"))
                .status(AccountStatus.ACTIVE)
                .build());

        accountRepository.save(Account.builder()
                .accountId("ACC-003")
                .accountName("Jane Smith")
                .accountType(AccountType.BUSINESS)
                .dailyLimit(new BigDecimal("75000.00"))
                .status(AccountStatus.ACTIVE)
                .build());

        log.info("DataSeeder — 3 accounts seeded.");
    }

    // ── Payees ───────────────────────────────────────────────────────────────

    private void seedPayees() {
        payeeRepository.save(Payee.builder()
                .payeeId("ACME-CORP")
                .payeeName("ACME Corporation")
                .payeeType("VENDOR")
                .build());

        payeeRepository.save(Payee.builder()
                .payeeId("TECH-LTD")
                .payeeName("Tech Ltd")
                .payeeType("VENDOR")
                .build());

        payeeRepository.save(Payee.builder()
                .payeeId("RETAIL-INC")
                .payeeName("Retail Inc")
                .payeeType("MERCHANT")
                .build());

        payeeRepository.save(Payee.builder()
                .payeeId("SERVICES-CO")
                .payeeName("Services Co")
                .payeeType("SERVICES")
                .build());

        log.info("DataSeeder — 4 payees seeded.");
    }

    // ── Transactions ─────────────────────────────────────────────────────────

    private void seedTransactions() {
        Account acc001 = accountRepository.findById("ACC-001").orElseThrow();
        Account acc002 = accountRepository.findById("ACC-002").orElseThrow();
        Account acc003 = accountRepository.findById("ACC-003").orElseThrow();

        Payee acme    = payeeRepository.findById("ACME-CORP").orElseThrow();
        Payee tech    = payeeRepository.findById("TECH-LTD").orElseThrow();
        Payee retail  = payeeRepository.findById("RETAIL-INC").orElseThrow();
        Payee service = payeeRepository.findById("SERVICES-CO").orElseThrow();

        LocalDateTime base = LocalDateTime.of(2026, 1, 22, 14, 0, 0);

        // ACC-001 transactions — includes one high-value (triggers amount rule)
        transactionRepository.save(txn(acc001, acme,    15000.00, TransactionType.DEBIT,  base.plusMinutes(28)));
        transactionRepository.save(txn(acc001, tech,     5000.00, TransactionType.DEBIT,  base.plusMinutes(15)));
        transactionRepository.save(txn(acc001, retail,   8000.00, TransactionType.DEBIT,  base.minusMinutes(15)));
        transactionRepository.save(txn(acc001, service,  2000.00, TransactionType.DEBIT,  base.minusMinutes(40)));
        transactionRepository.save(txn(acc001, acme,     1200.00, TransactionType.CREDIT, base.minusHours(2)));

        // ACC-002 transactions — rapid transactions (triggers velocity rule)
        transactionRepository.save(txn(acc002, retail,  25000.00, TransactionType.DEBIT,  base.plusMinutes(45)));
        transactionRepository.save(txn(acc002, tech,    12000.00, TransactionType.DEBIT,  base.plusMinutes(43)));
        transactionRepository.save(txn(acc002, service,  8000.00, TransactionType.DEBIT,  base.plusMinutes(40)));
        transactionRepository.save(txn(acc002, acme,     3000.00, TransactionType.DEBIT,  base.plusMinutes(38)));
        transactionRepository.save(txn(acc002, retail,   6000.00, TransactionType.CREDIT, base.plusMinutes(10)));

        // ACC-003 transactions
        transactionRepository.save(txn(acc003, service,  4500.00, TransactionType.DEBIT,  base.minusHours(1)));
        transactionRepository.save(txn(acc003, acme,     9000.00, TransactionType.DEBIT,  base.minusHours(3)));

        log.info("DataSeeder — 12 transactions seeded.");
    }

    private Transaction txn(Account account, Payee payee, double amount,
                             TransactionType type, LocalDateTime timestamp) {
        return Transaction.builder()
                .account(account)
                .payee(payee)
                .amount(new BigDecimal(String.valueOf(amount)))
                .currency("USD")
                .transactionType(type)
                .status(TransactionStatus.COMPLETED)
                .description("Seeded demo transaction")
                .timestamp(timestamp)
                .build();
    }
}

