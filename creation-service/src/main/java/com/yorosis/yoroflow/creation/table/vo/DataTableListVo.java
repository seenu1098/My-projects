package com.yorosis.yoroflow.creation.table.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DataTableListVo {
	private String totalRecords;
	private List<DataTableVO> dataTableVOList;
}
