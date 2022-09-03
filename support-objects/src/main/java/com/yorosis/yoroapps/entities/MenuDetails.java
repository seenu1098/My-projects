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

@Table(name = "menu_details")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MenuDetails {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "menu_name", nullable = false, length = 100)
	private String menuName;

	@Column(name = "menu_path", length = 100)
	private String menuPath;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "display_order")
	private Long displayOrder;

	@Column(name = "icon")
	private String icon;

	@Column(name = "report_id")
	private UUID reportId;

	@Exclude
	@ManyToOne(optional = true)
	@JoinColumn(name = "page_id")
	private Page page;

	@Column(name = "parent_menu_id", precision = 19)
	private UUID parentMenuId;

	@OneToMany(mappedBy = "menuDetails", cascade = CascadeType.ALL)
	private Set<MenuAssociateRoles> menuAssociateRoles;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "menu_id", nullable = false)
	private Menu menu;

	@Exclude
	@ManyToOne(optional = true)
	@JoinColumn(name = "custom_page_id")
	private CustomPage customPage;

}
