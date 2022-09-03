package com.yorosis.yoroapps.entities;

import java.sql.Timestamp;
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
@Table(name = "yoro_time_zone")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YoroflowTimeZone {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id")
	private UUID id;
	
	@Column(name = "time_zone_code")
	private String timeZoneCode;

	@Column(name = "time_zone_label")
	private String timeZoneLabel;
	
	@Column(name = "default_time_zone")
	private String defaultTimeZone;
	
	@Column(name = "tenant_id")
	private String tenantId;
	
	@Column(name = "active_flag")
	private String activeFlag;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_date")
	private Timestamp createdDate;

	@Column(name = "updated_by", length = 100)
	private String modifiedBy;

	@Column(name = "updated_date")
	private Timestamp modifiedOn;
}
