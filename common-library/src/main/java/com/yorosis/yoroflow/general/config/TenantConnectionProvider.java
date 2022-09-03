package com.yorosis.yoroflow.general.config;

import java.sql.Connection;
import java.sql.SQLException;

import javax.sql.DataSource;

import org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.yorosis.yoroflow.general.constants.YorosisConstants;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class TenantConnectionProvider implements MultiTenantConnectionProvider {
	private static final long serialVersionUID = 1L;

	private transient DataSource datasource;

	@Autowired
	public TenantConnectionProvider(DataSource ds) {
		this.datasource = ds;
	}

	@Override
	public boolean isUnwrappableAs(@SuppressWarnings("rawtypes") Class unwrapType) {
		return false;
	}

	@Override
	public <T> T unwrap(Class<T> unwrapType) {
		return null;
	}

	@Override
	public Connection getAnyConnection() throws SQLException {
		return this.datasource.getConnection();
	}

	@Override
	public void releaseAnyConnection(Connection connection) throws SQLException {
		connection.close();
	}

	@Override
	public Connection getConnection(String tenantIdentifier) throws SQLException {
		log.trace("getConnection - tenantIdentifier: {}", tenantIdentifier);

		final Connection connection = this.datasource.getConnection();
		connection.setSchema(tenantIdentifier);
		return connection;
	}

	@Override
	public void releaseConnection(String tenantIdentifier, Connection connection) throws SQLException {
		log.trace("releaseConnection - tenantIdentifier: {}", tenantIdentifier);

		connection.setSchema(YorosisConstants.DEFAULT_SCHEMA);
		releaseAnyConnection(connection);
	}

	@Override
	public boolean supportsAggressiveRelease() {
		return false;
	}

}
