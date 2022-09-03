package com.yorosis.yoroapps.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomPagesJsonVO {
	private String pageName;
	private String tableName;
	private String selector;
	private List<ArgumentsVO> arguments;
}
