package com.yorosis.livetester.vo;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DayBasedReportVO {
	  private Date date;
	  private Long totalTestCases;
	  private Long totalPass;
	  private Long totalFail;
}

