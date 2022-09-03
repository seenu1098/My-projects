package com.yorosis.livetester.entities;

import java.sql.Timestamp;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString.Exclude;

@Entity
@Table(name = "elements_configuration", indexes = { @Index(name = "elements_configuration_element_label_IX", columnList = "element_label", unique = true) })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ElementsConfiguration {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true, nullable = false, precision = 19)
	private long id;

	@Column(name = "element_label", unique = true, length = 100)
	private String elementLabel;

	@Column(name = "field_name")
	private String fieldName;

	@Column(name = "field_type", length = 100)
	private String fieldType;

	@Column(name = "is_mandatory", length = 10)
	private String isMandatory;

	@Column(name = "applicable_at", length = 10)
	private String applicableAt;

	@Column(name = "created_by", length = 100)
	private String createdBy;
	@Column(name = "created_date")
	private Timestamp createdDate;

	@Column(name = "updated_by", length = 100)
	private String updatedBy;
	@Column(name = "updated_date")
	private Timestamp updatedDate;

	@Column(name = "match_query", length = 3000)
	private String matchQuery;
	
	@Column(name = "control_type", length = 3000)
	private String controlType;
	
	@Column(name = "json", length = 3000)
	private String json;

	@Column(name = "fallback_query_1", length = 3000)
	private String fallbackQuery1;

	@Column(name = "fallback_query_2", length = 3000)
	private String fallbackQuery2;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "elementsConfiguration")
	private Set<BatchTestcasesResult> batchTestcasesResult;

}