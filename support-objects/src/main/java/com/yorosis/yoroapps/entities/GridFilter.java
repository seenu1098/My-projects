package com.yorosis.yoroapps.entities;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode.Exclude;
import lombok.NoArgsConstructor;

@Table(name = "grid_filter")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GridFilter implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "filter_id", unique = true, nullable = false, precision = 19)
	private UUID filterId;

	@Column(name = "filter_name", nullable = false, length = 100)
	private String filterName;

	@Column(name = "operator", nullable = false, length = 50)
	private String operator;

	@Column(name = "filter_type", nullable = false, length = 100)
	private String filterType;

	@Column(name = "filter_value", nullable = false, length = 100)
	private String filterValue;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Exclude
	@ManyToOne
	@JoinColumn(name = "grid_id", nullable = false)
	private Grids grids;
}
