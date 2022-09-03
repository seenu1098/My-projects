package com.yorosis.yoroflow.services;

import java.io.IOException;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroflow.entities.ProcessDefinition;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.WorkflowReport;
import com.yorosis.yoroflow.entities.WorkflowReportPermission;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.FilterValueVO;
import com.yorosis.yoroflow.models.GroupVO;
import com.yorosis.yoroflow.models.PageFieldVo;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.ReportGenerationVo;
import com.yorosis.yoroflow.models.ReportHeadersVo;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.TaskDetailsVO;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.UsersVO;
import com.yorosis.yoroflow.models.WorkflowReportMenuVo;
import com.yorosis.yoroflow.models.WorkflowReportVo;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.repository.ProcessDefinitionRepo;
import com.yorosis.yoroflow.repository.ProcessDefinitionTaskRepo;
import com.yorosis.yoroflow.repository.WorkflowReportPermissionRepository;
import com.yorosis.yoroflow.repository.WorkflowReportRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.service.type.TaskService;

import io.jsonwebtoken.lang.Collections;

@Service
public class WorkflowReportService {

	@Autowired
	private WorkflowReportRepository workflowReportRepository;

	@Autowired
	private ProcessDefinitionTaskRepo processDefinitionTaskRepo;

	@Autowired
	private WorkflowReportPermissionRepository workflowReportPermissionRepository;

	Map<TaskType, TaskService> mapTaskService = new EnumMap<>(TaskType.class);

	@Autowired
	List<TaskService> listTaskService;

	@Autowired
	private YoroappsServiceClient yoroappsClient;

	@Autowired
	private UserService userService;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private ProcessDefinitionRepo processDefinitionRepo;

	private Object object;

	private static final String MAIN_SECTION = "mainSection";
	private static final String SUB_SECTION = "subSection";
	private static final String TABLE_CONTROL = "tableControl";

	@PostConstruct
	private void initialize() {
		listTaskService.stream().forEach(s -> mapTaskService.put(s.getTaskType(), s));
	}

	private WorkflowReport constructVOToDTO(WorkflowReportVo workflowReportVo) {
		return WorkflowReport.builder().activeFlag(YorosisConstants.YES).tenantId(YorosisContext.get().getTenantId())
				.reportName(workflowReportVo.getReportName()).reportType(workflowReportVo.getReportType())
				.workflowKey(workflowReportVo.getWorkflowKey()).workflowName(workflowReportVo.getWorkflowName())
				.workflowVersion(workflowReportVo.getWorkflowVersion()).taskName(workflowReportVo.getTaskName())
				.reportJson(workflowReportVo.getReportJson()).modifiedBy(YorosisContext.get().getUserName())
				.enableReport(booleanToChar(workflowReportVo.isEnableReport())).taskId(workflowReportVo.getTaskId())
				.createdBy(YorosisContext.get().getUserName()).workspaceId(workflowReportVo.getWorkspaceId())
				.latestVersion(booleanToChar(workflowReportVo.isLatestVersion())).build();
	}

	private WorkflowReportVo constructDTOToVO(WorkflowReport workflowReport) {
		return WorkflowReportVo.builder().reportName(workflowReport.getReportName()).taskId(workflowReport.getTaskId())
				.enableReport(charToBoolean(workflowReport.getEnableReport())).id(workflowReport.getId())
				.reportType(workflowReport.getReportType()).workflowKey(workflowReport.getWorkflowKey())
				.workflowName(workflowReport.getWorkflowName()).workflowVersion(workflowReport.getWorkflowVersion())
				.taskName(workflowReport.getTaskName()).reportJson(workflowReport.getReportJson())
				.latestVersion(charToBoolean(workflowReport.getLatestVersion()))
				.workspaceId(workflowReport.getWorkspaceId()).build();
	}

	@Transactional
	public ResponseStringVO save(WorkflowReportVo workflowReportVo) throws IOException {
		if (workflowReportVo.getId() == null) {
			WorkflowReport workflowReport = constructVOToDTO(workflowReportVo);
			workflowReportRepository.save(workflowReport);
			saveReportPermission(workflowReportVo, workflowReport.getId(), workflowReport);
			yoroappsClient.saveReportMenuDetails(YorosisContext.get().getToken(),
					WorkflowReportMenuVo.builder().reportId(workflowReport.getId())
							.reportName(workflowReportVo.getReportName())
							.enableReport(workflowReportVo.isEnableReport()).build());
			return ResponseStringVO.builder().response("Report configuration created successfully").build();
		} else {
			WorkflowReport workflowReport = workflowReportRepository.getOne(workflowReportVo.getId());
			saveReportPermission(workflowReportVo, workflowReportVo.getId(), workflowReport);
			workflowReport.setReportName(workflowReportVo.getReportName());
			workflowReport.setReportType(workflowReportVo.getReportType());
			workflowReport.setWorkflowKey(workflowReportVo.getWorkflowKey());
			workflowReport.setWorkflowName(workflowReportVo.getWorkflowName());
			workflowReport.setWorkflowVersion(workflowReportVo.getWorkflowVersion());
			workflowReport.setTaskName(workflowReportVo.getTaskName());
			workflowReport.setReportJson(workflowReportVo.getReportJson());
			workflowReport.setTaskId(workflowReportVo.getTaskId());
			workflowReport.setWorkspaceId(workflowReportVo.getWorkspaceId());
			workflowReport.setEnableReport(booleanToChar(workflowReportVo.isEnableReport()));
			workflowReport.setLatestVersion(booleanToChar(workflowReportVo.isLatestVersion()));
			workflowReport.setModifiedBy(YorosisContext.get().getUserName());
			workflowReportRepository.save(workflowReport);
			yoroappsClient.saveReportMenuDetails(YorosisContext.get().getToken(),
					WorkflowReportMenuVo.builder().reportId(workflowReport.getId())
							.reportName(workflowReportVo.getReportName())
							.enableReport(workflowReportVo.isEnableReport()).build());
			return ResponseStringVO.builder().response("Report configuration updated successfully").build();
		}
	}

	@Transactional
	public WorkflowReportVo getWorkFlowReport(UUID id) {
		WorkflowReport workflowReport = workflowReportRepository.getOne(id);
		if (workflowReport != null) {
			return constructDTOToVO(workflowReport);
		}
		return WorkflowReportVo.builder().build();
	}

