package com.yorosis.livetester.entities;

import java.sql.Timestamp;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString.Exclude;

@Entity
@Table(name = "testcases")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Testcases {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true, nullable = false)
	private Long id;

	@Column(name = "testcase_name", unique = true)
	private String testcaseName;

	@Column(name = "json_data", nullable = false, length = 30000)
	private String jsonData;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_date")
	private Timestamp createdDate;

	@Column(name = "updated_by")
	private String updatedBy;
	@Column(name = "updated_date")
	private Timestamp updatedDate;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "template_id", nullable = false)
	private Template template;

	@OneToMany(mappedBy = "testcase", cascade = CascadeType.ALL)
	private Set<TestcaseCategories> claimsTestcaseGroups;

	@Exclude
	@ManyToOne
	@JoinColumn(name = "form_type", nullable = false)
	private LookupData formType;

}
