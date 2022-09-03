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

@Table(name = "custom_menu_mobile")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomMenuMobile {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "custom_menu_name")
	private String customMenuName;

	@Column(name = "default_menu_name")
	private String defaultMenuName;

	@Column(name = "custom_page_name")
	private String customPageName;

	@Column(name = "tenant_id")
	private String tenantId;

	@Column(name = "active_flag")
	private String activeFlag;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

}
