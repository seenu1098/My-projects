package com.yorosis.yoroflow.entities;

import java.sql.Timestamp;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "metrics_data")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MetricsData {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id")
	private UUID id;

	@Column(name = "task_id", nullable = false)
	private UUID taskId;

	@Column(name = "metric_type", nullable = false, length = 10)
	private String metricType;

	@Column(name = "recipient_id", nullable = false, length = 50)
	private String recipientId;

	@CreationTimestamp
	@Column(name = "sent_timestamp", nullable = false)
	private Timestamp sentTime;

	@Column(name = "tenant_id", nullable = false, length = 50)
	private String tenantId;

	@Column(name = "created_by", nullable = false, length = 50)
	private String createdBy;

	@CreationTimestamp
	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;
}
