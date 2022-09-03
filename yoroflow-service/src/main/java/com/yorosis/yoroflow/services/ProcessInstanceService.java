package com.yorosis.yoroflow.services;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.ProcessInstance;
import com.yorosis.yoroflow.models.FilterValueVO;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.TableData;
import com.yorosis.yoroflow.models.WorkflowDashboardVO;
import com.yorosis.yoroflow.repository.MetricDataRepository;
import com.yorosis.yoroflow.repository.ProcessInstanceRepo;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.request.services.YorosisRoleChecker;

import liquibase.util.BooleanUtils;

@Service
public class ProcessInstanceService {

	private static final String PDM = "Process Name";
	private static final String STARTDATE = "Initiated Date";
	private static final String ENDDATE = "End Date";
	private static final String STARTBY = "Initiated By";
	private static final String ENDBY = "End By";
	private static final String TOTALTIMETAKEN = "Total Time Taken";

	@Autowired
	private ProcessInstanceRepo processInstanceRepo;

	@Autowired
	private MetricDataRepository metricDataRepository;

	@Autowired
	private YorosisRoleChecker yorosisRoleChecker;

	protected Pageable getPageable(PaginationVO vo, boolean hasFilter) {
		Sort sort = null;
		int pageSize = 10;
		if (vo.getSize() > 0) {
			pageSize = vo.getSize();
		}

		if (StringUtils.equalsIgnoreCase(vo.getDirection(), "asc")) {
			sort = Sort.by(new Sort.Order(Direction.ASC, vo.getColumnName()));
		} else if (StringUtils.equalsIgnoreCase(vo.getDirection(), "desc")) {
			sort = Sort.by(new Sort.Order(Direction.DESC, vo.getColumnName()));
		}

		if (hasFilter && sort != null) {
			return PageRequest.of(0, 100000, sort);
		} else if (hasFilter) {
			return PageRequest.of(0, 100000);
		}

		if (sort != null) {
			return PageRequest.of(vo.getIndex(), pageSize, sort);
		}

		return PageRequest.of(vo.getIndex(), pageSize);
	}

	@Transactional
	public TableData getProcessInsatanceList(PaginationVO vo, UUID workspaceId) {
		List<Map<String, String>> list = new ArrayList<>();
		List<ProcessInstance> processInstanceList = null;
		String[] roles = new String[] { "Account Owner", "Account Administrator" };
		Boolean allowAllUsers = yorosisRoleChecker.canAllow(roles);
		if (vo.getFilterValue().length != 0) {
			Pageable pageable = getPageable(vo, true);
			List<ProcessInstance> processInstanceListFilter = null;
			if (BooleanUtils.isTrue(allowAllUsers)) {
				processInstanceListFilter = processInstanceRepo.getProcessInstanceList(pageable, vo.getTaskStatus(),
						YorosisContext.get().getTenantId(), workspaceId);
			} else {
				processInstanceListFilter = processInstanceRepo.getProcessInstanceListByUser(pageable,
						vo.getTaskStatus(), YorosisContext.get().getTenantId(), workspaceId,
						YorosisContext.get().getUserName());
			}
			return getTasks(vo, processInstanceListFilter);
		}
		Pageable pageable = getPageable(vo, false);
		String totalCount = "0";
		if (BooleanUtils.isTrue(allowAllUsers)) {
			processInstanceList = processInstanceRepo.getProcessInstanceList(pageable, vo.getTaskStatus(),
					YorosisContext.get().getTenantId(), workspaceId);

			totalCount = processInstanceRepo.getProcessInstanceListCount(vo.getTaskStatus(),
					YorosisContext.get().getTenantId(), workspaceId);
		} else {
			processInstanceList = processInstanceRepo.getProcessInstanceListByUser(pageable, vo.getTaskStatus(),
					YorosisContext.get().getTenantId(), workspaceId, YorosisContext.get().getUserName());

			totalCount = processInstanceRepo.getProcessInstanceListCountByUser(vo.getTaskStatus(),
					YorosisContext.get().getTenantId(), workspaceId, YorosisContext.get().getUserName());
		}
		for (ProcessInstance procInstance : processInstanceList) {

			list.add(getTaskWithoutFilter(procInstance));

		}
		return TableData.builder().data(list).totalRecords(totalCount).build();
	}

	public Map<String, String> getTaskWithoutFilter(ProcessInstance procInstance) {
		Map<String, String> dataMap = new HashMap<>();

		dataMap.put("col1", procInstance.getProcessInstanceId().toString());
		dataMap.put("col2", procInstance.getProcessDefinition().getProcessDefinitionName());
		dataMap.put("col3", procInstance.getStartTime().toString());
		dataMap.put("col4", procInstance.getUpdatedDate().toString());
		dataMap.put("col5", getTime(procInstance));
		dataMap.put("col6", procInstance.getCreatedBy());
		dataMap.put("col7", procInstance.getUpdatedBy());

		if (procInstance.getEndTime() != null) {
			dataMap.put("col8", procInstance.getEndTime().toString());
		}

		return dataMap;
	}

