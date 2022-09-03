package com.yorosis.yoroapps.automation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailFile {

	private String fileName;
	private String location;
	private String fileKey;
	private String fileMimeType;

}
