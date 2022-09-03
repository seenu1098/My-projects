package com.yorosis.yoroflow;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashSet;
import java.util.Set;

import javax.sql.DataSource;

public abstract class AbstractBaseTest {
	protected abstract DataSource getDatasource();

	protected void clearSequences() throws SQLException {
		try (Connection c = getDatasource().getConnection(); Statement s = c.createStatement()) {
			Set<String> sequences = new HashSet<String>();
			try (ResultSet rs = s.executeQuery("SELECT SEQUENCE_NAME FROM INFORMATION_SCHEMA.SEQUENCES WHERE SEQUENCE_SCHEMA='PUBLIC'");) {
				while (rs.next()) {
					sequences.add(rs.getString(1));
				}
			}
			for (String seq : sequences) {
				s.executeUpdate("ALTER SEQUENCE " + seq + " RESTART WITH 1");
			}
		}
	}
}
