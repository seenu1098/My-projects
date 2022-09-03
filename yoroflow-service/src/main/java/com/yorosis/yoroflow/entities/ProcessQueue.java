package com.yorosis.yoroflow.entities;

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

/**
 * The persistent class for the process_queue database table.
 * 
 */
@Entity
@Table(name = "process_queue")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessQueue {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "process_queue_id")
	private UUID processQueueId;

	@Column(name = "created_timestamp")
	private LocalDateTime createdTimestamp;

	@Column(name = "picked_up_by")
	private String pickedUpBy;

	@Column(name = "picked_up_timestamp")
	private LocalDateTime pickedUpTimestamp;

	@Column(name = "process_definition_task_id")
	private UUID processDefinitionTaskId;

	@Column(name = "process_instance_id")
	private UUID processInstanceId;

	private String status;

	@Column(name = "error_description")
	private String errorDescription;
}