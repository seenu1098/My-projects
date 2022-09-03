package com.yorosis.yoroflow.models.landingpage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class AssignToVO {
	private String name;
	private String firstName;
	private String lastName;
}
