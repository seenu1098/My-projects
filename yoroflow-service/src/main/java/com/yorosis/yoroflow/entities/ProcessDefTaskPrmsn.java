// Generated with g9.

package com.yorosis.yoroflow.entities;

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

@Entity
@Table(name = "process_def_task_permission")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessDefTaskPrmsn extends BaseEntity {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "process_def_task_prms_id", unique = true, nullable = false)
	private UUID processDefTaskPrmsId;

	@Column(name = "user_id", nullable = true, length = 100)
	private UUID userId;

	@Column(name = "group_id", nullable = true, length = 100)
	private UUID groupId;

	@Column(name = "created_by", length = 100)
	private String createdBy;

	@Column(name = "updated_by", length = 100)
	private String updatedBy;

	@Column(name = "tenant_id", length = 60)
	private String tenantId;

	@Column(name = "read_allowed", length = 1)
	private String readAllowed;

	@Column(name = "update_allowed", length = 1)
	private String updateAllowed;

	@Column(name = "execute_allowed", length = 1)
	private String executeAllowed;

	@ManyToOne
	@JoinColumn(name = "task_id")
	private ProcessDefinitionTask processDefinitionTask;
}
