package com.yorosis.yoroflow.services;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTaskNotes;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.models.ProcessInstanceTaskNotesVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.repository.ProcessDefinitionTaskRepo;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskNotesRepository;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class ProcessInstanceTaskNotesService {

	private static final String APPROVAL_STATUS = "approvalStatus";
	private static final String SENDBACK = "sendback";
	public static final PolicyFactory IMAGES = new HtmlPolicyBuilder().allowAttributes("src").onElements("img")
			.allowUrlProtocols("data").allowElements("img").toFactory();

	@Autowired
	private ProcessInstanceTaskNotesRepository processInstanceTaskNotesRepository;

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepo;

	@Autowired
	private ProcessDefinitionTaskRepo processDefinitionTaskRepo;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private NotificationsService notificationsService;
	
	@Autowired
	private WorkflowActivityLogService workflowActivityLogService;

	private ProcessInstanceTaskNotesVO constructDTOToVO(ProcessInstanceTaskNotes taskNotes) {
		User user = userRepository.getOne(taskNotes.getAddedBy());
		return ProcessInstanceTaskNotesVO.builder().addedBy(taskNotes.getAddedBy()).notes(taskNotes.getNotes())
				.taskNotesAttId(taskNotes.getTaskNotesAttId()).userName(user.getFirstName() + "  " + user.getLastName())
				.creationTime(taskNotes.getCreatedDate()).build();
	}

	private ProcessInstanceTaskNotes constructVOToDTO(ProcessInstanceTaskNotesVO taskNotesVO) {
//		LocalDateTime timestamp = LocalDateTime.now();  
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return ProcessInstanceTaskNotes.builder().addedBy(taskNotesVO.getAddedBy()).notes(taskNotesVO.getNotes())
				.createdDate((timestamp)).updatedDate(timestamp)
				.processInstanceTask(processInstanceTaskRepo.getOne(taskNotesVO.getProcessInstanceTaskId()))
				.tenantId(YorosisContext.get().getTenantId()).updatedBy(YorosisContext.get().getUserName())
				.parentNotesId(taskNotesVO.getParentNotesId()).build();
	}

	@Transactional
	public ResponseStringVO saveAndUpdateTaskNotes(List<ProcessInstanceTaskNotesVO> taskNotesList) {
		for (ProcessInstanceTaskNotesVO taskNotesVO : taskNotesList) {
			if (taskNotesVO.getTaskNotesAttId() == null) {
				processInstanceTaskNotesRepository.save(constructVOToDTO(taskNotesVO));
			}
		}
		return ResponseStringVO.builder().response("Task Notes Added").build();
	}

	private ProcessInstanceTaskNotes constructNotesVOToDTO(ProcessInstanceTaskNotesVO taskNotesVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return ProcessInstanceTaskNotes.builder().addedBy(taskNotesVO.getAddedBy()).notes(taskNotesVO.getNotes())
				.createdDate(timestamp).updatedDate(timestamp)
				.processInstanceTask(processInstanceTaskRepo.getOne(taskNotesVO.getProcessInstanceTaskId()))
				.tenantId(YorosisContext.get().getTenantId()).updatedBy(YorosisContext.get().getUserName())
				.parentNotesId(taskNotesVO.getParentNotesId()).build();
	}

	@Transactional
	public ResponseStringVO saveTaskNote(ProcessInstanceTaskNotesVO taskNotesVO) throws JsonProcessingException {
		ProcessInstanceTaskNotes notes = null;
		PolicyFactory policy = Sanitizers.FORMATTING.and(Sanitizers.LINKS).and(Sanitizers.BLOCKS).and(IMAGES)
				.and(Sanitizers.STYLES).and(Sanitizers.TABLES).and(Sanitizers.FORMATTING);
		String safeHTML = policy.sanitize(taskNotesVO.getNotes());
		taskNotesVO.setNotes(safeHTML);
		if (taskNotesVO.getTaskNotesAttId() == null) {
			notes = constructNotesVOToDTO(taskNotesVO);
		} else {
			notes = processInstanceTaskNotesRepository.findByTaskNotesAttIdAndTenantIdIgnoreCase(
					taskNotesVO.getTaskNotesAttId(), YorosisContext.get().getTenantId());
			if (notes != null) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				notes.setNotes(taskNotesVO.getNotes());
				notes.setUpdatedBy(YorosisContext.get().getUserName());
				notes.setUpdatedDate(timestamp);
			}
		}
		ProcessInstanceTaskNotes savedNotes = processInstanceTaskNotesRepository.save(notes);
		workflowActivityLogService.saveCommentActivityLogForSave(savedNotes);
		if (taskNotesVO.getMentionedUsersEmail() != null && !taskNotesVO.getMentionedUsersEmail().isEmpty()) {
			notificationsService.handleWorkflowCommentsNotifications(savedNotes.getProcessInstanceTask(), taskNotesVO);
		}
		return ResponseStringVO.builder().response("Task Notes Added").uuid(savedNotes.getTaskNotesAttId()).build();
	}

	@Transactional
	public List<ProcessInstanceTaskNotesVO> getTaskInstanceNotes(UUID instanceTaskId) {
		List<ProcessInstanceTaskNotesVO> taskNotesVOList = new ArrayList<>();
		Pageable pageable = PageRequest.of(0, 50, Sort.by("createdDate").descending());
		ProcessInstanceTask processInstanceTask = processInstanceTaskRepo.getOne(instanceTaskId);
		if (processInstanceTask != null) {
			List<UUID> processInstanceTaskIdList = processInstanceTaskRepo.getTaskListWithoutPagination(
					processInstanceTask.getProcessInstance().getProcessInstanceId(),
					YorosisContext.get().getTenantId());
			if (processInstanceTaskIdList != null && !processInstanceTaskIdList.isEmpty()) {
				for (ProcessInstanceTaskNotes taskNotes : processInstanceTaskNotesRepository
						.getNotesList(processInstanceTaskIdList, YorosisContext.get().getTenantId())) {
					taskNotesVOList.add(constructDTOToVO(taskNotes));
				}
			}
		}
		return taskNotesVOList;
	}

	private ProcessInstanceTaskNotesVO constructNotesDTOToVO(ProcessInstanceTaskNotes taskNotes, UUID instanceTaskId) {
		User user = userRepository.getOne(taskNotes.getAddedBy());
		List<ProcessInstanceTaskNotesVO> taskNotesVOList = new ArrayList<>();
		List<ProcessInstanceTaskNotes> taskNoteList = processInstanceTaskNotesRepository.getNestedNotes(instanceTaskId,
				taskNotes.getTaskNotesAttId(), YorosisContext.get().getTenantId());
		if (taskNoteList != null && !taskNoteList.isEmpty()) {
			for (ProcessInstanceTaskNotes notes : taskNoteList) {
				taskNotesVOList.add(constructNotesDTOToVO(notes, instanceTaskId));
			}
		}
		return ProcessInstanceTaskNotesVO.builder().addedBy(taskNotes.getAddedBy()).notes(taskNotes.getNotes())
				.taskNotesAttId(taskNotes.getTaskNotesAttId()).userName(user.getFirstName() + " " + user.getLastName())
				.modifiedOn(taskNotes.getUpdatedDate()).creationTime(taskNotes.getCreatedDate())
				.taskNotes(taskNotesVOList).build();
	}

	@Transactional
	public List<ProcessInstanceTaskNotesVO> getTaskNotes(UUID instanceTaskId) {
		List<ProcessInstanceTaskNotesVO> taskNotesVOList = new ArrayList<>();
		ProcessInstanceTask processInstanceTask = processInstanceTaskRepo.getOne(instanceTaskId);
		if (processInstanceTask != null) {
			List<UUID> processInstanceTaskIdList = processInstanceTaskRepo.getTaskListWithoutPagination(
					processInstanceTask.getProcessInstance().getProcessInstanceId(),
					YorosisContext.get().getTenantId());
			if (processInstanceTaskIdList != null && !processInstanceTaskIdList.isEmpty()) {
				List<ProcessInstanceTaskNotes> taskNotesList = processInstanceTaskNotesRepository
						.getNotesList(processInstanceTaskIdList, YorosisContext.get().getTenantId());
				if (taskNotesList != null && !taskNotesList.isEmpty()) {
					for (ProcessInstanceTaskNotes taskNotes : taskNotesList) {
						if (taskNotes.getParentNotesId() == null) {
							taskNotesVOList.add(constructNotesDTOToVO(taskNotes, instanceTaskId));
							taskNotesVOList.get(0).setTaskNotesLength(taskNotesList.size());
						}
					}
				}
			}
		}
		return taskNotesVOList;
	}

	@Transactional
	public Set<ProcessInstanceTaskNotesVO> getTaskInstanceNotesForSendBack(UUID instanceTaskId, UUID eventTaskId) {
		Set<ProcessInstanceTaskNotesVO> taskNotesVOList = new LinkedHashSet<>();
		Pageable pageable = PageRequest.of(0, 50, Sort.by("createdDate").descending());
		ProcessInstanceTask processInstanceApproveTask = processInstanceTaskRepo.getOne(instanceTaskId);
		if (processInstanceApproveTask != null) {
			String approvalStatus = getText(processInstanceApproveTask.getData(), APPROVAL_STATUS, null);
			if (StringUtils.equalsIgnoreCase(approvalStatus, SENDBACK)) {
				ProcessDefinitionTask seqflow = processDefinitionTaskRepo.getProcessTaskForSendBack(
						processInstanceApproveTask.getProcessDefinitionTask().getTargetStepKey(),
						processInstanceApproveTask.getProcessInstance().getProcessDefinition().getProcessDefinitionId(),
						YorosisContext.get().getTenantId());
				if (seqflow != null) {
					ProcessDefinitionTask sendBack = processDefinitionTaskRepo.getProcessTaskForSendBack(
							seqflow.getTargetStepKey(), seqflow.getProcessDefinition().getProcessDefinitionId(),
							YorosisContext.get().getTenantId());
					if (sendBack != null) {
						List<ProcessInstanceTask> sendBackTaskList = processInstanceTaskRepo.getTaskWithTaskId(
								sendBack.getTaskId(),
								processInstanceApproveTask.getProcessInstance().getProcessInstanceId(),
								YorosisContext.get().getTenantId());
						if (!CollectionUtils.isEmpty(sendBackTaskList) && sendBackTaskList.size() > 2) {
//						for (ProcessInstanceTask sendBackTask : sendBackTaskList) {
							for (ProcessInstanceTaskNotes taskNotes : processInstanceTaskNotesRepository.getNotes(
									sendBackTaskList.get(2).getProcessInstanceTaskId(),
									YorosisContext.get().getTenantId(), pageable)) {
								taskNotesVOList.add(constructDTOToVOForSendBack(taskNotes, eventTaskId));
							}
						}
					}
				}
			}
		}
		return taskNotesVOList;
	}

	private String getText(JsonNode propertyValue, String key, String defaultValue) {
		if (propertyValue != null && propertyValue.has(key)) {
			return propertyValue.get(key).asText();
		}

		return defaultValue;
	}

	private ProcessInstanceTaskNotesVO constructDTOToVOForSendBack(ProcessInstanceTaskNotes taskNotes,
			UUID eventTaskId) {
		User user = userRepository.getOne(taskNotes.getAddedBy());
		return ProcessInstanceTaskNotesVO.builder().addedBy(taskNotes.getAddedBy()).notes(taskNotes.getNotes())
				.taskNotesAttId(null).processInstanceTaskId(eventTaskId)
				.userName(user.getFirstName() + "  " + user.getLastName()).creationTime(taskNotes.getCreatedDate())
				.build();
	}

}
