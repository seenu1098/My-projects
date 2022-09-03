package com.yorosis.taskboard.models;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PageFieldVo {
	private String fieldType;
	private List<FieldVO> fieldVO;
}
