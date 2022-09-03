package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class OnSelectionVO {
	private boolean onSelectionChange;
	private String fieldType;
	private String loadDataLabel;
	private String targetPageName;
	private String targetPageId;
	private String passParameter;
	private String pageType;
	private Long version;
}
