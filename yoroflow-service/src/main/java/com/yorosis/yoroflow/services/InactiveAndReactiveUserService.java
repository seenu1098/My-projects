package com.yorosis.yoroflow.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.vo.ReactiveOrInactiveUsers;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.services.docs.YoroDocumentService;

@Service
public class InactiveAndReactiveUserService {

	@Autowired
	private TaskboardService taskboardService;

	@Autowired
	private YoroDocumentService yoroDocumentService;

	@Transactional
	public ResponseStringVO saveReactiveUser(ReactiveOrInactiveUsers userId) {
		taskboardService.saveReactiveUser(userId);
		yoroDocumentService.saveReactiveUser(userId);
		return ResponseStringVO.builder().build();
	}

	@Transactional
	public ResponseStringVO saveInactiveUser(ReactiveOrInactiveUsers userId) {
		taskboardService.saveInactiveUser(userId);
		yoroDocumentService.saveInactiveUser(userId);
		return ResponseStringVO.builder().build();
	}
}
