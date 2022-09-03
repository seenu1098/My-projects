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
public class SelectOptionVO {
	private String optionType;
	List<OptionsVO> optionsValues;
	private DBDataVO filter;
	private List<FilterVO> filters;
}
