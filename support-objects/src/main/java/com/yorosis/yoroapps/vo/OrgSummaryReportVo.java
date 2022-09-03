package com.yorosis.yoroapps.vo;

import java.sql.Timestamp;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrgSummaryReportVo {
	private UUID id;
	private Long activeUsersCount;
	private Long teamsCount;
	private String lastLoggedInUser;
	private String userColor;
	private Timestamp lastLoggedInUserDateAndTime;

}
