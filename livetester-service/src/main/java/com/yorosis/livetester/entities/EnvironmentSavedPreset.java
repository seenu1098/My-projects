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
@Table(name = "environment_saved_preset")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentSavedPreset {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true, nullable = false, precision = 19)
	private long id;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "environment_id", nullable = false)
	private Environment environment;

	@Column(name = "type")
	private String type;

	@Column(name = "identifier")
	private String identifier;

	@Column(name = "created_by", length = 100)
	private String createdBy;

	@Column(name = "created_date")
	private Timestamp createdDate;

	@Column(name = "updated_by", length = 100)
	private String updatedBy;

	@Column(name = "updated_date")
	private Timestamp updatedDate;

	@Column(name = "replace_identifier")
	private String replaceIdentifier;
}
