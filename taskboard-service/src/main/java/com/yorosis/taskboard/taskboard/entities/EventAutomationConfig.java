package com.yorosis.taskboard.taskboard.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "event_automation_config")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventAutomationConfig {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id")
	private UUID id;

	@Column(name = "automation")
	private String automation;

	@Column(name = "automation_type")
	private String automationType;

	@Column(name = "parent_automation_id")
	private UUID parentAutomationId;

	@Column(name = "tenant_id", nullable = false)
	private String tenantId;

	@Column(name = "created_by", nullable = false)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private LocalDateTime createdOn;

	@Column(name = "modified_by")
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private LocalDateTime modifiedOn;

	@Column(name = "active_flag", nullable = false)
	private String activeFlag;

	@Column(name = "category")
	private String category;

	@Column(name = "automation_subtype")
	private String automationSubtype;
	
	@Column(name="app_name")
	private String appName;
}
