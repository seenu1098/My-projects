package com.yorosis.yoroflow.entities;

import java.util.Set;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "custom_pages")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@TypeDef(name = "json", typeClass = JsonNodeBinaryType.class)
public class CustomPage {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "page_id")
	private String pageId;

	@Column(name = "page_name")
	private String pageName;

	@Column(name = "menu_path")
	private String menuPath;

	@Type(type = "json")
	@Column(name = "json", columnDefinition = "json")
	private JsonNode jsonPayload;

	@Column(name = "application_id")
	private UUID applicationId;

	@Column(name = "tenant_id")
	private String tenantId;

	@Column(name = "active_flag")
	private String activeFlag;

	@Column(name = "page_version")
	private Long version;

	@OneToMany(mappedBy = "customPage")
	private Set<CustomPagePermissions> customPagePermissions;

}
