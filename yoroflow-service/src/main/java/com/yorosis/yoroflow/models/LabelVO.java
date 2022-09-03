package com.yorosis.yoroflow.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LabelVO {
	private String labelName;
	private String labelcolor;
	private UUID taskboardLabelId;
	private UUID taskboardTaskLabelId;
}