	public TableData getTasks(PaginationVO pagination, List<ProcessInstance> listOfTasks) {
		List<Map<String, String>> list = new ArrayList<>();

		int pageNumber = pagination.getIndex();
		int pageSize = pagination.getSize() > 0 ? pagination.getSize() : 10;
		int skipRecords = pageNumber * pageSize;

		int matchCount = 0;
		for (ProcessInstance task : listOfTasks) {
			if (doesMatchesFilterValue(task, pagination.getFilterValue())) {
				matchCount++;
				if (matchCount > skipRecords && matchCount <= (skipRecords + pageSize)) {
					list.add(getTaskWithoutFilter(task));
				}
			}
		}

		return TableData.builder().data(list).totalRecords(String.valueOf(matchCount)).build();
	}

	private boolean doesMatchesFilterValue(ProcessInstance filterField, FilterValueVO[] currentFilterList) {
		boolean isMatched = true;
		for (FilterValueVO filterValue : currentFilterList) {
			if (!StringUtils.isEmpty(filterValue.getFilterIdColumn())) {
				if (StringUtils.equalsAny(filterValue.getFilterIdColumn(), STARTDATE, ENDDATE, PDM, TOTALTIMETAKEN,
						STARTBY, ENDBY)) {
					if (StringUtils.equals(filterValue.getFilterIdColumn(), PDM)) {
						String value = filterField.getProcessDefinition().getProcessDefinitionName();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					}
					if (StringUtils.equals(filterValue.getFilterIdColumn(), STARTBY)) {
						String value = filterField.getCreatedBy();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					}
					if (StringUtils.equals(filterValue.getFilterIdColumn(), ENDBY)) {
						String value = filterField.getUpdatedBy();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					}
					LocalDateTime dateValue = null;
					DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
					if (StringUtils.equals(filterValue.getFilterIdColumn(), STARTDATE)) {
						dateValue = filterField.getStartTime();
						dateValue = LocalDateTime.parse(dateValue.toString().subSequence(0, 19), formatter);
					} else if (StringUtils.equals(filterValue.getFilterIdColumn(), ENDDATE)) {
						dateValue = filterField.getEndTime();
						dateValue = LocalDateTime.parse(dateValue.toString().subSequence(0, 19), formatter);
					}
					if (dateValue != null) {
						isMatched = FilterUtils.getDateValue(dateValue.toLocalDate(), filterValue, isMatched);
					}
					if (StringUtils.equals(filterValue.getFilterIdColumn(), TOTALTIMETAKEN)) {
						isMatched = FilterUtils.getTotalTimeFilter(filterField.getStartTime(), filterField.getEndTime(),
								filterValue, isMatched);
					}
				} else {
					isMatched = false;
					break;
				}
			}
		}

		return isMatched;
	}

	private String getTime(ProcessInstance processInstanceId) {
		Long totalTimeTaken = null;

		if (processInstanceId.getStartTime() != null && processInstanceId.getEndTime() != null) {
			totalTimeTaken = ChronoUnit.MINUTES.between(processInstanceId.getStartTime(),
					processInstanceId.getEndTime());
			return getTime(totalTimeTaken);
		}
		return null;
	}

	private String getTime(Long totalTimeTaken) {
		String time = null;
		if ((totalTimeTaken / 24 / 60) != 0) {
			time = totalTimeTaken / 24 / 60 + " " + "day" + " " + totalTimeTaken / 60 % 24 + " " + "hours" + " "
					+ totalTimeTaken % 60 + " " + "minutes";
		} else if ((totalTimeTaken / 60 % 24) != 0) {
			time = totalTimeTaken / 60 % 24 + " " + "hours" + " " + totalTimeTaken % 60 + " " + "minutes";
		} else {
			time = totalTimeTaken % 60 + " " + "minutes";
		}
		return time;
	}

	@Transactional
	public WorkflowDashboardVO getWorkflowProcessList(UUID workspaceId) {
		String[] roles = new String[] { "Account Owner", "Account Administrator" };
		Boolean allowAllUsers = yorosisRoleChecker.canAllow(roles);
		if (BooleanUtils.isTrue(allowAllUsers)) {
			return WorkflowDashboardVO.builder()
					.inProcessListCount(processInstanceRepo
							.getProcessInstanceListCountInProcess(YorosisContext.get().getTenantId(), workspaceId))
					.completedListCount(processInstanceRepo
							.getProcessInstanceListCountCompleted(YorosisContext.get().getTenantId(), workspaceId))
					.errorListCount(processInstanceRepo
							.getProcessInstanceListCountError(YorosisContext.get().getTenantId(), workspaceId))
					.smsCount(metricDataRepository.getSmsCounts(YorosisContext.get().getTenantId(),
							LocalDateTime.now().getMonthValue(), LocalDateTime.now().getYear()))
					.build();
		} else {
//			UsersVO userVO = userService.getLoggedInUserDetails();
//			List<GroupVO> listGroupVO = userVO.getGroupVOList();
//			if (!CollectionUtils.isEmpty(listGroupVO)) {
//				List<UUID> listUUID = listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
//				if (!CollectionUtils.isEmpty(listUUID)) {
			return WorkflowDashboardVO.builder()
					.inProcessListCount(processInstanceRepo.getProcessInstanceListCountInProcessByUser(
							YorosisContext.get().getTenantId(), workspaceId, YorosisContext.get().getUserName()))
					.completedListCount(processInstanceRepo.getProcessInstanceListCountCompletedByUser(
							YorosisContext.get().getTenantId(), workspaceId, YorosisContext.get().getUserName()))
					.smsCount(metricDataRepository.getSmsCounts(YorosisContext.get().getTenantId(),
							LocalDateTime.now().getMonthValue(), LocalDateTime.now().getYear()))
					.build();
		}

	}

}