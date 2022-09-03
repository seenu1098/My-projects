package com.yorosis.yoroapps.entities;

import java.sql.Timestamp;
import java.util.Set;
import java.util.UUID;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode.Exclude;
import lombok.NoArgsConstructor;

@Table(name = "menu")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Menu {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "menu_id", unique = true, nullable = false, precision = 19)
	private UUID menuId;

	@Column(name = "menu_name", nullable = false, length = 100)
	private String menuName;

	@Column(name = "menu_orientation", nullable = false, length = 50)
	private String menuOrientation;

	@Column(name = "collapsible", nullable = false, length = 5)
	private String collapsible;

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

	@Column(name = "managed_flag")
	private String managedFlag;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "application_id", nullable = false)
	private Application application;

	@OneToMany(mappedBy = "menu", cascade = CascadeType.ALL)
	private Set<MenuDetails> menuDetails;
}
