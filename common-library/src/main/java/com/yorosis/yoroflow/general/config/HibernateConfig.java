package com.yorosis.yoroflow.general.config;

import static org.hibernate.cfg.AvailableSettings.DIALECT;
import static org.hibernate.cfg.AvailableSettings.FORMAT_SQL;
import static org.hibernate.cfg.AvailableSettings.HBM2DDL_AUTO;
import static org.hibernate.cfg.AvailableSettings.MULTI_TENANT;
import static org.hibernate.cfg.AvailableSettings.MULTI_TENANT_CONNECTION_PROVIDER;
import static org.hibernate.cfg.AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER;
import static org.hibernate.cfg.AvailableSettings.SHOW_SQL;

import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.hibernate.MultiTenancyStrategy;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.JpaVendorAdapter;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;

@Configuration
public class HibernateConfig {
	@Value("${spring.jpa.show-sql:false}")
	private boolean showSql;

	@Value("${spring.jpa.format-sql:false}")
	private boolean formatSql;

	@Value("${spring.jpa.database-platform}")
	private String dialect;

	@Value("${spring.jpa.ddl-auto:validate}")
	private String ddlAuto;
	
	@Value("${hibernate.scan.packages:com.yorosis.yoroapps.entities}")
	private String scanPackages;

	@Bean
	public JpaVendorAdapter jpaVendorAdapter() {
		return new HibernateJpaVendorAdapter();
	}

	@Bean
	public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource, MultiTenantConnectionProvider multiTenantConnectionProvider,
			CurrentTenantIdentifierResolver tenantIdentifierResolver) {
		LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
		em.setDataSource(dataSource);
		
		String[] listOfPackages = scanPackages.split(",");
		em.setPackagesToScan(listOfPackages);

		em.setJpaVendorAdapter(this.jpaVendorAdapter());

		Map<String, Object> jpaProperties = new HashMap<>();
		jpaProperties.put(MULTI_TENANT, MultiTenancyStrategy.SCHEMA);
		jpaProperties.put(MULTI_TENANT_CONNECTION_PROVIDER, multiTenantConnectionProvider);
		jpaProperties.put(MULTI_TENANT_IDENTIFIER_RESOLVER, tenantIdentifierResolver);
		jpaProperties.put("hibernate.temp.use_jdbc_metadata_defaults", false);
		jpaProperties.put(DIALECT, dialect);
		jpaProperties.put(SHOW_SQL, showSql);
		jpaProperties.put(FORMAT_SQL, formatSql);
		jpaProperties.put(HBM2DDL_AUTO, ddlAuto);

		em.setJpaPropertyMap(jpaProperties);
		return em;
	}
}
