package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResolveSecurityForSectionVO {
	private boolean read;
	private boolean create;
	private boolean update;
	private boolean delete;
	private boolean show;
}
