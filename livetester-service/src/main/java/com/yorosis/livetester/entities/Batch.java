// Generated with g9.

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
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "batch")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "batchTestcases")
@ToString(exclude = { "batchTestcases" })
public class Batch {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true, nullable = false, precision = 19)
	private long id;

	@Column(name = "batch_name", unique = true)
	private String batchName;

	@Column(name = "start_time")
	private Timestamp startTime;

	@Column(name = "end_time")
	private Timestamp endTime;

	@Column(length = 100)
	private String status;

	@Column(name = "total_testcases", nullable = false, precision = 19)
	private long totalTestcases;

	@Column(name = "pass_percentage", nullable = false)
	private long passPercentage;

	@Column(name = "fail_percentage", nullable = false)
	private long failPercentage;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_date")
	private Timestamp createdDate;

	@Column(name = "updated_by")
	private String updatedBy;

	@Column(name = "updated_date")
	private Timestamp updatedDate;

	@ManyToOne(optional = false)
	@JoinColumn(name = "environment_id", nullable = false)
	private Environment environment;

	@OneToMany(mappedBy = "batch", cascade = CascadeType.ALL)
	private Set<BatchTestcases> batchTestcases;

	@Column(name = "void_first_before")
	private String voidFirstBefore;

	@Column(name = "increase_by_days")
	private int increaseByDays;

	@Column(name = "error_desc", nullable = true, length = 500)
	private String errorDesc;

}
