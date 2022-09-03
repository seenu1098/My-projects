package com.yorosis.yoroflow.models;

import java.util.List;
import java.util.Set;

import com.yorosis.yoroflow.models.landingpage.BoardNameVo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class AttachmentsVo {
	private String totalRecords;
	private List<AttachmentsListVo> attachmentsList;
	private Set<BoardNameVo> boardNameList;
}
