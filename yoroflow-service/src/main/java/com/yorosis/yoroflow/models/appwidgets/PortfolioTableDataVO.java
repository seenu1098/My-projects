package com.yorosis.yoroflow.models.appwidgets;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioTableDataVO {
	private List<PortfolioVO> portfolioList;
	private String totalRecords;
}
