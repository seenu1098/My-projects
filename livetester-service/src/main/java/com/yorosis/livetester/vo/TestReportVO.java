package com.yorosis.livetester.vo;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestReportVO {
    private Timestamp fromDate;
    private Timestamp toDate;
    private List<String> batchNames;
    private String reportType;
    private List<TestReportGenerateVO> testReportVOList;
    private String response;
    private List<Date> createdDate;
}
