package com.yorosis.yoroflow.services;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.Group;
import com.yorosis.yoroflow.entities.Taskboard;
import com.yorosis.yoroflow.entities.TaskboardColumns;
import com.yorosis.yoroflow.entities.TaskboardLaunchPermission;
import com.yorosis.yoroflow.entities.TaskboardTask;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.GroupVO;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.TaskboardTaskVO;
import com.yorosis.yoroflow.models.TaskboardVO;
import com.yorosis.yoroflow.models.UsersVO;
import com.yorosis.yoroflow.models.taskboard.LaunchPermissionVo;
import com.yorosis.yoroflow.models.taskboard.LaunchTaskListVo;
import com.yorosis.yoroflow.models.taskboard.LaunchTaskboardTaskVo;
import com.yorosis.yoroflow.repository.GroupRepository;
import com.yorosis.yoroflow.repository.TaskboardLaunchPermissionRepository;
import com.yorosis.yoroflow.repository.TaskboardRepository;
import com.yorosis.yoroflow.repository.TaskboardTaskRepository;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.repository.WorkspaceRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class TaskboardLaunchPermissionService {

	@Autowired
	private TaskboardLaunchPermissionRepository taskboardLaunchPermissionRepository;

	@Autowired
	private GroupRepository groupRepository;

	@Autowired
	private UsersRepository usersRepository;

	@Autowired
	private TaskboardRepository taskboardRepository;

	@Autowired
	private TaskboardTaskRepository taskboardTaskRepository;

	@Autowired
	private WorkspaceRepository workspaceRepository;

	@Autowired
	private UserService userService;

	private TaskboardLaunchPermission constructTaskboardLaunchPermissionDtotoVo(LaunchPermissionVo launchPermissionVo) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		return TaskboardLaunchPermission.builder().activeFlag(YorosisConstants.YES)
				.tenantId(YorosisContext.get().getTenantId())
				.allowLoggedInUser(booleanToChar(launchPermissionVo.getAllowLoggedInUser()))
				.allowWorkspaceUsers(booleanToChar(launchPermissionVo.getAllowWorkspaceUsers()))
				.allowTaskboardUser(booleanToChar(launchPermissionVo.getAllowTaskboardUser()))
				.allowTaskboardTeams(booleanToChar(launchPermissionVo.getAllowTaskboardTeams()))
				.createdBy(YorosisContext.get().getUserName()).createdOn(currentTimestamp)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(currentTimestamp).build();
	}

	private LaunchPermissionVo constructTaskboardLaunchPermissionDtotoVo(
			TaskboardLaunchPermission taskboardLaunchPermission) {
		return LaunchPermissionVo.builder().taskboardId(taskboardLaunchPermission.getTaskboard().getId())
				.allowLoggedInUser(charToBoolean(taskboardLaunchPermission.getAllowLoggedInUser()))
				.allowWorkspaceUsers(charToBoolean(taskboardLaunchPermission.getAllowWorkspaceUsers()))
				.allowTaskboardUser(charToBoolean(taskboardLaunchPermission.getAllowTaskboardUser()))
				.allowTaskboardTeams(charToBoolean(taskboardLaunchPermission.getAllowTaskboardTeams())).build();
	}

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

	@Transactional
	public ResponseStringVO saveAndUpdateTaskboardLaunchPermission(LaunchPermissionVo launchPermissionVo) {
		String response = null;
		if (launchPermissionVo != null) {
			TaskboardLaunchPermission taskboardLaunchPermission = constructTaskboardLaunchPermissionDtotoVo(
					launchPermissionVo);
			List<TaskboardLaunchPermission> taskboardLaunchPermissionList = new ArrayList<>();
			Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
					launchPermissionVo.getTaskboardId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (taskboard != null) {
				List<TaskboardLaunchPermission> taskboardLaunchPermissionListByTaskboard = taskboardLaunchPermissionRepository
						.getTaskboardLaunchPermissionListByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
								YorosisContext.get().getTenantId(), YorosisConstants.YES,
								launchPermissionVo.getTaskboardId());
				if (taskboardLaunchPermissionListByTaskboard != null
						&& !taskboardLaunchPermissionListByTaskboard.isEmpty()) {
					taskboardLaunchPermissionRepository.deleteAll(taskboardLaunchPermissionListByTaskboard);
					response = "Launch Permission updated successfully";
				} else {
					response = "Launch Permission saved successfully";
				}
				if ((launchPermissionVo.getAllowLoggedInUser() != null
						&& BooleanUtils.isTrue(launchPermissionVo.getAllowLoggedInUser()))
						|| (launchPermissionVo.getAllowWorkspaceUsers() != null
								&& BooleanUtils.isTrue(launchPermissionVo.getAllowWorkspaceUsers()))
						|| (launchPermissionVo.getAllowTaskboardUser() != null
								&& BooleanUtils.isTrue(launchPermissionVo.getAllowTaskboardUser()))
						|| (launchPermissionVo.getAllowTaskboardTeams() != null
								&& BooleanUtils.isTrue(launchPermissionVo.getAllowTaskboardTeams()))) {
					taskboardLaunchPermission.setTaskboard(taskboard);
					taskboardLaunchPermissionList.add(taskboardLaunchPermission);
				}
				if (launchPermissionVo.getAllowTeamsList() != null
						&& !launchPermissionVo.getAllowTeamsList().isEmpty()) {
					List<Group> groupList = groupRepository.getGroupListByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							launchPermissionVo.getAllowTeamsList());
					if (groupList != null && !groupList.isEmpty()) {
						groupList.stream().forEach(g -> {
							TaskboardLaunchPermission launchPermission = constructTaskboardLaunchPermissionDtotoVo(
									launchPermissionVo);
							launchPermission.setYoroGroups(g);
							launchPermission.setTaskboard(taskboard);
							taskboardLaunchPermissionList.add(launchPermission);
						});
					}
				}
				if (launchPermissionVo.getAllowUsersList() != null
						&& !launchPermissionVo.getAllowUsersList().isEmpty()) {
					List<User> userList = usersRepository.findUsersByID(launchPermissionVo.getAllowUsersList(),
							YorosisContext.get().getTenantId());
					if (userList != null && !userList.isEmpty()) {
						userList.stream().forEach(u -> {
							TaskboardLaunchPermission launchPermission = constructTaskboardLaunchPermissionDtotoVo(
									launchPermissionVo);
							launchPermission.setUsers(u);
							launchPermission.setTaskboard(taskboard);
							taskboardLaunchPermissionList.add(launchPermission);
						});
					}
				}
				taskboardLaunchPermissionRepository.saveAll(taskboardLaunchPermissionList);
			}
		}
		return ResponseStringVO.builder().response(response).build();
	}

	@Transactional
	public LaunchPermissionVo getTaskboardLaunchPermission(UUID taskboardId) {
		List<TaskboardLaunchPermission> taskboardLaunchPermissionListByTaskboard = taskboardLaunchPermissionRepository
				.getTaskboardLaunchPermissionListByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
						YorosisContext.get().getTenantId(), YorosisConstants.YES, taskboardId);
		if (taskboardLaunchPermissionListByTaskboard != null && !taskboardLaunchPermissionListByTaskboard.isEmpty()) {
			LaunchPermissionVo LaunchPermissionVo = constructTaskboardLaunchPermissionDtotoVo(
					taskboardLaunchPermissionListByTaskboard.get(0));
			List<UUID> groupIDList = new ArrayList<>();
			List<UUID> userIDList = new ArrayList<>();
			taskboardLaunchPermissionListByTaskboard.stream().filter(g -> g.getYoroGroups() != null).forEach(g -> {
				groupIDList.add(g.getYoroGroups().getGroupId());
			});
			taskboardLaunchPermissionListByTaskboard.stream().filter(u -> u.getUsers() != null).forEach(u -> {
				userIDList.add(u.getUsers().getUserId());
			});
			LaunchPermissionVo.setAllowTeamsList(groupIDList);
			LaunchPermissionVo.setAllowUsersList(userIDList);
			return LaunchPermissionVo;
		}
		return LaunchPermissionVo.builder().build();
	}

	@Transactional
	public List<TaskboardVO> getTaskboardByLaunch(String workspaceId) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		List<TaskboardVO> taskboardVOList = new ArrayList<>();
		List<Taskboard> taskboardList = taskboardRepository.getTaskboardListByLaunch(userVO.getUserId(),
				userGroupIdsList, getWorkspace(workspaceId), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardList != null && !taskboardList.isEmpty()) {
			taskboardVOList = taskboardList.stream().map(this::loadTaskBoardVo).collect(Collectors.toList());
		}
		return taskboardVOList;
	}

	private List<UUID> getWorkspace(String workspaceId) {
		List<UUID> workspaceIdList = new ArrayList<>();
		if (StringUtils.equals(workspaceId, "all")) {
			workspaceIdList = getAllWorkpace();
		} else {
			workspaceIdList.add(UUID.fromString(workspaceId));
		}
		return workspaceIdList;
	}

	private List<UUID> getAllWorkpace() {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		return workspaceRepository.getListBasedonTenantIdAndActiveFlag(YorosisContext.get().getTenantId(),
				YorosisConstants.YES, userVO.getUserId(), userGroupIdsList);
	}

	private List<UUID> getWorkspace(PaginationVO pagination, UUID workspaceId) {
		List<UUID> workspaceIdList = new ArrayList<>();
		if (BooleanUtils.isTrue(pagination.getAllWorkspace())) {
			workspaceIdList = getAllWorkpace();
		} else {
			workspaceIdList.add(workspaceId);
		}
		return workspaceIdList;
	}

	private TaskboardVO loadTaskBoardVo(Taskboard taskboard) {
		TaskboardColumns taskboardColumns = taskboard.getTaskboardColumns().stream()
				.filter(c -> StringUtils.equals(String.valueOf(c.getColumnOrder()), "0")).collect(Collectors.toList())
				.get(0);

		return TaskboardVO.builder().name(taskboard.getName()).description(taskboard.getDescription())
				.taskName(taskboard.getTaskName()).taskboardKey(taskboard.getTaskboardKey()).id(taskboard.getId())
				.generatedTaskId(taskboard.getGeneratedTaskId()).startColumn(taskboardColumns.getColumnName())
				.formId(taskboardColumns.getFormId()).version(taskboardColumns.getVersion())
				.sprintEnabled(charToBoolean(taskboard.getSprintEnabled()))
				.launchButtonName(taskboard.getLaunchButtonName()).build();
	}

	@Transactional
	public LaunchTaskboardTaskVo getTaskboardTaskListByLaunch(PaginationVO vo, UUID workspaceId) {
		List<LaunchTaskListVo> taskboardTaskListVo = new ArrayList<>();
		Pageable pageable = getPageable(vo, true);
		Integer count = 0;
		List<UUID> workspaceIdList = getWorkspace(vo, workspaceId);
		List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.getTaskboardTasksForLaunch(
				YorosisContext.get().getUserName(), workspaceIdList, YorosisContext.get().getTenantId(),
				YorosisConstants.YES, pageable);
		count = taskboardTaskRepository.getTaskboardTasksForLaunchCount(YorosisContext.get().getUserName(),
				workspaceIdList, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
			taskboardTaskListVo = taskboardTaskList.stream().map(this::constructTaskboardTaskVo)
					.collect(Collectors.toList());
		}
		return LaunchTaskboardTaskVo.builder().totalRecords(count).taskVOList(taskboardTaskListVo).build();
	}

	private LaunchTaskListVo constructTaskboardTaskVo(TaskboardTask taskboardTask) {
		return LaunchTaskListVo.builder().reqName(taskboardTask.getTaskName()).status(taskboardTask.getStatus())
				.submittedDate(taskboardTask.getCreatedOn().toLocalDateTime()).taskboardTaskId(taskboardTask.getId())
				.build();
	}

	public List<UUID> getGroupAsUUID(UsersVO userVO) {
		List<GroupVO> listGroupVO = userVO.getGroupVOList();

		if (listGroupVO.isEmpty()) {
			return java.util.Collections.emptyList();
		}

		return listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
	}

	private String booleanToChar(Boolean value) {
		return BooleanUtils.isTrue(value) ? YorosisConstants.YES : YorosisConstants.NO;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YorosisConstants.YES, value);
	}

}
