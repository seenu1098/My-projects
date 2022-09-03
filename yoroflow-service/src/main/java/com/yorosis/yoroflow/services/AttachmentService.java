package com.yorosis.yoroflow.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
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

import com.yorosis.yoroflow.entities.Taskboard;
import com.yorosis.yoroflow.entities.TaskboardTaskFiles;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.AttachmentsListVo;
import com.yorosis.yoroflow.models.AttachmentsVo;
import com.yorosis.yoroflow.models.FilterValueVO;
import com.yorosis.yoroflow.models.GroupVO;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.UsersVO;
import com.yorosis.yoroflow.models.landingpage.BoardNameVo;
import com.yorosis.yoroflow.repository.TaskboardTaskFilesRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class AttachmentService {

	private static final String CREATED_ON = "created_on";
	private static final String CREATED_BY = "created_by";
	private static final String FILE_NAME = "file_name";
	private static final String TASK_ID = "task_id";
	private static final String FILE_TYPE = "file_type";
	private static final String BOARD_NAME = "taskboardName";

	@Autowired
	private TaskboardTaskFilesRepository taskboardTaskFilesRepository;

	@Autowired
	private UserService userService;

	protected Pageable getPageable(PaginationVO vo, boolean hasFilter) {
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

	private AttachmentsListVo constructAttachmentsListVo(TaskboardTaskFiles taskboardTaskFiles) {
		return AttachmentsListVo.builder().attachmentsId(taskboardTaskFiles.getId())
				.createdBy(taskboardTaskFiles.getCreatedBy()).createdOn(taskboardTaskFiles.getCreatedOn())
				.fileName(taskboardTaskFiles.getFileName()).fileType(taskboardTaskFiles.getFileType())
				.taskboardName(taskboardTaskFiles.getTaskboardTask().getTaskboard().getName())
				.taskId(taskboardTaskFiles.getTaskboardTask().getTaskId())
				.taskboardKey(taskboardTaskFiles.getTaskboardTask().getTaskboard().getTaskboardKey())
				.taskboardId(taskboardTaskFiles.getTaskboardTask().getTaskboard().getId()).build();
	}

	private BoardNameVo constructBoardNameVo(Taskboard taskboard) {
		return BoardNameVo.builder().boardName(taskboard.getName()).taskBoardId(taskboard.getId()).build();
	}

	@Transactional
	public AttachmentsVo getBoardNames() {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		List<TaskboardTaskFiles> taskboardTaskFilesList = taskboardTaskFilesRepository.getTaskboardAttachments(
				userVO.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		Set<BoardNameVo> boardNameList = taskboardTaskFilesList.stream()
				.map(t -> constructBoardNameVo(t.getTaskboardTask().getTaskboard())).collect(Collectors.toSet());
		return AttachmentsVo.builder().boardNameList(boardNameList).build();
	}

	@Transactional
	public AttachmentsVo getTaskboardAttachments(PaginationVO vo) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		Pageable pageable = getPageable(vo, false);
		List<AttachmentsListVo> attachmentsList = new ArrayList<>();
		List<String> boardNameList = new ArrayList<>();
		List<AttachmentsListVo> attachmentsFilterList = new ArrayList<>();
		List<TaskboardTaskFiles> taskboardTaskFilesList = taskboardTaskFilesRepository
				.getTaskboardAttachmentsBasedOnPagination(userVO.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
		if (taskboardTaskFilesList != null) {
			attachmentsList = taskboardTaskFilesList.stream().map(this::constructAttachmentsListVo)
					.collect(Collectors.toList());
		}
		int count = taskboardTaskFilesRepository.getTaskboardAttachmentsCountBasedOnPagination(userVO.getUserId(),
				userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (vo.getFilterValue() != null && vo.getFilterValue().length != 0) {
			for (FilterValueVO fValue : vo.getFilterValue()) {
				if (StringUtils.equals(fValue.getFilterIdColumn(), BOARD_NAME)) {
					boardNameList.add(fValue.getFilterIdColumnValue());
				}
			}
			if (!boardNameList.isEmpty()) {
				attachmentsList = attachmentsList.stream().filter(f -> (boardNameList.contains(f.getTaskboardName())))
						.collect(Collectors.toList());
			}
			return getAttachmentsByFilterArray(vo, attachmentsList, attachmentsFilterList);
		} else {
			return AttachmentsVo.builder().attachmentsList(attachmentsList).totalRecords(String.valueOf(count)).build();
		}
	}

	@Transactional
	private AttachmentsVo getAttachmentsByFilterArray(PaginationVO pagination, List<AttachmentsListVo> attachmentsList,
			List<AttachmentsListVo> attachmentsFilterList) {
		int pageNumber = pagination.getIndex();
		int pageSize = pagination.getSize() > 0 ? pagination.getSize() : 10;
		int skipRecords = pageNumber * pageSize;

		int count = 0;
		for (AttachmentsListVo attachmentsListVo : attachmentsList) {
			if (doesMatchesFilterValueForAttachments(attachmentsListVo, pagination.getFilterValue())) {
				count++;
				if (count > skipRecords && count <= (skipRecords + pageSize)) {
					attachmentsFilterList.add(attachmentsListVo);
				}
			}
		}
		return AttachmentsVo.builder().attachmentsList(attachmentsFilterList).totalRecords(String.valueOf(count))
				.build();
	}

	private boolean doesMatchesFilterValueForAttachments(AttachmentsListVo filterField,
			FilterValueVO[] currentFilterList) {
		boolean isMatched = true;
		for (FilterValueVO filterValue : currentFilterList) {
			if (!StringUtils.isEmpty(filterValue.getFilterIdColumn())) {
				if (StringUtils.equalsAny(filterValue.getFilterIdColumn(), CREATED_BY, CREATED_ON, TASK_ID, FILE_NAME,
						FILE_TYPE)) {
					if (StringUtils.equals(filterValue.getFilterIdColumn(), FILE_TYPE)) {
						String value = filterField.getFileType();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					} else if (StringUtils.equals(filterValue.getFilterIdColumn(), CREATED_BY)) {
						String value = filterField.getCreatedBy();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					} else if (StringUtils.equals(filterValue.getFilterIdColumn(), TASK_ID)) {
						String value = filterField.getTaskId();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					} else if (StringUtils.equals(filterValue.getFilterIdColumn(), FILE_NAME)) {
						String value = filterField.getFileName();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					} else {
						LocalDateTime dateValue = null;
						DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
						if (StringUtils.equals(filterValue.getFilterIdColumn(), CREATED_ON)) {
							dateValue = filterField.getCreatedOn().toLocalDateTime();
							if (dateValue.toString().length() < 20) {
								LocalDate localDate = dateValue.toLocalDate();
								dateValue = localDate.plusDays(1).atStartOfDay();
							}
							dateValue = LocalDateTime.parse(dateValue.toString().subSequence(0, 16), formatter);
						} else {
							isMatched = false;
							break;
						}
						if (dateValue != null) {
							isMatched = FilterUtils.getDateValue(dateValue.toLocalDate(), filterValue, isMatched);
						}
					}
				}
			}
		}

		return isMatched;
	}

	private List<UUID> getGroupAsUUID(UsersVO userVO) {
		List<GroupVO> listGroupVO = userVO.getGroupVOList();

		if (listGroupVO.isEmpty()) {
			return java.util.Collections.emptyList();
		}

		return listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
	}
}
