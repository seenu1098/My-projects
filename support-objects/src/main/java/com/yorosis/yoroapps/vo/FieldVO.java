package com.yorosis.yoroapps.vo;

import java.util.List;

import com.yorosis.yoroapps.entities.DateValidationVO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldVO {
	private String name;
	private String fieldId;
	private String fieldName;
	private String defaultValue;
	private String defaultCode;
	private Object control;
	private LabelTypeVO label;
	private String dataType;

	private int fieldWidth;
	private boolean unique;
	private boolean editable;
	private boolean sensitive;
	private boolean enableHyperlink;

	private String dateFormat;

	private int rows;
	private int cols;
	private int chipSize;
	private DateValidationVO dateValidation;
	private NumberFieldValidtionVO numberFieldValidation;
	private boolean allowFutureDate;
	private boolean allowPastDate;

	private OnSelectionVO onSelection;
	private List<ValidationVO> validations;
	private ConditionalChecksVO conditionalChecks;
	private String style;
	private String rowBackground;
}
