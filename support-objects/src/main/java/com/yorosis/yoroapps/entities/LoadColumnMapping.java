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

@Table(name = "load_column_mapping")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoadColumnMapping {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "column_name", nullable = false, length = 100)
	private String columnName;

	@Column(name = "table_name", nullable = false, length = 100)
	private String tableName;

	@Column(name = "target_column", nullable = false, length = 100)
	private String targetColumn;

	@Column(name = "file_column_index", length = 100)
	private Long fileColumnIndex;

	@Column(name = "flat_start_position", length = 10)
	private Integer flatStartPosition;

	@Column(name = "flat_end_position", length = 10)
	private Integer flatEndPosition;

	@Column(name = "data_type", nullable = false, length = 100)
	private String dataType;

	@Column(name = "sanitize", nullable = false, length = 200)
	private String sanitize;

	@Column(name = "default_value", length = 100)
	private String defaultValue;

	@Column(name = "min_length", precision = 19)
	private Long minLength;

	@Column(name = "max_length", precision = 19)
	private Long maxLength;

	@Column(name = "valid_query", length = 3000)
	private String validQuery;

	@Column(name = "decode_json", length = 3000)
	private String decodeJson;

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

	@Column(name = "date_format", length = 50)
	private String dateFormat;

	@Exclude
	@ManyToOne
	@JoinColumn(name = "data_id", nullable = false)
	private LoadDataConfiguration loadDataConfiguration;

}
