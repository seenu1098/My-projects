package com.yorosis.yoroapps.automation;

import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LabelEventPayload {

	private Set<String> existingLabels;
	private Set<String> newLabels;

}
