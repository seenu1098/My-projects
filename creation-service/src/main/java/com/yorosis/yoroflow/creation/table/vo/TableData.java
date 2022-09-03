package com.yorosis.yoroflow.creation.table.vo;

import java.util.List;
import java.util.Map;

import com.yorosis.yoroapps.vo.UsersVO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableData {
	private List<Map<String, Object>> data;
	private List<UsersVO> userVoList;
	private String totalRecords;
}
