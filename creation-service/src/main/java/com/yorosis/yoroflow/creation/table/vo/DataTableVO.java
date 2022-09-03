package com.yorosis.yoroflow.creation.table.vo;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DataTableVO {
	private UUID id;
	private List<ColumnDataVO> values;
}
