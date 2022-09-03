package com.yorosis.yoroflow.entities;

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
import lombok.NoArgsConstructor;
import lombok.ToString.Exclude;

@Table(name = "dashboard_widget")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardWidgets {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 10)
	private UUID id;

	@Column(name = "widget_name", nullable = false, length = 50)
	private String widgetName;

	@Column(name = "widget_type")
	private String widgetType;

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

	@Column(name = "row_num")
	private Long rowNum;

	@Column(name = "column_num")
	private Long columnNum;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "dashboard_id", nullable = false)
	private Dashboard dashboard;
}
