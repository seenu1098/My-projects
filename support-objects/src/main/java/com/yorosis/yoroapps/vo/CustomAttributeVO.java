package com.yorosis.yoroapps.vo;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomAttributeVO {
	private List<CustomAttributeListVO> customAttributeListVo;
	private List<UUID> deletedColumnIDList;
	private String subdomainName;
}
