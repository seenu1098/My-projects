package com.yorosis.yoroapps.entities;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Set;
import java.util.UUID;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "grids")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Grids implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "grid_id", unique = true, nullable = false, precision = 19)
	private UUID gridId;

	@Column(name = "grid_name", length = 200)
	private String gridName;

	@Column(name = "module_name", length = 200)
	private String moduleName;

	@Column(name = "width_percentage", precision = 10)
	private int widthPercentage;

	@Column(name = "filterable", nullable = false, length = 5)
	private String filterable;

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

	@Column(name = "grid_url")
	private String gridUrl;

	@Column(name = "default_sortable_column")
	private String defaultSortableColumn;

	@Column(name = "show_check_box")
	private String showCheckBox;

	@Column(name = "pass_params", length = 200)
	private String passParams;

	@Column(name = "default_no_of_rows", nullable = false)
	private int defaultNoOfRows;

	@Column(name = "exportable", nullable = false, length = 5)
	private String exportable;

	@Column(name = "sort_direction")
	private String sortDirection;

	@Column(name = "managed_flag")
	private String managedFlag;

	@Column(name = "where_clause", nullable = true, length = 500)
	private String whereClause;

	@Column(name = "user_specific_grid_data", nullable = true, length = 1)
	private String userSpecificGridData;

	@Column(name = "field_values", nullable = true, length = 500)
	private String fieldValues;

	@Column(name = "grid_column_names", nullable = true, length = 500)
	private String gridColumnNames;

	@OneToMany(mappedBy = "grids", cascade = CascadeType.ALL)
	private Set<GridColumns> gridColumns;

	@OneToMany(mappedBy = "grids", cascade = CascadeType.ALL)
	private Set<GridFilter> gridFilter;
}
