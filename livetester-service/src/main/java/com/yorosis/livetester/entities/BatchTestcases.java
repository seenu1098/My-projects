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
import javax.persistence.Transient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "batch_testcases")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "batchTestcasesResult", "batch", "claims" })
@ToString(exclude = { "batchTestcasesResult", "batch", "claims" })
public class BatchTestcases {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true, nullable = false)
	private long id;

	@Column(name = "generated_edi" , length = 30000)
	private String generatedEdi;

	@Column(length = 100)
	private String status;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_date")
	private Timestamp createdDate;

	@Column(name = "updated_by")
	private String updatedBy;

	@Column(name = "updated_date")
	private Timestamp updatedDate;

	@ManyToOne(optional = false)
	@JoinColumn(name = "batch_id", nullable = false)
	private Batch batch;

	@OneToMany(mappedBy = "batchTestcases", cascade = CascadeType.ALL)
	private Set<BatchTestcasesResult> batchTestcasesResult;

	@ManyToOne(optional = false)
	@JoinColumn(name = "test_id", nullable = false)
	private Testcases claims;

	@Column(name = "pcn")
	private String pcn;

	@Column(name = "tcn")
	private String tcn;

	@Column(name = "generated_json" , length = 30000 )
	private String generatedJson;

	@Transient
	private long claimID;
	
	@Column(name="original_json_data" , length = 30000)
    private String jsonData;

}
