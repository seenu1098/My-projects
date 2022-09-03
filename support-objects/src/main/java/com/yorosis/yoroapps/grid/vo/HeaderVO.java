package com.yorosis.yoroapps.grid.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeaderVO {
	private String headerId;
	private String headerName;

	private boolean sortable;
	private boolean filterable;
	private boolean hidden;
	private boolean enabled;
	private boolean parameterOnClick;

	private int widthPercentage;

	private String fieldDataType;
	private int columnSeqNo;
}
