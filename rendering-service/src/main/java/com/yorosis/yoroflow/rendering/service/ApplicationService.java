package com.yorosis.yoroflow.rendering.service;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Timestamp;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.yorosis.yoroapps.entities.Application;
import com.yorosis.yoroapps.entities.ApplicationPermissions;
import com.yorosis.yoroapps.vo.ApplicationVO;
import com.yorosis.yoroapps.vo.ApplicationVO.ApplicationVOBuilder;
import com.yorosis.yoroapps.vo.GroupVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.exception.YoroappsException;
import com.yorosis.yoroflow.rendering.repository.ApplicationRepository;
import com.yorosis.yoroflow.rendering.repository.ThemesRepository;
import com.yorosis.yoroflow.rendering.service.vo.ApplicationDetailsVO;
import com.yorosis.yoroflow.rendering.service.vo.ApplicationListVO;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class ApplicationService {

	@Autowired
	private ApplicationRepository applicationRepository;

	@Autowired
	private ThemesRepository themesRepository;

	@Autowired
	private UserService userService;

	@Autowired
	private FileManagerService fileManagerService;

	@Transactional
	public String getApplicationPrefix(UUID applicationId) {
		return applicationRepository.findByIdAndActiveFlagIgnoreCaseAndTenantId(applicationId, YoroappsConstants.YES,
				YorosisContext.get().getTenantId()).getAppPrefix();
	}

	private Application constructApplicationVOToDTO(ApplicationVO applicationVo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return Application.builder().appName(applicationVo.getApplicationName())
				.description(applicationVo.getDescription()).applicationId(applicationVo.getApplicationId())
				.timezone(applicationVo.getTimezone()).defaultLanguge(applicationVo.getDefaultLanguage())
				.appPrefix(getApplicationPrefix()).tenantId(YorosisContext.get().getTenantId())
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.themeId(applicationVo.getThemeId()).activeFlag(YoroappsConstants.YES).managedFlag(YoroappsConstants.NO)
				.build();

	}

	private ApplicationVO constructApplicationDTOToVO(Application application) throws IOException {
		ApplicationVOBuilder applicationVOBuilder = ApplicationVO.builder();
//		if (StringUtils.isNotBlank(application.getLogo())) {
//			applicationVOBuilder.logo("data:image/jpeg;base64,"
//					+ Base64.getEncoder().encodeToString(fileManagerService.downloadFile(application.getLogo())));
//		}

		applicationVOBuilder.id(application.getId()).applicationName(application.getAppName())
				.description(application.getDescription()).defaultLanguage(application.getDefaultLanguge())
				.applicationId(application.getApplicationId()).timezone(application.getTimezone())
				.themeId(application.getThemeId()).leftMenuId(application.getLeftMenuId())
				.rightMenuId(application.getRightMenuId()).bottomMenuId(application.getBottomMenuId())
				.topMenuId(application.getTopMenuId()).build();
		return applicationVOBuilder.build();
	}

	@Transactional
	public ApplicationVO getApplicationInfo(String applicationId) throws YoroappsException, IOException {
		Application application = applicationRepository.findByApplicationIdIgnoreCaseAndActiveFlagIgnoreCaseAndTenantId(
				applicationId, YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (application == null) {
			throw new YoroappsException("There is no application for this id");
		}
		ApplicationVO applicationVO = constructApplicationDTOToVO(application);
		applicationVO.setImage(getApplicationProfilePicture(application));
		if (StringUtils.isNotBlank(application.getThemeId())) {
			applicationVO.setThemeName(
					themesRepository.findByThemeIdAndActiveFlagAndTenantIdIgnoreCase(application.getThemeId(),
							YoroappsConstants.YES, YorosisContext.get().getTenantId()).getThemeName());
		}
		return applicationVO;
	}

	@Transactional
	public ResponseStringVO checkSubdomainName(String applicationId) {
		String message = null;
		Application application = applicationRepository.findByApplicationIdIgnoreCaseAndActiveFlagIgnoreCaseAndTenantId(
				applicationId, YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (application != null) {
			message = "Application Identifier " + applicationId + " already exists";
		} else {
			message = "Application Identifier " + applicationId + " not exists";
		}
		return ResponseStringVO.builder().response(message).build();
	}

	@Transactional
	public ResponseStringVO saveApplication(ApplicationVO applicationVO, MultipartFile file, UUID workspace) throws IOException {
		Application application = null;
		String message = null;
		if (applicationVO.getId() == null) {

			application = constructApplicationVOToDTO(applicationVO);
			application.setWorkspaceId(workspace);
			message = String.format("Application [%s] created successfully", applicationVO.getApplicationName());
		} else {
			application = applicationRepository.getOne(applicationVO.getId());

			application.setAppName(applicationVO.getApplicationName());
			application.setApplicationId(applicationVO.getApplicationId());
			application.setThemeId(applicationVO.getThemeId());
			application.setTimezone(applicationVO.getTimezone());
			application.setDefaultLanguge(applicationVO.getDefaultLanguage());
			application.setDescription(applicationVO.getDescription());
			application.setModifiedBy(YorosisContext.get().getTenantId());
			application.setModifiedOn(new Timestamp(System.currentTimeMillis()));
			message = String.format("Application [%s] updated successfully", applicationVO.getApplicationName());
		}
		if (file != null) {
			saveOrUpdateApplicationLogo(file, application);
		}
		applicationRepository.save(application);

		return ResponseStringVO.builder().response(message).build();
	}

	private void saveOrUpdateApplicationLogo(MultipartFile file, Application application) throws IOException {
		try (InputStream inputStream = file.getInputStream()) {
			String imageKey = new StringBuilder("user-profile/").append(application.getApplicationId().toString())
					.append(LocalTime.now()).toString();
			fileManagerService.uploadFile(imageKey, file.getInputStream(), file.getSize());
			application.setLogo(imageKey);
		}
	}

	@Transactional
	public ResponseStringVO checkApplicationName(String applicationName) {
		String message = null;
		Application application = applicationRepository.findByAppNameIgnoreCaseAndActiveFlagIgnoreCaseAndTenantId(
				applicationName.trim(), YoroappsConstants.YES, YorosisContext.get().getTenantId());

		if (application != null) {
			message = "Application " + applicationName + " already exists";
		} else {
			message = "Application " + applicationName + " not exists";
		}

		return ResponseStringVO.builder().response(message).build();
	}

	private String getApplicationPrefix() {
		while (true) {
			String prefix = RandomStringUtils.random(4, "abcdefghijklmnopqrstuvwxyz");
			Application app = applicationRepository.findByTenantIdAndAppPrefixIgnoreCaseAndActiveFlagIgnoreCase(
					YorosisContext.get().getTenantId(), prefix, YoroappsConstants.YES);
			if (app == null || app.getId() == null) {
				return prefix;
			}
		}
	}

	@Transactional
	public List<ApplicationVO> getApplicationsList(UUID workspaceId) throws IOException {
		List<ApplicationVO> applicationVoList = new ArrayList<>();

		for (Application applicationId : applicationRepository.getApplicationIdList(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES, YoroappsConstants.NO, workspaceId)) {
			ApplicationVO vo = constructApplicationDTOToVO(applicationId);
//			checkPermission(applicationId, vo);
			applicationVoList.add(vo);
		}
		return applicationVoList;
	}

	@Transactional
	public List<ApplicationVO> checkPermission(ApplicationListVO applicationListVO) throws IOException {

		for (ApplicationVO vo : applicationListVO.getApplicationList()) {
			List<UUID> uuidList = userService.getLoggedInUserDetails().getGroupVOList().stream()
					.map(GroupVO::getGroupId).collect(Collectors.toList());
			Application application = applicationRepository
					.findByApplicationIdIgnoreCaseAndActiveFlagIgnoreCaseAndTenantId(vo.getApplicationId(),
							YoroappsConstants.YES, YorosisContext.get().getTenantId());
			Set<ApplicationPermissions> applicationPermissions = application.getApplicationPermissions();
			uuidList.stream()
					.forEach(uuid -> applicationPermissions.stream()
							.filter(s -> StringUtils.equalsIgnoreCase(s.getEditAllowed(), YoroappsConstants.YES)
									&& StringUtils.equals(uuid.toString(), s.getYoroGroups().getId().toString()))
							.findFirst().ifPresent(s -> vo.setCanEdit(true)));

			uuidList.stream()
					.forEach(uuid -> applicationPermissions.stream()
							.filter(s -> StringUtils.equalsIgnoreCase(s.getLaunchAllowed(), YoroappsConstants.YES)
									&& StringUtils.equals(uuid.toString(), s.getYoroGroups().getId().toString()))
							.findFirst().ifPresent(s -> vo.setCanLaunch(true)));

			uuidList.stream()
					.forEach(uuid -> applicationPermissions.stream()
							.filter(s -> StringUtils.equalsIgnoreCase(s.getDeleteAllowed(), YoroappsConstants.YES)
									&& StringUtils.equals(uuid.toString(), s.getYoroGroups().getId().toString()))
							.findFirst().ifPresent(s -> vo.setCanDelete(true)));
		}
		return applicationListVO.getApplicationList();
	}

//	private List<UUID> getGroupAsUUID(UsersVO userVO) {
//		List<GroupVO> listGroupVO = userVO.getGroupVOList();
//		if (Collections.isEmpty(listGroupVO)) {
//			return java.util.Collections.emptyList();
//		}
//		return listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
//	}

	public ResponseStringVO deleteApplicationInfo(String applicationName) {
		String message = null;
		Application application = applicationRepository.findByAppNameIgnoreCaseAndActiveFlagIgnoreCaseAndTenantId(
				applicationName.trim(), YoroappsConstants.YES, YorosisContext.get().getTenantId());

		if (application != null) {
			message = "Application[ " + applicationName + " ]deleted successfully";
			application.setActiveFlag(YoroappsConstants.NO);
			applicationRepository.save(application);
		} else {
			message = " Application does not exists";
		}

		return ResponseStringVO.builder().response(message).build();
	}

//	public ResponseStringVO getApplicationLogo(String applicationId) throws IOException {
//		Application application = applicationRepository.findByApplicationIdIgnoreCaseAndActiveFlagIgnoreCaseAndTenantId(
//				applicationId, YoroappsConstants.YES, YorosisContext.get().getTenantId());
//		String response = null;
//		if (application != null && application.getLogo() != null && StringUtils.isNotBlank(application.getLogo())) {
//			response = Base64.getEncoder().encodeToString(fileManagerService.downloadFile(application.getLogo()));
//		}
//		return ResponseStringVO.builder().response(response).build();
//
//	}

	@Transactional
	public List<ApplicationDetailsVO> getApplicationLogo(ApplicationListVO applicationIdListVO) throws IOException {
		List<ApplicationDetailsVO> appDetailsList = new ArrayList<>();
		for (String appId : applicationIdListVO.getApplicationIdList()) {
			Application application = applicationRepository
					.findByApplicationIdIgnoreCaseAndActiveFlagIgnoreCaseAndTenantId(appId, YoroappsConstants.YES,
							YorosisContext.get().getTenantId());
			appDetailsList.add(ApplicationDetailsVO.builder().applicationId(application.getApplicationId())
					.logo(getApplicationProfilePicture(application)).build());
		}
		return appDetailsList;

	}

	private String getApplicationProfilePicture(Application application) throws IOException {
		String profile = null;
		if (StringUtils.isNotBlank(application.getLogo())) {
			profile = "data:image/jpeg;base64,"
					+ Base64.getEncoder().encodeToString(fileManagerService.downloadFile(application.getLogo()));
		} else {
			profile = application.getLogo();
		}
		return profile;
	}

	@Transactional
	public ResponseStringVO checkApplicationCount(UUID workspaceId) {
		int count = applicationRepository.getApplicationCount(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES, workspaceId);
		return ResponseStringVO.builder().count(count).build();
	}

}
