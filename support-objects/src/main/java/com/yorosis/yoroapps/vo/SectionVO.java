package com.yorosis.yoroapps.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionVO {
	private String name;
	private Boolean childSection;
	private Integer width;
	private Boolean collapsible;
	private Boolean repeatable;
	private String repeatableName;
	private Boolean border;
	private String tableName;
	private String primaryKey;
	private String parentTable;
	private String description;
	private List<SectionVO> sections;
	private List<RowsVO> rows;
	private Boolean conditionallyApplicable;
	private String fieldName;
	private String value;
	private String logicalSectionName;
	private List<String> foreignKey;
	private GroupValidationVO groupValidation;
	private SecurityVO security;
	private ResolvedSecurityForPageVO sectionSecurity;
	private String style;
	private String addRepeatableSectionButtonName;
	private String removeRepeatableSectionButtonName;
}
