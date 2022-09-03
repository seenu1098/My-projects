package com.yorosis.yoroflow.creation.menu.service;

import java.sql.Timestamp;
import java.util.UUID;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.yoroapps.entities.MenuDetails;
import com.yorosis.yoroapps.menu.vo.WorkflowReportMenuVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.CustomPagesRepository;
import com.yorosis.yoroflow.creation.repository.MenuConfigurationRepository;
import com.yorosis.yoroflow.creation.repository.MenuDetailsRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class WorflowReportMenu {

	@Autowired
	private CustomPagesRepository customPagesRepository;

	@Autowired
	private MenuDetailsRepository menuDetailsRepo;

	@Autowired
	private MenuConfigurationRepository menuConfigurationRepo;

	private MenuDetails constructMenuDetailsVOTODTO(WorkflowReportMenuVo vo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return MenuDetails.builder().menuName(vo.getReportName()).tenantId(YorosisContext.get().getTenantId()).menuPath("get-report")
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp).displayOrder(1L).modifiedBy(YorosisContext.get().getUserName())
				.modifiedOn(timestamp).activeFlag(YoroappsConstants.YES).parentMenuId(UUID.fromString("52be1d92-34f1-4678-b4a7-f76386ab61d5"))
				.reportId(vo.getReportId()).build();
	}

	@Transactional
	public ResponseStringVO saveWorkflowReportMenu(WorkflowReportMenuVo reportVo) {
		if (reportVo != null) {
			MenuDetails reportMenuDetails = menuDetailsRepo.getReportMenuDetails(reportVo.getReportId(), YorosisContext.get().getTenantId());
			if (reportMenuDetails == null && reportVo.isEnableReport()) {
				MenuDetails menuDetails = constructMenuDetailsVOTODTO(reportVo);
				menuDetails.setCustomPage(customPagesRepository.getOne(UUID.fromString("40f4fa62-098b-4f28-8b97-e99c904ebaf4")));
				menuDetails.setMenu(menuConfigurationRepo.getOne(UUID.fromString("4c98b424-ff35-4c27-894d-9fc6d9d49cc4")));
				menuDetailsRepo.save(menuDetails);
			} else if (reportMenuDetails != null) {
				reportMenuDetails.setMenuName(reportVo.getReportName());
				if (reportVo.isEnableReport()) {
					reportMenuDetails.setActiveFlag(YoroappsConstants.YES);
				} else {
					reportMenuDetails.setActiveFlag(YoroappsConstants.NO);
				}
				menuDetailsRepo.save(reportMenuDetails);
				return ResponseStringVO.builder().response("menu details added").build();
			}
		}
		return ResponseStringVO.builder().response("menu details not added").build();
	}
}
