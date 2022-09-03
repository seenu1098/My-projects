package com.yorosis.yoroflow.entities;

import java.time.LocalDate;
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

@Entity
@Table(name = "counter_values")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CounterValues {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "counter_id")
	private UUID counterId;

	@Column(name = "counter_type", nullable = false)
	private String counterType;

	@Column(name = "counter_name", nullable = false)
	private String counterName;

	@Column(name = "process_definition_key")
	private String key;

	@Column(name = "time_zone")
	private String timeZone;

	@Column(name = "reset_at")
	private Long resetAt;

	@Column(name = "counter_value")
	private Long counterValue;

	@Column(name = "count_increased_by")
	private Integer increaseCountBy;

	@Column(name = "counter_start_at")
	private Integer countStartAt;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_date")
	private LocalDateTime createdDate;

	@Column(name = "counter_date")
	private LocalDate counterDate;

	@Column(name = "updated_by")
	private String updatedBy;

	@Column(name = "updated_date")
	private LocalDateTime updatedDate;

	@Column(name = "tenant_id", length = 60)
	private String tenantId;

	@Column(name = "active_flag", length = 60)
	private String activeFlag;

	@Column(name = "process_definition_id")
	private UUID processDefinitionId;
}