	@Transactional
	public List<TaskDetailsVO> getTaskNameBasedOnWorkflow(String key, Long version) {
		List<TaskDetailsVO> taskNameList = new ArrayList<TaskDetailsVO>();
		for (ProcessDefinitionTask task : processDefinitionTaskRepo.getProcessTaskName(key, version,
				YorosisContext.get().getTenantId())) {
			taskNameList.add(TaskDetailsVO.builder().taskName(task.getTaskName()).taskKey(task.getTaskStepKey())
					.taskId(task.getTaskId()).build());
		}
		return taskNameList;
	}

	@Transactional
	public List<PageFieldVo> getFieldValuesBasedOnTask(UUID taskId) {
		List<PageFieldVo> pagefieldVo = new ArrayList<>();
		Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();
		ProcessDefinitionTask task = processDefinitionTaskRepo.findByTaskIdAndTenantId(taskId,
				YorosisContext.get().getTenantId());
		if (task != null && task.getTaskProperties().get(0).getPropertyValue() != null) {
			String taskType = task.getTaskType();
			TaskService taskService = mapTaskService.get(TaskType.valueOf(taskType));
			if (taskService != null) {
				Set<PageFieldVo> listPageArrayFieldVo = new LinkedHashSet<>();
				Set<PageFieldVo> listPageTableFieldVo = new LinkedHashSet<>();
				Set<FieldVO> listFieldMainSectionVO = new LinkedHashSet<>();
				String repeatableFieldName = null;
				fieldList = taskService.getFieldList(task.getTaskProperties().get(0).getPropertyValue());
				if (fieldList.get(MAIN_SECTION) != null) {
					List<FieldVO> taskServiceFieldMainSectionList = (fieldList.get(MAIN_SECTION));
					listFieldMainSectionVO.addAll(taskServiceFieldMainSectionList);
				}
				if (fieldList.get(SUB_SECTION) != null) {
					List<FieldVO> taskServiceFieldSubSectionListForSort = new ArrayList<>();
					List<FieldVO> taskServiceFieldSubSectionListUnSorted = (fieldList.get(SUB_SECTION));
					for (FieldVO fieldVO : taskServiceFieldSubSectionListUnSorted) {
						if (StringUtils.equals(repeatableFieldName, fieldVO.getRepeatableFieldName())) {
							taskServiceFieldSubSectionListForSort.add(fieldVO);
						} else {
							if (!CollectionUtils.isEmpty(taskServiceFieldSubSectionListForSort)) {
								listPageArrayFieldVo.add(PageFieldVo.builder().fieldType(repeatableFieldName + ":")
										.fieldVO((taskServiceFieldSubSectionListForSort)).build());
								taskServiceFieldSubSectionListForSort = new ArrayList<>();
							}
							repeatableFieldName = fieldVO.getRepeatableFieldName();
							taskServiceFieldSubSectionListForSort.add(fieldVO);
							listFieldMainSectionVO.add(FieldVO.builder().fieldId(fieldVO.getRepeatableFieldId())
									.fieldName(fieldVO.getRepeatableFieldName()).datatype("array").build());
						}
					}
					if (!CollectionUtils.isEmpty(taskServiceFieldSubSectionListForSort)) {
						listPageArrayFieldVo.add(PageFieldVo.builder().fieldType(repeatableFieldName + ":")
								.fieldVO((taskServiceFieldSubSectionListForSort)).build());
					}
				}
				if (fieldList.get(TABLE_CONTROL) != null) {
					List<FieldVO> taskServiceFieldTableSectionList = (fieldList.get(TABLE_CONTROL));
					if (!CollectionUtils.isEmpty(taskServiceFieldTableSectionList))
						listPageTableFieldVo.add(PageFieldVo.builder()
								.fieldType(taskServiceFieldTableSectionList.get(0).getRepeatableFieldName() + ":")
								.fieldVO(taskServiceFieldTableSectionList).build());
				}
				if (!CollectionUtils.isEmpty(listFieldMainSectionVO)) {
					List<FieldVO> pageFieldsList = new ArrayList<FieldVO>();
					pageFieldsList.addAll(listFieldMainSectionVO);
					pagefieldVo.add(
							PageFieldVo.builder().fieldType("Workflow Variables:").fieldVO(pageFieldsList).build());
				}

				if (!listPageTableFieldVo.isEmpty()) {
					pagefieldVo.addAll(listPageTableFieldVo);
				}

				if (!listPageArrayFieldVo.isEmpty()) {
					pagefieldVo.addAll(listPageArrayFieldVo);
				}
			}
		}
		return pagefieldVo;
	}

