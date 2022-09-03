package com.yorosis.livetester.entities;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString.Exclude;

@Entity
@Table(name = "testcase_categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestcaseCategories {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true, nullable = false, precision = 19)
	private long id;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "testcase_id", nullable = false)
	private Testcases testcase;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@ManyToOne(optional = false )
	@JoinColumn(name = "testcase_groups_id", nullable = false)
	private Categories testcaseGroups;
	
	@Transient
	private long testCaseGrpID;

	@CreatedBy
	@Column(name = "created_by")
	private String createdBy;

	@CreatedDate
	@Column(name = "created_date")
	private Timestamp createdDate;

	@LastModifiedBy
	@Column(name = "updated_by")
	private String updatedBy;

	@LastModifiedDate
	@Column(name = "updated_date")
	private Timestamp updatedDate;

}
