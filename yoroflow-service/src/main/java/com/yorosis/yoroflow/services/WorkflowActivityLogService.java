package com.yorosis.yoroflow.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.automation.ActivityLogInfo;
import com.yorosis.yoroflow.entities.ActivityLog;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTaskNotes;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.activity.ActivityLogVo;
import com.yorosis.yoroflow.models.activity.WorkflowActivityLogVo;
import com.yorosis.yoroflow.repository.ActivityLogRepository;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class WorkflowActivityLogService {

	private static final String ACTIVITY_ADDED_COMMENT = "wf_comment";
	private static final String ACTIVITY_ADDED_ATTACHMENT = "wf_attachment";
	private static final String ACTIVITY_DRAFT = "wf_draft";
	private static final String ACTIVITY_APPROVED = "wf_approved";
	private static final String ACTIVITY_REJECT = "wf_rejectd";
	private static final String ACTIVITY_SEND_BACK = "wf_sendback";
	private static final String ACTIVITY_SUBMITTED = "wf_submitted";
	private static final String ACTIVITY_ASSIGN_TO_USER = "wf_assign_to_user";
	private static final String ACTIVITY_ASSIGN_TO_ME = "wf_assign_to_me";
	private static final String ACTIVITY_ASSIGN_TO_GROUP = "wf_assign_to_group";

	private static final Map<String, String> mapActivityLog = populateActivityLogMap();

	private static HashMap<String, String> populateActivityLogMap() {
		HashMap<String, String> activityLogMap = new HashMap<>();
		activityLogMap.put("submitTask", ACTIVITY_SUBMITTED);
		activityLogMap.put("addedComment", ACTIVITY_ADDED_COMMENT);
		activityLogMap.put("sendback", ACTIVITY_SEND_BACK);
		activityLogMap.put("reject", ACTIVITY_REJECT);
		activityLogMap.put("approved", ACTIVITY_APPROVED);
		activityLogMap.put("draft", ACTIVITY_DRAFT);
		activityLogMap.put("assignToMe", ACTIVITY_ASSIGN_TO_ME);
		activityLogMap.put("assignToUser", ACTIVITY_ASSIGN_TO_USER);
		activityLogMap.put("assignToGroup", ACTIVITY_ASSIGN_TO_GROUP);
		return activityLogMap;
	}

	@Autowired(required = false)
	private QueueService queueService;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private ActivityLogRepository activityLogRepository;

	@Autowired
	UsersRepository usersRepository;

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepo;

	private WorkflowActivityLogVo constructActivityLogDtotoVo(ActivityLog taskboardActiveLog, String taskName) {
		return WorkflowActivityLogVo.builder().createdOn(taskboardActiveLog.getCreatedOn()).taskName(taskName)
				.activityType(taskboardActiveLog.getActivityType()).userId(taskboardActiveLog.getActivityLogUserId())
				.activityData(taskboardActiveLog.getActivityData()).build();
	}

	private ActivityLogInfo constructActivityLogVotoDto(String type, UUID instanceId, UUID taskId, UUID workspaceId,
			UUID userId, String activityData) {
		return ActivityLogInfo.builder().activityType(type).parentId(instanceId)
				.tenantId(YorosisContext.get().getTenantId()).workspaceId(workspaceId).childId(taskId).userId(userId)
				.activityData(activityData).build();
	}

	public void saveActivityLog(ActivityLogInfo activityLogInfo) throws JsonProcessingException {
		if (queueService == null) {
			log.warn("Queue Service is disabled. Need to fallback to database table!");
		} else {
			log.info("The Payload for activityLog {} >>>>>", mapper.writeValueAsString(activityLogInfo));
			queueService.publishToActivityQueue(activityLogInfo);
		}
	}

	@Transactional
	public UUID getUserId() {
		User user = usersRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (user != null) {
			return user.getUserId();
		}
		return null;
	}

	public void saveActivityLogForSave(ProcessInstanceTask processInstanceTask, UUID userId)
			throws JsonProcessingException {
		saveActivityLog(constructActivityLogVotoDto(ACTIVITY_DRAFT,
				processInstanceTask.getProcessInstance().getProcessInstanceId(),
				processInstanceTask.getProcessInstanceTaskId(),
				processInstanceTask.getProcessInstance().getProcessDefinition().getWorkspaceId(), userId,
				"Task saved as draft"));
	}

	public void saveCommentActivityLogForSave(ProcessInstanceTaskNotes savedNotes) throws JsonProcessingException {
		saveActivityLog(
				constructActivityLogVotoDto(ACTIVITY_ADDED_COMMENT,
						savedNotes.getProcessInstanceTask().getProcessInstance().getProcessInstanceId(),
						savedNotes.getProcessInstanceTask().getProcessInstanceTaskId(), savedNotes
								.getProcessInstanceTask().getProcessInstance().getProcessDefinition().getWorkspaceId(),
						getUserId(), "Comments added"));
	}

	public void saveActionsActivityLogForSave(ProcessInstanceTask processInstanceTask, String actions)
			throws JsonProcessingException {
		saveActivityLog(constructActivityLogVotoDto(mapActivityLog.get(actions),
				processInstanceTask.getProcessInstance().getProcessInstanceId(),
				processInstanceTask.getProcessInstanceTaskId(),
				processInstanceTask.getProcessInstance().getProcessDefinition().getWorkspaceId(), getUserId(),
				processInstanceTask.getProcessDefinitionTask().getTaskName()));
	}

	public void saveAssignActivityLogForSave(ProcessInstanceTask processInstanceTask, String actions, String assignee)
			throws JsonProcessingException {
		saveActivityLog(constructActivityLogVotoDto(mapActivityLog.get(actions),
				processInstanceTask.getProcessInstance().getProcessInstanceId(),
				processInstanceTask.getProcessInstanceTaskId(),
				processInstanceTask.getProcessInstance().getProcessDefinition().getWorkspaceId(), getUserId(),
				assignee));
	}

	protected Pageable getPageable(PaginationVO vo) {
		Sort sort = null;
		int pageSize = 10;
		if (vo.getSize() > 0) {
			pageSize = vo.getSize();
		}
		if (!StringUtils.isEmpty(vo.getColumnName())) {
			if (StringUtils.equals(vo.getDirection(), "desc")) {
				sort = Sort.by(new Sort.Order(Direction.DESC, vo.getColumnName()));
			} else {
				sort = Sort.by(new Sort.Order(Direction.ASC, vo.getColumnName()));
			}
		}

		if (sort != null) {
			return PageRequest.of(vo.getIndex(), pageSize, sort);
		}
		return PageRequest.of(vo.getIndex(), pageSize);
	}

	@Transactional
	public ActivityLogVo getAllActivityList(PaginationVO vo, UUID instanceId) {
		List<WorkflowActivityLogVo> workflowActivityLogVoList = new ArrayList<>();
		Pageable pageable = getPageable(vo);
		List<ActivityLog> activeLogList = activityLogRepository.getWorkflowActivityLogList(
				YorosisContext.get().getTenantId(), YorosisConstants.YES, instanceId, pageable);
		Long activeLogListCount = activityLogRepository
				.getWorkflowActivityLogListCount(YorosisContext.get().getTenantId(), YorosisConstants.YES, instanceId);
		List<UUID> instanceTaskIdList = new ArrayList<>();
		if (activeLogList != null) {
			activeLogList.stream().filter(i -> i.getChildId() != null).forEach(i -> {
				instanceTaskIdList.add(i.getChildId());
			});
			List<ProcessInstanceTask> listOfTasks = new ArrayList<>();
			if (!instanceTaskIdList.isEmpty()) {
				listOfTasks = processInstanceTaskRepo.getTaskNameFromInstanceId(instanceId,
						YorosisContext.get().getTenantId());
			}
			for (ActivityLog activity : activeLogList) {
				String taskName = null;
				List<ProcessInstanceTask> task = listOfTasks.stream().filter(p -> StringUtils
						.equals(p.getProcessInstanceTaskId().toString(), activity.getChildId().toString()))
						.collect(Collectors.toList());
				if (!task.isEmpty()) {
					taskName = task.get(0).getProcessDefinitionTask().getTaskName();
				}
				workflowActivityLogVoList.add(constructActivityLogDtotoVo(activity, taskName));
			}
		}
		return ActivityLogVo.builder().workflowActivityLogVoList(workflowActivityLogVoList)
				.totalCount(activeLogListCount).build();
	}

}
