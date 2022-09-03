package com.yorosis.yoroflow.models.docs;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DocCommentListVo {
	private int commentLength;
	private List<DocsCommentVo> docsCommentVoList;
}
