package com.yorosis.yoroflow.services;

import java.io.IOException;
import java.text.ParseException;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.apps.vo.AppsVo;
import com.yorosis.yoroflow.models.ResponseStringVO;

@Service
public class InstallableAppsService {

	@Autowired
	private TaskboardService taskboardService;

	@Autowired
	private WorkflowService workFlowService;

	@Transactional
	public ResponseStringVO saveInstallableApps(AppsVo appsVo) throws IOException, ParseException {
		ResponseStringVO responseStringVO = ResponseStringVO.builder().build();
		responseStringVO = taskboardService.saveTaskBoardFromApps(appsVo);
		if (StringUtils.equals(responseStringVO.getResponse(), "You have exceeded your limit")
				|| StringUtils.equals(responseStringVO.getResponse(), "App already installed in this workspace")) {
			return responseStringVO;
		}
		responseStringVO = workFlowService.saveWorkflowFromApps(appsVo);
		if (StringUtils.equals(responseStringVO.getResponse(), "You have exceeded your limit")
				|| StringUtils.equals(responseStringVO.getResponse(), "App already installed in this workspace")) {
			return responseStringVO;
		}

		return responseStringVO;
	}

}
