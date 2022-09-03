package com.yorosis.yoroflow.entities;

import java.util.UUID;

import javax.persistence.CascadeType;
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
@Table(name = "process_instance_task_file")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessInstanceTaskFile extends BaseEntity {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "task_file_att_id")
	private UUID taskFileAttId;

	@ManyToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "process_instance_task_id")
	private ProcessInstanceTask processInstanceTask;

	@Column(name = "file_name")
	private String fileName;

	@Column(name = "files")
	private byte[] files;

	@Column(name = "added_by")
	private UUID addedBy;

	@Column(name = "tenant_id", length = 60)
	private String tenantId;

}
