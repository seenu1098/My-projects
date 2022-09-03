package com.yorosis.yoroapps.entities;

import java.io.Serializable;
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

@Table(name = "grid_columns")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GridColumns implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "column_name", nullable = false, length = 50)
	private String columnName;

	@Column(name = "field_type", nullable = false, length = 25)
	private String fieldType;
	
	@Column(name = "date_time_format", length = 50)
	private String dateTimeFormat;

	@Column(name = "object_field_name", length = 25)
	private String objectFieldName;

	@Column(name = "display_name", nullable = false, length = 100)
	private String displayName;

	@Column(name = "sortable", nullable = false, length = 5)
	private String sortable;

	@Column(name = "filterable", nullable = false, length = 5)
	private String filterable;

	@Column(name = "width_percentage", precision = 10)
	private Integer widthPercentage;

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

	@Column(name = "column_sequence_no", nullable = false)
	private Integer columnSequenceNo;

	@Column(name = "hidden_value", nullable = false, length = 5)
	private String hiddenValue;

	@Exclude
	@ManyToOne
	@JoinColumn(name = "grid_id", nullable = false)
	private Grids grids;

}
