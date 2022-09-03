package com.yorosis.yoroflow.models.landingpage;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class BoardNameVo {
	private UUID taskBoardId;
	private String boardName;
	private String name;
}