	private void saveReportPermission(WorkflowReportVo workflowReportVo, UUID reportId, WorkflowReport workflowReport) {
		if (workflowReportVo.getId() != null) {
			List<WorkflowReportPermission> workflowReportPermissionList = workflowReportPermissionRepository
					.getListBasedonReportId(reportId, YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (!CollectionUtils.isEmpty(workflowReportPermissionList) && !workflowReportVo.isEnableReport()) {
				workflowReportPermissionRepository.deleteAll(workflowReportPermissionList);
			}
			List<UUID> existIdList = new ArrayList<>();
			for (WorkflowReportPermission workflowReportPermission : workflowReportPermissionList) {
				existIdList.add(workflowReportPermission.getGroupId());
			}
			if (!CollectionUtils.isEmpty(workflowReportVo.getGroupId())) {
				for (UUID groupId : workflowReportVo.getGroupId()) {
					if (CollectionUtils.isEmpty(workflowReportPermissionList)) {
						workflowReportPermissionRepository
								.save(constructPermissionVo(reportId, groupId, workflowReport));
					} else {
						if (!existIdList.contains(groupId)) {
							workflowReportPermissionRepository
									.save(constructPermissionVo(reportId, groupId, workflowReport));
						}
					}
				}
			}
		} else if (workflowReportVo.isEnableReport()) {
			if (workflowReportVo.getGroupId() != null && !CollectionUtils.isEmpty(workflowReportVo.getGroupId())) {
				for (UUID groupId : workflowReportVo.getGroupId()) {
					workflowReportPermissionRepository.save(constructPermissionVo(reportId, groupId, workflowReport));
				}
			}
		}
	}

	private WorkflowReportPermission constructPermissionVo(UUID reportId, UUID groupId, WorkflowReport workflowReport) {
		return WorkflowReportPermission.builder().modifiedBy(YorosisContext.get().getUserName())
				.createdBy(YorosisContext.get().getUserName()).activeFlag("Y").workflowReport(workflowReport)
				.tenantId(YorosisContext.get().getTenantId()).groupId(groupId).build();
	}

	private Boolean checkVersion(JsonNode reportJson) {
		if (reportJson != null && reportJson.has("allowAllVersion") && reportJson.get("allowAllVersion") != null) {
			return reportJson.get("allowAllVersion").asBoolean();
		}
		return false;
	}

	@Transactional
	public ReportGenerationVo getValues(PaginationVO pagination) throws ParseException {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		// pagination.getProcessInstanceId() ==>> reportId
		WorkflowReport workflowReport = workflowReportRepository.getWorkFlowReport(pagination.getProcessInstanceId(),
				userGroupIdsList, YorosisConstants.YES, YorosisContext.get().getTenantId());
		ReportGenerationVo objectNOde = null;
		List<UUID> taskIdList = new ArrayList<>();
		if (workflowReport != null) {
			if (StringUtils.equals(workflowReport.getLatestVersion(), YorosisConstants.YES)
					|| checkVersion(workflowReport.getReportJson())) {
				List<ProcessDefinition> processDefList = processDefinitionRepo.getProcessDefinitionByKeyWithWorkspace(
						workflowReport.getWorkflowKey(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
						workflowReport.getWorkspaceId());
				if (processDefList != null && !processDefList.isEmpty()) {
					if (StringUtils.equals(workflowReport.getLatestVersion(), YorosisConstants.YES)) {
						List<ProcessDefinitionTask> processDefinitionTaskList = processDefinitionTaskRepo
								.getProcessTaskNameById(workflowReport.getWorkflowKey(),
										Long.valueOf(processDefList.get(0).getWorkflowVersion()),
										YorosisContext.get().getTenantId(), workflowReport.getWorkspaceId(),
										workflowReport.getTaskName());
						if (processDefinitionTaskList != null && !processDefinitionTaskList.isEmpty()) {
							processDefinitionTaskList.forEach(p -> {
								if (StringUtils.equals(p.getTaskName(), workflowReport.getTaskName())) {
									taskIdList.add(p.getTaskId());
								}
							});
						}
					} else {
						List<ProcessDefinitionTask> processDefinitionTaskList = processDefinitionTaskRepo
								.getProcessTaskNameByKey(workflowReport.getWorkflowKey(),
										YorosisContext.get().getTenantId(), workflowReport.getWorkspaceId(),
										workflowReport.getTaskName());
						if (processDefinitionTaskList != null && !processDefinitionTaskList.isEmpty()) {
							processDefinitionTaskList.forEach(p -> {
								if (StringUtils.equals(p.getTaskName(), workflowReport.getTaskName())) {
									taskIdList.add(p.getTaskId());
								}
							});
						}
					}
				}
			} else {
				taskIdList.add(workflowReport.getTaskId());
			}
			objectNOde = getTabularReport(workflowReport, pagination, taskIdList);
			if (objectNOde != null && objectNOde.getReportHeaders().size() > 0) {
				objectNOde.setReportName(workflowReport.getReportName());
				return objectNOde;
			}
			return ReportGenerationVo.builder().reportName(workflowReport.getReportName()).build();
		}
		return null;
	}

	private List<UUID> getGroupAsUUID(UsersVO userVO) {
		List<GroupVO> listGroupVO = userVO.getGroupVOList();

		if (Collections.isEmpty(listGroupVO)) {
			return java.util.Collections.emptyList();
		}

		return listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
	}

	private ReportGenerationVo getTabularReport(WorkflowReport workflowReport, PaginationVO pagination,
			List<UUID> taskIdList) throws ParseException {
		StringBuilder tabularReportBuilder = new StringBuilder();
		List<Object> argumentValuesList = new ArrayList<>();
		List<String> aliasList = new ArrayList<>();
		List<ReportHeadersVo> headersList = new ArrayList<>();
		StringBuilder groupByBuilder = new StringBuilder();
		boolean groupBy = false;
		String totalSize = "0";
		List<String> fromClause = new ArrayList<String>();
		StringBuilder selectBuilder = (getSelectClause(workflowReport.getReportJson(), argumentValuesList, aliasList,
				headersList, groupByBuilder, fromClause));
		tabularReportBuilder
				.append(getWhereClause(workflowReport.getReportJson(), taskIdList, argumentValuesList, pagination));
		if (groupByBuilder.length() > 2) {
			groupBy = true;
			tabularReportBuilder.append(groupByBuilder);
		}
		if (pagination.getFilterValue() != null && pagination.getFilterValue().length > 0) {
			tabularReportBuilder.append(getHavingClause(pagination.getFilterValue(), argumentValuesList));
		}
		StringBuilder pageCountBuilder = new StringBuilder();
		pageCountBuilder.append("select count(*) from process_instance_tasks as p ");
		if (!CollectionUtils.isEmpty(fromClause)) {
			for (String from : fromClause) {
				pageCountBuilder.append(", jsonb_array_elements(p.task_data -> '").append(from).append("') ")
						.append(from).append(" ");
			}
		}
		pageCountBuilder.append(tabularReportBuilder);
		Query pageCountQuery = entityManager.createNativeQuery(pageCountBuilder.toString());
		int pageCountIndex = 1;
		for (Object value : argumentValuesList) {
			pageCountQuery.setParameter(pageCountIndex++, value);
		}
		if (groupBy) {
			List<?> pageCountResult = pageCountQuery.getResultList();
			totalSize = String.valueOf(pageCountResult.size());
		} else {
			Object pageCountResult = pageCountQuery.getSingleResult();
			totalSize = pageCountResult.toString();
		}
		getPaginationQuery(pagination.getIndex(), pagination.getSize(), argumentValuesList, pagination,
				tabularReportBuilder, groupByBuilder);
		selectBuilder.append(tabularReportBuilder);
		return executeAndGetResults(selectBuilder.toString(), argumentValuesList, aliasList, headersList, totalSize);
	}

	private StringBuilder getHavingClause(FilterValueVO[] filterValuesList, List<Object> argumentValuesList) {
		StringBuilder haveClauseBuilder = new StringBuilder();
		for (FilterValueVO gridFilter : filterValuesList) {
			if (!StringUtils.isEmpty(gridFilter.getFilterIdColumn())
					&& StringUtils.startsWith(gridFilter.getFilterIdColumn(), "ya_count")) {
				if (haveClauseBuilder.length() == 0) {
					haveClauseBuilder.append(" having ");
				}
				StringBuilder filterValues = new StringBuilder();
				String countFieldName = gridFilter.getFilterIdColumn().substring(8);
				filterValues.append("count (p.task_data ->> '").append(countFieldName).append("') ");
				filterValues.append(getOperator(gridFilter.getOperators()));
				filterValues.append(" ? ");
				argumentValuesList.add(Long.parseLong(gridFilter.getFilterIdColumnValue()));
				if (haveClauseBuilder.length() > 8) {
					haveClauseBuilder.append(" and ");
				}
				haveClauseBuilder.append(filterValues);
			}
		}
		return haveClauseBuilder;
	}

	// ->> 'text' as Test, p.task_data ->> 'number' as Number
	private StringBuilder getSelectClause(JsonNode reportJson, List<Object> argumentValuesList, List<String> aliasList,
			List<ReportHeadersVo> headersList, StringBuilder groupByBuilder, List<String> fromClause) {
		StringBuilder selectClauseBuilder = new StringBuilder();
		selectClauseBuilder.append("select ");
		getDisplayColumns(reportJson, selectClauseBuilder, argumentValuesList, aliasList, headersList, groupByBuilder,
				fromClause);
		selectClauseBuilder.append(" from process_instance_tasks as p ");
		if (!CollectionUtils.isEmpty(fromClause)) {
			for (String from : fromClause) {
				selectClauseBuilder.append(", jsonb_array_elements(p.task_data -> '").append(from).append("') ")
						.append(from).append(" ");
			}
		}
		return selectClauseBuilder;
	}

	private void getDisplayColumns(JsonNode reportJson, StringBuilder selectClauseBuilder,
			List<Object> argumentValuesList, List<String> aliasList, List<ReportHeadersVo> headersList,
			StringBuilder groupByBuilder, List<String> fromClause) {
		if (reportJson != null) {
			int i = 0;
			if (reportJson.has("displayColumns")) {
				JsonNode displayColumns = reportJson.get("displayColumns");
				Iterator<String> fieldNames = displayColumns.fieldNames();
				while (fieldNames.hasNext()) {
					String fieldName = fieldNames.next();
					if (displayColumns.has(fieldName) && displayColumns.get(fieldName).asText() != null) {
						JsonNode fieldNode = displayColumns.get(fieldName);
						if (fieldNode != null && fieldNode.has("displayName")
								&& fieldNode.get("displayName").asText() != null && fieldNode.has("fieldName")
								&& !fieldNode.get("fieldName").isNull()
								&& fieldNode.get("fieldName").asText() != null) {
							headersList.add(ReportHeadersVo.builder().headerId(fieldName)
									.headerDetails(fieldNode.get("fieldName"))
									.headerName(fieldNode.get("displayName").asText()).build());
							aliasList.add(fieldName);
							JsonNode fieldNodes = fieldNode.get("fieldName");
							if (fieldNodes.has("repeatableFieldId") && !fieldNodes.get("repeatableFieldName").isNull()
									&& fieldNodes.get("repeatableFieldId").asText() != null) {
								if (!fromClause.contains(fieldNodes.get("repeatableFieldId").asText())) {
									fromClause.add(fieldNodes.get("repeatableFieldId").asText());
								}
								addDisplayNames(selectClauseBuilder, fieldName, i,
										fieldNodes.get("repeatableFieldId").asText());
							} else {
								addDisplayNames(selectClauseBuilder, fieldName, i, "p.task_data");
							}
							i++;
						}
					}
				}
			}
			boolean groupBy = false;
			if (reportJson.has("sumColumns")) {
				JsonNode sumColumns = reportJson.get("sumColumns");
				if (!sumColumns.isEmpty()) {
					groupBy = true;
					getSumBuilder(reportJson, selectClauseBuilder, argumentValuesList, aliasList, i, headersList,
							fromClause);
				}
			}
			if (reportJson.has("averageColumns")) {
				JsonNode averageColumns = reportJson.get("averageColumns");
				if (!averageColumns.isEmpty()) {
					groupBy = true;
					getAvgBuilder(reportJson, selectClauseBuilder, argumentValuesList, aliasList, i, headersList,
							fromClause);
				}
			}
			if (reportJson.has("countColumns")) {
				JsonNode countColumns = reportJson.get("countColumns");
				if (!countColumns.isEmpty()) {
					groupBy = true;
					getCountBuilder(reportJson, selectClauseBuilder, argumentValuesList, aliasList, i, headersList,
							fromClause);
				}
			}
			if (reportJson.has("groupByColumns") && groupBy) {
				JsonNode groupByColumns = reportJson.get("groupByColumns");
				if (!groupByColumns.isEmpty()) {
					getGroupBy(reportJson, groupByBuilder);
				}
			}
		}
	}

	private void addDisplayNames(StringBuilder selectClauseBuilder, String fieldName, int i, String objName) {
		if (i == 0) {
			selectClauseBuilder.append(objName).append(" ->> '").append(fieldName).append("' as \"").append(fieldName)
					.append("\"");
		} else {
			selectClauseBuilder.append(", ").append(objName).append(" ->> '").append(fieldName).append("' as \"")
					.append(fieldName).append("\"");
		}
	}

	private void getSumBuilder(JsonNode reportJson, StringBuilder selectClauseBuilder, List<Object> argumentValuesList,
			List<String> aliasList, int i, List<ReportHeadersVo> headersList, List<String> fromClause) {
		JsonNode sumColumns = reportJson.get("sumColumns");
		Iterator<String> fieldNames = sumColumns.fieldNames();
		if (i == 0) {
			selectClauseBuilder.append("sum (");
		} else {
			selectClauseBuilder.append(", sum (");
		}
		i++;
		int displayName = 0;
		while (fieldNames.hasNext()) {
			String fieldName = fieldNames.next();
			if (sumColumns.has(fieldName) && sumColumns.get(fieldName).asText() != null) {
				JsonNode fieldNode = sumColumns.get(fieldName);
				if (fieldNode != null && fieldNode.has("fieldName") && reportJson.has("sumDisplayName")
						&& !fieldNode.get("fieldName").isNull() && !reportJson.get("sumDisplayName").isNull()
						&& fieldNode.get("fieldName").asText() != null) {
					if (displayName == 0) {
						headersList.add(
								ReportHeadersVo.builder().headerId("ya_sum").headerDetails(fieldNode.get("fieldName"))
										.headerName(reportJson.get("sumDisplayName").asText()).build());
						aliasList.add("ya_sum");
					}
					JsonNode fieldNodes = fieldNode.get("fieldName");
					if (fieldNodes.has("repeatableFieldId") && !fieldNodes.get("repeatableFieldId").isNull()
							&& fieldNodes.get("repeatableFieldId").asText() != null) {
						if (!fromClause.contains(fieldNodes.get("repeatableFieldId").asText())) {
							fromClause.add(fieldNodes.get("repeatableFieldId").asText());
						}
						addSumBuilder(selectClauseBuilder, fieldName, displayName,
								fieldNodes.get("repeatableFieldId").asText());
					} else {
						addSumBuilder(selectClauseBuilder, fieldName, displayName, "p.task_data");
					}
					displayName++;
				}
			}
		}
		selectClauseBuilder.append(") as ya_sum");
	}

	private void addSumBuilder(StringBuilder selectClauseBuilder, String fieldName, int displayName, String objName) {
		if (displayName == 0) {
			selectClauseBuilder.append("cast(case when coalesce(").append(objName).append(" ->> '").append(fieldName)
					.append("', '') = '' then '0' else cast((").append(objName).append(" ->> '").append(fieldName)
					.append("') as float4) end as float4)");
		} else {
			selectClauseBuilder.append(" + (cast(case when coalesce(").append(objName).append(" ->> '")
					.append(fieldName).append("', '') = '' then '0' else cast((").append(objName).append(" ->> '")
					.append(fieldName).append("') as float4) end as float4))");
		}
	}

	private void getAvgBuilder(JsonNode reportJson, StringBuilder selectClauseBuilder, List<Object> argumentValuesList,
			List<String> aliasList, int i, List<ReportHeadersVo> headersList, List<String> fromClause) {
		JsonNode averageColumns = reportJson.get("averageColumns");
		Iterator<String> fieldNames = averageColumns.fieldNames();
		while (fieldNames.hasNext()) {
			String fieldName = fieldNames.next();
			if (averageColumns.has(fieldName) && averageColumns.get(fieldName).asText() != null) {
				JsonNode fieldNode = averageColumns.get(fieldName);
				if (fieldNode != null && fieldNode.has("fieldName") && fieldNode.has("displayName")
						&& fieldNode.get("displayName").asText() != null && !fieldNode.get("fieldName").isNull()
						&& fieldNode.get("fieldName").asText() != null) {
					headersList.add(ReportHeadersVo.builder().headerId("ya_avg" + fieldName)
							.headerDetails(fieldNode.get("fieldName")).headerName(fieldNode.get("displayName").asText())
							.build());
					aliasList.add("ya_avg" + fieldName);
					JsonNode fieldNodes = fieldNode.get("fieldName");
					if (fieldNodes.has("repeatableFieldId") && !fieldNodes.get("repeatableFieldId").isNull()
							&& fieldNodes.get("repeatableFieldId").asText() != null) {
						if (!fromClause.contains(fieldNodes.get("repeatableFieldId").asText())) {
							fromClause.add(fieldNodes.get("repeatableFieldId").asText());
						}
						addAvgBuilder(selectClauseBuilder, fieldName, i, fieldNodes.get("repeatableFieldId").asText());
					} else {
						addAvgBuilder(selectClauseBuilder, fieldName, i, "p.task_data");
					}
					i++;
				}
			}
		}
	}

	private void addAvgBuilder(StringBuilder selectClauseBuilder, String fieldName, int i, String objName) {
		if (i == 0) {
			selectClauseBuilder.append("avg (cast(case when coalesce(").append(objName).append(" ->> '")
					.append(fieldName).append("', '') = '' then '0' else cast((").append(objName).append(" ->> '")
					.append(fieldName).append("') as float4) end as float4)) as ya_avg").append(fieldName);
		} else {
			selectClauseBuilder.append(", avg (cast(case when coalesce(").append(objName).append(" ->> '")
					.append(fieldName).append("', '') = '' then '0' else cast((").append(objName).append(" ->> '")
					.append(fieldName).append("') as float4) end as float4)) as ya_avg").append(fieldName);
		}
	}

	private void getCountBuilder(JsonNode reportJson, StringBuilder selectClauseBuilder,
			List<Object> argumentValuesList, List<String> aliasList, int i, List<ReportHeadersVo> headersList,
			List<String> fromClause) {
		JsonNode countColumns = reportJson.get("countColumns");
		Iterator<String> fieldNames = countColumns.fieldNames();
		while (fieldNames.hasNext()) {
			String fieldName = fieldNames.next();
			if (countColumns.has(fieldName) && countColumns.get(fieldName).asText() != null) {
				JsonNode fieldNode = countColumns.get(fieldName);
				if (fieldNode != null && fieldNode.has("fieldName") && fieldNode.has("displayName")
						&& fieldNode.get("displayName").asText() != null && !fieldNode.get("fieldName").isNull()
						&& fieldNode.get("fieldName").asText() != null) {
					headersList.add(ReportHeadersVo.builder().headerId("ya_count" + fieldName)
							.headerDetails(fieldNode.get("fieldName")).headerName(fieldNode.get("displayName").asText())
							.build());
					aliasList.add("ya_count" + fieldName);
					JsonNode fieldNodes = fieldNode.get("fieldName");
					if (fieldNodes.has("repeatableFieldId") && !fieldNodes.get("repeatableFieldId").isNull()
							&& fieldNodes.get("repeatableFieldId").asText() != null) {
						if (!fromClause.contains(fieldNodes.get("repeatableFieldId").asText())) {
							fromClause.add(fieldNodes.get("repeatableFieldId").asText());
						}
						addCountBuilder(selectClauseBuilder, fieldName, i,
								fieldNodes.get("repeatableFieldId").asText());
					} else {
						addCountBuilder(selectClauseBuilder, fieldName, i, "p.task_data");
					}
					i++;
				}
			}
		}
	}

	private void addCountBuilder(StringBuilder selectClauseBuilder, String fieldName, int i, String objName) {
		if (i == 0) {
			selectClauseBuilder.append(" count (").append(objName).append(" ->> '").append(fieldName)
					.append("') as ya_count").append(fieldName);
		} else {
			selectClauseBuilder.append(", count (").append(objName).append(" ->> '").append(fieldName)
					.append("') as ya_count").append(fieldName);
		}
	}

	private void getGroupBy(JsonNode reportJson, StringBuilder groupByBuilder) {
		JsonNode groupByColumns = reportJson.get("groupByColumns");
		int i = 0;
		groupByBuilder.append(" group by (");
		Iterator<String> fieldNames = groupByColumns.fieldNames();
		while (fieldNames.hasNext()) {
			String fieldName = fieldNames.next();
			if (groupByColumns.has(fieldName) && groupByColumns.get(fieldName).asText() != null) {
				JsonNode fieldNode = groupByColumns.get(fieldName);
				if (fieldNode != null && fieldNode.has("fieldName") && !fieldNode.get("fieldName").isNull()
						&& fieldNode.get("fieldName").asText() != null) {
					JsonNode fieldNodes = fieldNode.get("fieldName");
					if (fieldNodes.has("repeatableFieldId") && !fieldNodes.get("repeatableFieldId").isNull()
							&& fieldNodes.get("repeatableFieldId").asText() != null) {
						addGroupByBuilder(groupByBuilder, fieldName, i, fieldNodes.get("repeatableFieldId").asText());
					} else {
						addGroupByBuilder(groupByBuilder, fieldName, i, "p.task_data");
					}
					i++;
				}
			}
		}
		groupByBuilder.append(")");
	}

	private void addGroupByBuilder(StringBuilder groupByBuilder, String fieldName, int i, String objName) {
		if (i == 0) {
			groupByBuilder.append(objName).append(" ->> '").append(fieldName).append("'");
		} else {
			groupByBuilder.append(", ").append(objName).append(" ->> '").append(fieldName).append("'");
		}
	}

	private StringBuilder getWhereClause(JsonNode reportJson, List<UUID> taskIdList, List<Object> argumentValuesList,
			PaginationVO pagination) throws ParseException {
		StringBuilder whereClauseBuilder = new StringBuilder();
//		List<UUID> taskIdList = new ArrayList<>();
//		argumentValuesList.add(taskIdList);
		if (taskIdList != null && !taskIdList.isEmpty()) {
			whereClauseBuilder.append("where (p.task_id in (");
			int i = 0;
			for (UUID f : taskIdList) {
				if (i == 0) {
					whereClauseBuilder.append("'").append(f).append("'");
				} else {
					whereClauseBuilder.append(", '").append(f).append("'");
				}
				i++;
			}
		}
		whereClauseBuilder.append(") and p.task_data is not null");
		if (!StringUtils.isEmpty(pagination.getTaskStatus())) {
			argumentValuesList.add(pagination.getTaskStatus());
			whereClauseBuilder.append(" and p.status = ?");
		}
		if (pagination.getFilterValue() != null && pagination.getFilterValue().length > 0) {
			populateFilterData(whereClauseBuilder, pagination.getFilterValue(), argumentValuesList, reportJson);
		}
		populateDateSearchFilter(whereClauseBuilder, pagination, argumentValuesList);
		whereClauseBuilder.append(")");
		return whereClauseBuilder;
	}

	private StringBuilder populateFilterData(StringBuilder whereBuilder, FilterValueVO[] filterValuesList,
			List<Object> argumentValuesList, JsonNode reportJson) throws ParseException {
		for (FilterValueVO gridFilter : filterValuesList) {
			if (!StringUtils.isEmpty(gridFilter.getFilterIdColumn())
					&& !StringUtils.startsWith(gridFilter.getFilterIdColumn(), "ya_count")) {
				StringBuilder filterValues = new StringBuilder();
				if (StringUtils.isEmpty(gridFilter.getRepeatableFieldId())) {
					filterValues.append("p.task_data ->> '");
				} else {
					filterValues.append(gridFilter.getRepeatableFieldId()).append(" ->> '");
				}
				filterValues.append(gridFilter.getFilterIdColumn()).append("' ");
				whereBuilder.append(" and ");
				boolean isCaseInsensitive = isString(gridFilter.getFilterDataType())
						&& StringUtils.equalsAnyIgnoreCase(gridFilter.getOperators(), "bw", "ew", "cn");

				whereBuilder.append(isCaseInsensitive ? "lower(" : "").append(filterValues)
						.append(isCaseInsensitive ? ")" : "");
				if (!StringUtils.equalsIgnoreCase(gridFilter.getFilterDataType(), "date")) {
					whereBuilder.append(getOperator(gridFilter.getOperators()));
					whereBuilder.append(" ? ");
				}
				getOperand(gridFilter.getFilterIdColumnValue(), gridFilter, whereBuilder, argumentValuesList);
			}
		}
		return whereBuilder;
	}

	private StringBuilder populateDateSearchFilter(StringBuilder whereBuilder, PaginationVO pagination,
			List<Object> argumentValuesList) {
		if (!StringUtils.isEmpty(pagination.getDateSearch())) {
			LocalDate today = LocalDate.now();
			if (StringUtils.equals(pagination.getTaskStatus(), "COMPLETED")) {
				whereBuilder.append(" and p.end_time between ? and ? ");
			} else {
				whereBuilder.append(" and p.start_time between ? and ? ");
			}
			if (StringUtils.equals(pagination.getDateSearch(), "today")) {
				argumentValuesList.add(today.atStartOfDay());
				argumentValuesList.add(today.plusDays(1).atStartOfDay());
			} else if (StringUtils.equals(pagination.getDateSearch(), "yesterday")) {
				argumentValuesList.add(today.minusDays(1).atStartOfDay());
				argumentValuesList.add(today.atStartOfDay());
			} else if (StringUtils.equals(pagination.getDateSearch(), "lastWeek")) {
				argumentValuesList.add(today.minusDays(7));
				argumentValuesList.add(today.plusDays(1).atStartOfDay());
			} else if (StringUtils.equals(pagination.getDateSearch(), "last2Month")) {
				argumentValuesList.add(today.minusDays(60));
				argumentValuesList.add(today.plusDays(1).atStartOfDay());
			} else if (StringUtils.equals(pagination.getDateSearch(), "lastMonth")) {
				argumentValuesList.add(today.minusMonths(1));
				argumentValuesList.add(today.plusDays(1).atStartOfDay());
			} else if (StringUtils.equals(pagination.getDateSearch(), "betweenDates")) {
				argumentValuesList.add(pagination.getStartDate());
				argumentValuesList.add(pagination.getEndDate());
			}
		}
		return whereBuilder;
	}

	private void getDateOperator(String operator, LocalDate date1, StringBuilder whereBuilder,
			List<Object> argumentValuesList) {
		if (!StringUtils.equals(operator.toLowerCase().trim(), "ne")) {
			whereBuilder.append(" between ? and ? ");
		}
		switch (operator.toLowerCase().trim()) {
		case "eq":
			argumentValuesList.add(date1.atStartOfDay());
			argumentValuesList.add(date1.plusDays(1).atStartOfDay());
			break;
		case "ne":
			whereBuilder.append(" not between ? and ? ");
			argumentValuesList.add(date1.atStartOfDay());
			argumentValuesList.add(date1.plusDays(1).atStartOfDay());
			break;
		case "gt":
			argumentValuesList.add(date1.plusDays(1).atStartOfDay());
			argumentValuesList.add(date1.plusYears(50).atStartOfDay());
			break;
		case "ge":
			argumentValuesList.add(date1.atStartOfDay());
			argumentValuesList.add(date1.plusYears(50).atStartOfDay());
			break;

		case "lt":
			argumentValuesList.add(date1.atStartOfDay());
			argumentValuesList.add(date1.minusYears(50).atStartOfDay());
			break;

		case "le":
			argumentValuesList.add(date1.plusDays(1).atStartOfDay());
			argumentValuesList.add(date1.minusYears(50).atStartOfDay());
			break;

		default:

		}
	}

	private boolean isString(String dataType) {
		return (StringUtils.equalsAnyIgnoreCase(dataType, "text", "string"));
	}

	private void getOperand(String filterValue, FilterValueVO gridFilter, StringBuilder whereBuilder,
			List<Object> argumentValuesList) throws ParseException {
		if (isString(gridFilter.getFilterDataType())
				&& !StringUtils.startsWith(gridFilter.getFilterIdColumn(), "ya_count")) {
			switch (gridFilter.getOperators().toLowerCase().trim()) {
			case "bw":
				filterValue = filterValue.toLowerCase() + '%';
				break;
			case "ew":
				filterValue = '%' + filterValue.toLowerCase();
				break;
			case "cn":
				filterValue = '%' + filterValue.toLowerCase() + '%';
				break;
			default:
			}
		}
		getValue(gridFilter, filterValue, whereBuilder, argumentValuesList);
	}

	private void getValue(FilterValueVO gridFilter, String value, StringBuilder whereBuilder,
			List<Object> argumentValuesList) throws ParseException {
		Object newValue = value;
		boolean setArgument = true;
		if (gridFilter != null && value != null && StringUtils.isNotBlank(gridFilter.getFilterDataType())) {
			if (StringUtils.equalsIgnoreCase(gridFilter.getFilterDataType(), "date")) {
				Date date = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").parse(value);
				LocalDate date1 = date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
				date1 = date1.plusDays(1);
				getDateOperator(gridFilter.getOperators(), date1, whereBuilder, argumentValuesList);
				setArgument = false;
			} else if (StringUtils.equalsAnyIgnoreCase(gridFilter.getFilterDataType(), "long", "number")
					|| StringUtils.startsWith(gridFilter.getFilterIdColumn(), "ya_count")) {
				newValue = Long.parseLong(value);
			} else if (StringUtils.equalsAnyIgnoreCase(gridFilter.getFilterDataType(), "double", "float")) {
				newValue = Double.parseDouble(value);
			}
		}
		if (setArgument)
			argumentValuesList.add(newValue);
	}

	private ReportGenerationVo executeAndGetResults(String sql, List<Object> argumentList, List<String> aliasList,
			List<ReportHeadersVo> headersList, String totalSize) {

		Query nativeQuery = getNativeQuery(sql, argumentList);

//		@SuppressWarnings("unchecked")
//		List<JsonNode> properties = (List<JsonNode>) entityManager 
//		.createNativeQuery( "SELECT task_data " + "FROM process_instance_tasks " + "WHERE cast(task_id as varchar) = :isbn") 
//		.setParameter("isbn", "dd1dfd08-3ae2-4960-aae4-3006a5c4fd62") .unwrap(org.hibernate.query.NativeQuery.class) 
//		.addScalar("task_data", JsonNodeBinaryType.INSTANCE) .getResultList();
//		.unwrap(org.hibernate.query.NativeQuery.class)
//		.addScalar("task_data", JsonNodeBinaryType.INSTANCE)

		List<?> resultList = nativeQuery.getResultList();
		List<Map<String, String>> list = new ArrayList<>();
		for (Object rows : resultList) {
			Object[] arrObject = null;
			if (aliasList.size() == 1) {
				arrObject = new Object[] { rows };
			} else {
				arrObject = (Object[]) rows;
			}

			int index = 0;
			Map<String, String> dataMap = null;
			dataMap = new HashMap<>();
			for (Object col : arrObject) {
				if (col != null) {
					if (col instanceof Float) {
						dataMap.put(aliasList.get(index), new DecimalFormat("#.##").format((Float) col));
					} else if (col instanceof Double) {
						dataMap.put(aliasList.get(index), new DecimalFormat("#.##").format((Double) col));
					} else {
						dataMap.put(aliasList.get(index), col.toString());
					}
				} else {
					dataMap.put(aliasList.get(index), null);
				}
				index++;
			}
			list.add(dataMap);
		}
		return ReportGenerationVo.builder().data(list).reportHeaders(headersList).totalRecords(totalSize).build();
	}

	private Query getNativeQuery(String sql, List<Object> argumentList) {
		Query nativeQuery = entityManager.createNativeQuery(sql);
		int index = 1;
		for (Object object : argumentList) {
			nativeQuery.setParameter(index++, object);
		}
		return nativeQuery;
	}

	private StringBuilder getPaginationQuery(int pageNo, int size, List<Object> filterValuesList,
			PaginationVO paginationInfo, StringBuilder builder, StringBuilder groupByBuilder) {
		if (StringUtils.isNotBlank(paginationInfo.getColumnName())
				&& StringUtils.isNotBlank(paginationInfo.getDirection())) {
			if (StringUtils.equals(paginationInfo.getColumnName(), "p.start_time") && groupByBuilder.length() < 2) {
				builder.append(" ORDER BY ").append(paginationInfo.getColumnName()).append(" ")
						.append(paginationInfo.getDirection()).append(" ");
			} else if (!StringUtils.equals(paginationInfo.getColumnName(), "p.start_time")) {
				builder.append(" ORDER BY ").append(paginationInfo.getColumnName() + " ")
						.append(paginationInfo.getDirection()).append(" ");
//				filterValuesList.add(paginationInfo.getColumnName());
			}
		}
		if (size > 0) {
			size = size <= 0 ? 10 : size;
			pageNo = (pageNo < 1) ? 1 : pageNo + 1;

			builder.append(" LIMIT ?");
			filterValuesList.add(size <= 0 ? 10 : size);

			if (pageNo > 1) {
				builder.append(" OFFSET ? ");
				filterValuesList.add(size * (pageNo - 1));
			}
		}
		return builder;
	}

	private boolean charToBoolean(String enableReport) {
		return (enableReport == "Y") ? true : false;
	}

	private String booleanToChar(boolean enableReport) {
		return (enableReport) ? "Y" : "N";
	}

	private String getOperator(String operator) {
		String actualOperator = null;
		switch (operator.toLowerCase().trim()) {
		case "eq":
			actualOperator = " = ";
			break;
		case "ne":
			actualOperator = " != ";
			break;
		case "bw":
		case "ew":
		case "cn":
			actualOperator = " like ";
			break;
		case "gt":
			actualOperator = " > ";
			break;
		case "ge":
			actualOperator = " >= ";
			break;

		case "lt":
			actualOperator = " < ";
			break;

		case "le":
			actualOperator = " <= ";
			break;

		default:
			actualOperator = " = ";
		}

		return actualOperator;
	}

	@Transactional(readOnly = true)
	public void getExcelForTotalRecords(PaginationVO reportVo, HttpServletResponse response)
			throws YoroFlowException, ParseException {
//		ReportGenerationVo report = getValues(PaginationVO.builder().processInstanceId(reportId).direction("asc")
//				.columnName("p.start_time").index(0).size(0).build());
		reportVo.setIndex(0);
		reportVo.setSize(10000);
		ReportGenerationVo report = getValues(reportVo);
		getExcel(report, response);
	}

	public static boolean isValidDate(String inDate) {
		if (StringUtils.isNotBlank(inDate)) {
			SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-mm-dd");
			dateFormat.setLenient(false);
			try {
				dateFormat.parse(inDate.trim());
			} catch (ParseException pe) {
				return false;
			}
			return true;
		}
		return false;
	}

	public void getExcel(ReportGenerationVo reportData, HttpServletResponse response)
			throws YoroFlowException, ParseException {
		if (!CollectionUtils.isEmpty(reportData.getData()) || !CollectionUtils.isEmpty(reportData.getReportHeaders())) {
			List<Map<String, String>> data = reportData.getData();
			try (SXSSFWorkbook workbook = new SXSSFWorkbook(10000);) {
				SXSSFSheet sheet = workbook.createSheet(reportData.getReportName());
				List<Integer> dateColumn = new ArrayList<>();
				int iSheet = 0;

				for (Map.Entry<String, String> entry : data.get(0).entrySet()) {
					if (StringUtils.contains(entry.getValue(), "0Z")) {
						dateColumn.add(iSheet);
					}
					sheet.setColumnWidth(iSheet++, 3500);
				}

				Row row = sheet.createRow(0);
				row.setHeightInPoints(20f);
				int irow = 0;

				for (Map.Entry<String, String> entry : data.get(0).entrySet()) {
					for (ReportHeadersVo key : reportData.getReportHeaders()) {
						if (StringUtils.equals(key.getHeaderId(), entry.getKey()))
							row.createCell(irow++).setCellValue(key.getHeaderName());
					}
				}
				CreationHelper createHelper = workbook.getCreationHelper();

				short dateFormat = createHelper.createDataFormat().getFormat("MM/dd/yyyy");

				CellStyle cellStyle = workbook.createCellStyle();
				cellStyle.setDataFormat(dateFormat);
				Font font = workbook.createFont();
				cellStyle.setFont(font);
				cellStyle.setAlignment(HorizontalAlignment.LEFT);
				cellStyle.setWrapText(true);

				CellStyle rowCellStyle = workbook.createCellStyle();
				Font rowFont = workbook.createFont();
				rowFont.setBold(true);
				rowCellStyle.setFont(rowFont);
				rowCellStyle.setFillBackgroundColor(IndexedColors.BRIGHT_GREEN.getIndex());
				for (int i = 0; i < row.getLastCellNum(); i++) {
					row.getCell(i).setCellStyle(rowCellStyle);
				}

				int rownum = 1;
				for (int i = 0; i < data.size(); i++) {
					row = sheet.createRow(rownum++);
					int colnum = 0;
					for (Map.Entry<String, String> entry : data.get(i).entrySet()) {
						if (dateColumn.contains(colnum) && !StringUtils.isEmpty(entry.getValue())) {
							Cell dateCell = row.createCell(colnum++);
							Date parseDate = new SimpleDateFormat("yyyy-MM-dd")
									.parse(entry.getValue().substring(0, 10));
							String dateString = new SimpleDateFormat("dd MMM yyyy").format(parseDate);
							dateCell.setCellValue(dateString);
							dateCell.setCellStyle(cellStyle);
						} else {
							row.createCell(colnum++).setCellValue(entry.getValue());
						}
					}
				}
				response.setHeader("content-disposition",
						"attachment; filename=" + reportData.getReportName() + ".xlsx");

				for (int x = 0; x < sheet.getRow(0).getPhysicalNumberOfCells(); x++) {
					sheet.trackAllColumnsForAutoSizing();
					sheet.autoSizeColumn(x);
				}

				workbook.write(response.getOutputStream());
				workbook.dispose();
			} catch (IOException ie) {
				throw new YoroFlowException("File is invalid");
			}

		}
	}
}