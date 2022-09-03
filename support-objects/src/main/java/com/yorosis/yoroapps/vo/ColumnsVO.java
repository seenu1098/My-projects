package com.yorosis.yoroapps.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ColumnsVO {
	private String fieldName;
	private String label;
	private String labelOption;
	private String name;
	private String inputType;
	private String optionType;
	private List<OptionsVO> options;
	private List<ValidationVO> validations;
	private String type;
	private int fieldWidth;
	private Boolean sensitive;
	private Boolean validation;
	private int rows;
	private int cols;
	private String buttonType;
	private String paragraph;
	private String buttonAction;
	private String passParams;
	private String pageName;
	private Boolean conditionallyEnable;
	private Boolean conditionallyApplicable;
	private String condtionalFieldName;
	private String condtionalValue;
	private String dataType;
	private String dateFormat;
	private int minLength;
	private int maxLength;

}
