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
@Table(name = "environment_preset")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentPreset {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true, nullable = false, precision = 19)
	private long id;

	@Column(nullable = false, length = 500)
	private String type;

	@Column(name = "key", length = 100)
	private String key;
	
	@Column(name = "description", length = 200)
	private String description;

	@Column(name = "json_data", nullable = false, length = 8000)
	private String jsonData;

	@Column(name = "created_by", length = 100)
	private String createdBy;

	@Column(name = "created_date")
	private Timestamp createdDate;

	@Column(name = "updated_by", length = 100)
	private String updatedBy;

	@Column(name = "updated_date")
	private Timestamp updatedDate;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "environment_id", nullable = false)
	private Environment environment;

	@Column(name = "active_flag")
	private String activeFlag;

}
