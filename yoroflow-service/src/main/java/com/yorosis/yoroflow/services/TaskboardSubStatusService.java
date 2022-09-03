package com.yorosis.yoroflow.services;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.TaskboardColumns;
import com.yorosis.yoroflow.entities.TaskboardSubStatus;
import com.yorosis.yoroflow.entities.TaskboardTask;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.SubStatusVO;
import com.yorosis.yoroflow.models.TaskboardSubStatusVO;
import com.yorosis.yoroflow.repository.TaskboardColumnsRepository;
import com.yorosis.yoroflow.repository.TaskboardSubStatusRepository;
import com.yorosis.yoroflow.repository.TaskboardTaskRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class TaskboardSubStatusService {
	@Autowired
	private TaskboardSubStatusRepository taskboardSubStatusRepository;

	@Autowired
	private TaskboardColumnsRepository taskboardColumnsRepository;

	@Autowired
	private TaskboardTaskRepository taskboardTaskRepository;

	private TaskboardSubStatus constructSubStatusVoToDto(SubStatusVO subStatus, TaskboardColumns column) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return TaskboardSubStatus.builder().subStatusName(subStatus.getName()).subStatusColor(subStatus.getColor())
				.activeFlag(YorosisConstants.YES).tenantId(YorosisContext.get().getTenantId()).taskboardColumnId(column)
				.createdBy(YorosisContext.get().getUserName()).modifiedBy(YorosisContext.get().getUserName())
				.createdOn(timestamp).modifiedOn(timestamp).columnOrder(subStatus.getColumnOrder()).build();
	}

	private SubStatusVO constructSubStatusDtoToVo(TaskboardSubStatus taskboardSubStatus) {
		return SubStatusVO.builder().id(taskboardSubStatus.getId()).name(taskboardSubStatus.getSubStatusName())
				.color(taskboardSubStatus.getSubStatusColor()).columnOrder(taskboardSubStatus.getColumnOrder())
				.previousName(taskboardSubStatus.getSubStatusName()).build();
	}

	@Transactional
	public List<SubStatusVO> saveSubStatus(TaskboardSubStatusVO taskboardSubStatusVO) {
		List<TaskboardSubStatus> subStatusList = new ArrayList<>();
		List<SubStatusVO> updateSubStatusList = new ArrayList<>();
		List<SubStatusVO> subStatusVOList = new ArrayList<>();
		if (!taskboardSubStatusVO.getDeletedIdList().isEmpty()) {
			removeSubStatus(taskboardSubStatusVO.getDeletedIdList());
		}
		TaskboardColumns column = taskboardColumnsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				taskboardSubStatusVO.getTaskboardColumnId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		for (SubStatusVO subStatusVO : taskboardSubStatusVO.getSubStatus()) {
			TaskboardSubStatus subStatus = null;
			if (subStatusVO.getId() == null) {
				subStatus = constructSubStatusVoToDto(subStatusVO, column);
			} else {
				subStatus = taskboardSubStatusRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
						subStatusVO.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				subStatus.setSubStatusName(subStatusVO.getName());
				subStatus.setSubStatusColor(subStatusVO.getColor());
				subStatus.setColumnOrder(subStatusVO.getColumnOrder());
				subStatus.setModifiedBy(YorosisContext.get().getUserName());
				subStatus.setModifiedOn(timestamp);
				updateSubStatusList.add(subStatusVO);
			}
			subStatusList.add(subStatus);
		}
		List<TaskboardSubStatus> taskboardSubStatusList = column.getTaskboardSubStatus().stream()
				.filter(task -> StringUtils.equals(task.getActiveFlag(), YorosisConstants.YES))
				.collect(Collectors.toList());
		if ((taskboardSubStatusList == null || taskboardSubStatusList.isEmpty())
				&& taskboardSubStatusVO.getDeletedIdList().isEmpty()) {
			setSubStatus(taskboardSubStatusVO.getSubStatus().get(0).getName(), column);
		}
		if (updateSubStatusList != null && !updateSubStatusList.isEmpty()) {
			updateSubStatusNameInTask(updateSubStatusList, column);
		}
		List<TaskboardSubStatus> taskboardSubStatus = taskboardSubStatusRepository.saveAll(subStatusList);
		subStatusVOList = taskboardSubStatus.stream().map(this::constructSubStatusDtoToVo).collect(Collectors.toList());
		return subStatusVOList;
	}

	@Transactional
	private void removeSubStatus(List<UUID> deletedSubStatusIdList) {
		List<TaskboardSubStatus> subStatus = taskboardSubStatusRepository
				.getIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(deletedSubStatusIdList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
		subStatus.forEach(s -> s.setActiveFlag(YorosisConstants.NO));
		taskboardSubStatusRepository.saveAll(subStatus);
	}

	@Transactional
	public List<SubStatusVO> getSubStatusList(UUID taskboardColumnId) {
		TaskboardColumns column = taskboardColumnsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				taskboardColumnId, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		List<SubStatusVO> subStatusVOList = taskboardSubStatusRepository
				.getSubStatusList(column, YorosisContext.get().getTenantId(), YorosisConstants.YES).stream()
				.map(this::constructSubStatusDtoToVo).collect(Collectors.toList());
		return subStatusVOList;
	}

	@Transactional
	private void setSubStatus(String subStatusName, TaskboardColumns column) {
		List<TaskboardTask> taskboardTaskList = taskboardTaskRepository
				.findByTaskboardAndStatusAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(column.getTaskboard(),
						column.getColumnName(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
			for (TaskboardTask taskboardTask : taskboardTaskList) {
				taskboardTask.setSubStatus(subStatusName);
			}
			taskboardTaskRepository.saveAll(taskboardTaskList);
		}
	}

	@Transactional
	private void updateSubStatusNameInTask(List<SubStatusVO> previousSubStatusList, TaskboardColumns column) {
		for (SubStatusVO subStatus : previousSubStatusList) {
			List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.getTaskboardTaskByPreviousSubStatusName(
					column.getTaskboard(), column.getColumnName(), subStatus.getPreviousName(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			for (TaskboardTask task : taskboardTaskList) {
				task.setSubStatus(subStatus.getName());
			}
			taskboardTaskRepository.saveAll(taskboardTaskList);
		}
	}
}
