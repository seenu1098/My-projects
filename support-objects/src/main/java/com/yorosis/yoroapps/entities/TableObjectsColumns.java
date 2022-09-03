package com.yorosis.yoroapps.entities;

import java.sql.Timestamp;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode.Exclude;
import lombok.NoArgsConstructor;

@Table(name = "table_objects_columns")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TableObjectsColumns {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "column_name", nullable = false, length = 60)
	private String columnName;

	@Column(name = "column_identifier", nullable = false, length = 60)
	private String columnIdentifier;

	@Column(name = "data_type", nullable = false, length = 60)
	private String dataType;

	@Column(name = "field_size")
	private Long fieldSize;

	@Column(name = "is_unique", nullable = false, length = 60)
	private String isUnique;

	@Column(name = "is_required", nullable = false, length = 60)
	private String isRequired;

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

	@Exclude
	@ManyToOne
	@JoinColumn(name = "table_objects_id", nullable = false)
	private TableObjects tableObjects;
}
