// Generated with g9.

package com.yorosis.yoroflow.entities;

import java.sql.Timestamp;
import java.time.LocalDateTime;
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
@Table(name = "process_instance_task_notes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessInstanceTaskNotes {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "task_notes_att_id", unique = true, nullable = false)
	private UUID taskNotesAttId;

	@ManyToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "process_instance_task_id")
	private ProcessInstanceTask processInstanceTask;

	@Column(name = "notes", length = 20)
	private String notes;

	@Column(name = "created_date")
	private Timestamp createdDate;

	@Column(name = "updated_date")
	private Timestamp updatedDate;

	@Column(name = "added_by", nullable = false)
	private UUID addedBy;

	@Column(name = "updated_by", nullable = false)
	private String updatedBy;

	@Column(name = "tenant_id", length = 60)
	private String tenantId;

	@Column(name="parent_notes_id")
	private UUID parentNotesId;
}
