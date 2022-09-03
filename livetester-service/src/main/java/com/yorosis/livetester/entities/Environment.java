package com.yorosis.livetester.entities;

import java.sql.Timestamp;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "environment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "batch")
@ToString(exclude = { "batch" })
public class Environment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true, nullable = false)
	private long id;

	@Column(name = "environment_name", unique = true)
	private String environmentName;

	@Column(name = "target_folder")
	private String targetFolder;

	@Column
	private String protocol;

	@Column
	private String host;

	@Column
	private String port;

	@Column
	private String username;

	@Column(length = 200)
	private String password;

	@Column(name = "pem_text", length = 4000)
	private String pemText;

	@Column(name = "completion_query", length = 3000)
	private String completionQuery;

	@Column(name = "tcn_query", length = 3000)
	private String tcnQuery;

	@Column(name = "db_type")
	private String dbType;

	@Column(name = "db_host")
	private String dbHost;

	@Column(name = "db_port")
	private String dbPort; 

	@Column(name = "db_name")
	private String dbName;

	@Column(name = "db_username")
	private String dbUsername;

	@Column(name = "db_password")
	private String dbPassword;

	@Column(name = "scheme_name")
	private String schemeName;

	@Column(name = "logon_type")
	private String logonType;

	@OneToMany(mappedBy = "environment")
	private Set<Batch> batch;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_date")
	private Timestamp createdDate;

	@Column(name = "updated_by")
	private String updatedBy;

	@Column(name = "updated_date")
	private Timestamp updatedDate;
}
