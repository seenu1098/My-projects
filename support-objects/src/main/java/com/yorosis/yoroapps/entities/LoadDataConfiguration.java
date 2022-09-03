package com.yorosis.yoroapps.entities;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString.Exclude;

@Table(name = "load_data_configuration")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoadDataConfiguration {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "data_id", unique = true, nullable = false, precision = 19)
	private UUID dataId;

	@Column(name = "datasource", nullable = false, length = 100)
	private String datasource;

	@Column(name = "tables", nullable = true, length = 200)
	private String tables;

	@Column(name = "pre_job_query", length = 3000)
	private String preJobQuery;

	@Column(name = "post_job_query", length = 3000)
	private String postJobQuery;

	@Column(name = "file_replacement", nullable = false, length = 2)
	private String fileReplacement;

	@Column(name = "file_format", nullable = false, length = 50)
	private String fileFormat;

	@Column(name = "skip_empty", nullable = false, length = 5)
	private String skipEmpty;

	@Column(name = "end_previous_record_columns", length = 100)
	private String endPreviousRecordColumns;

	@Column(name = "end_previous_record_query", length = 3000)
	private String endPreviousRecordQuery;

	@Column(name = "record_start_date")
	private String recordStartDate;

	@Column(name = "headers_line_count", precision = 19)
	private Integer headersLineCount;

	@Column(name = "pk_identifier_query", length = 3000)
	private String pkIdentifierQuery;

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

	@Column(name = "delta_data_query", length = 3000)
	private String deltaDataQuery;

	@Column(name = "headers_present", nullable = false, length = 1)
	private String headersPresent;

	@Column(name = "pk_identifier_columns", length = 3000)
	private String pkIdentifierColumns;

	@Transient
	private boolean isUpdateRequiresReview;

	@Transient
	private boolean isInsertRequiresReview;

	@Transient
	private String statusColumnName;

	@Transient
	private int insertUpdateStatusValue;

	@Transient
	private boolean isAuditEnabled;

	@Exclude
	@OneToMany(mappedBy = "loadDataConfiguration", cascade = CascadeType.ALL)
	private List<LoadColumnMapping> columnMapping;

	@Exclude
	@OneToMany(mappedBy = "loadDataConfiguration", cascade = CascadeType.ALL)
	private List<LoadRecordMapping> recordMapping;

}
