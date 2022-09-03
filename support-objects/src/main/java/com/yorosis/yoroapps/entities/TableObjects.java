package com.yorosis.yoroapps.entities;

import java.sql.Timestamp;
import java.util.Set;
import java.util.UUID;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "table_objects")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TableObjects {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "table_objects_id", unique = true, nullable = false, precision = 19)
	private UUID tableObjectsId;

	@Column(name = "table_name", nullable = false)
	private String tableName;

	@Column(name = "table_identifier", nullable = false, length = 60)
	private String tableIdentifier;
	
	@Column(name = "table_description")
	private String tableDescription;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "managed_flag")
	private String managedFlag;

	@Column(name = "public_table")
	private String publicTable;

	@OneToMany(mappedBy = "tableObjects", cascade = CascadeType.ALL)
	private Set<TableObjectsColumns> tableObjectsColumns;
}
