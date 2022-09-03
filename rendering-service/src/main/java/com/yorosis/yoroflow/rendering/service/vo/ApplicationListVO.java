package com.yorosis.yoroflow.rendering.service.vo;

import java.util.List;

import com.yorosis.yoroapps.vo.ApplicationVO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationListVO {
	private List<String> applicationIdList;
	private List<ApplicationVO> applicationList;
}
