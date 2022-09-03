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

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString.Exclude;

@Entity
@Table(name = "batch_testcases_result")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchTestcasesResult {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true, nullable = false, precision = 19)
	private long id;

	@Column(name = "expected_value", nullable = false)
	private String expectedValue;

	@Column(name = "actual_value", nullable = true)
	private String actualValue;

	@Column
	private String status;

	@Column(name = "seq_no")
	private int seqNo;
	
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
	@JoinColumn(name = "batch_testcases_id", nullable = false)
	private BatchTestcases batchTestcases;
    
	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "elements_configuration_id", nullable = false)
	private ElementsConfiguration elementsConfiguration;

}
