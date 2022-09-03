package com.yorosis.yoroflow.services.docs;

import java.io.IOException;
import java.sql.Timestamp;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.ReactiveOrInactiveUsers;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroapps.vo.YorDocsNamesVo;
import com.yorosis.yoroflow.entities.YoroDocuments;
import com.yorosis.yoroflow.entities.YoroDocumentsSecurity;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.FileUploadVO;
import com.yorosis.yoroflow.models.GroupVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.UsersVO;
import com.yorosis.yoroflow.models.docs.SecurityVO;
import com.yorosis.yoroflow.models.docs.TeamSecurityTypeVo;
import com.yorosis.yoroflow.models.docs.YoroDocumentVO;
import com.yorosis.yoroflow.models.docs.YoroDocumentsVo;
import com.yorosis.yoroflow.models.docs.YoroSecurityDetailsVO;
import com.yorosis.yoroflow.repository.GroupRepository;
import com.yorosis.yoroflow.repository.UserGroupRepository;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.repository.YoroDocumentRepository;
import com.yorosis.yoroflow.repository.YoroDocumentsSecurityRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.services.FileManagerService;
import com.yorosis.yoroflow.services.NotificationsService;
import com.yorosis.yoroflow.services.ProxyYoroflowSchemaService;
import com.yorosis.yoroflow.services.UserService;

@Service
public class YoroDocumentService {

	@Autowired
	private YoroDocumentRepository yoroDocumentRepository;

	@Autowired
	private FileManagerService fileManagerService;

	@Autowired
	private UserService userService;

	@Autowired
	private GroupRepository groupRepository;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private UserGroupRepository userGroupRepository;

	@Autowired
	private YoroDocumentsSecurityRepository YoroDocumentsSecurityRepository;

	@Autowired
	private NotificationsService notificationsService;

	@Autowired
	private ProxyYoroflowSchemaService proxyService;

	public static final PolicyFactory IMAGES = new HtmlPolicyBuilder().allowAttributes("src").onElements("img")
			.allowUrlProtocols("http", "https", "data").allowElements("img").toFactory();

	public static final PolicyFactory VIDEOS = new HtmlPolicyBuilder().allowAttributes("src").onElements("iframe")
			.allowUrlProtocols("http", "https").allowElements("iframe").toFactory();

	private YoroDocuments construcVOtoDTO(YoroDocumentVO yoroDocumentVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return YoroDocuments.builder().modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.parentDocumentId(yoroDocumentVO.getParentDocumentId()).documentKey(yoroDocumentVO.getDocumentKey())
				.documentName(yoroDocumentVO.getDocumentName()).tenantId(YorosisContext.get().getTenantId())
				.activeFlag(YorosisConstants.YES).build();
	}

	private String checkSafeString(MultipartFile documentData) throws IOException {
		PolicyFactory policy = Sanitizers.FORMATTING.and(Sanitizers.LINKS).and(Sanitizers.BLOCKS).and(IMAGES)
				.and(VIDEOS).and(Sanitizers.STYLES).and(Sanitizers.TABLES).and(Sanitizers.FORMATTING);
		String data = new String(documentData.getBytes());
		return policy.sanitize(data);
	}

	@Transactional
	public ResponseStringVO saveAndUpdateDocs(YoroDocumentVO yoroDocumentVO, MultipartFile documentData,
			UUID workspaceId) throws IOException {
		String currentTenantId = YorosisContext.get().getTenantId();

		LicenseVO licenseVO = proxyService.isAllowed(currentTenantId, "general", "documents");

		Long allDocumentsCount = yoroDocumentRepository.getTotalDocumentsCount(currentTenantId, YorosisConstants.YES);

		if (allDocumentsCount < licenseVO.getAllowedLimit()) {
			if (yoroDocumentVO.getDocumentId() == null) {
				YoroDocuments yoroDocuments = construcVOtoDTO(yoroDocumentVO);
				if (documentData != null) {
					String safeHtml = checkSafeString(documentData);
					yoroDocuments.setDocumentData(
							saveDocumentData(yoroDocumentVO, documentData.getContentType(), safeHtml.getBytes()));
				}
				yoroDocuments.setWorkspaceId(workspaceId);
				yoroDocuments = yoroDocumentRepository.save(yoroDocuments);
				saveDefaultOwner(yoroDocuments);
				return ResponseStringVO.builder().id(yoroDocuments.getId()).response("Document Created successfully")
						.build();
			} else {
				YoroDocuments yoroDocuments = yoroDocumentRepository.getBasedonIdAndTenantIdAndActiveFlag(
						yoroDocumentVO.getDocumentId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
				if (yoroDocuments != null) {
					Timestamp timestamp = new Timestamp(System.currentTimeMillis());
					yoroDocuments.setWorkspaceId(workspaceId);
					yoroDocuments.setModifiedBy(YorosisContext.get().getUserName());
					yoroDocuments.setDocumentKey(yoroDocumentVO.getDocumentKey());
					yoroDocuments.setDocumentName(yoroDocumentVO.getDocumentName());
					if (documentData != null) {
						String safeHtml = checkSafeString(documentData);
						yoroDocuments.setDocumentData(
								saveDocumentData(yoroDocumentVO, documentData.getContentType(), safeHtml.getBytes()));
					}
					yoroDocuments.setModifiedOn(timestamp);
					yoroDocuments = yoroDocumentRepository.save(yoroDocuments);
					if (yoroDocumentVO.getMentionedUsersEmail() != null
							&& !yoroDocumentVO.getMentionedUsersEmail().isEmpty()) {
						notificationsService.handleDocumentsMentionNotifications(yoroDocuments, yoroDocumentVO);
					}
					return ResponseStringVO.builder().response("Document Updated successfully").build();
				}
			}
		} else {
			return ResponseStringVO.builder().response("Documents limit exceeded").build();
		}
		return ResponseStringVO.builder().build();
	}

	@Transactional
	public List<YoroDocumentsVo> getYoroDocsList(UUID workspaceId) throws IOException {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		List<YoroDocumentsVo> yoroDocumentVOList = new ArrayList<>();
		List<YoroDocuments> yoroDocumentsList = yoroDocumentRepository.getListTenantIdAndActiveFlag(
				YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId(), userGroupIdsList,
				workspaceId);
		if (!yoroDocumentsList.isEmpty()) {
			yoroDocumentsList.stream().forEach(y -> {
				yoroDocumentVOList.add(constructYoroDocs(y, userVO, userGroupIdsList));
			});
		}
		return yoroDocumentVOList;
	}

	@Transactional
	public List<YoroDocumentsVo> getYoroDocsLists(UUID workspaceId) throws IOException {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		List<YoroDocumentsVo> yoroDocumentVOList = new ArrayList<>();
		List<YoroDocuments> yoroDocumentsList = yoroDocumentRepository.getListTenantIdAndActiveFlags(
				YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId(), userGroupIdsList,
				workspaceId);
		if (!yoroDocumentsList.isEmpty()) {
			List<YoroDocumentsVo> yoroDocumentVoList = new ArrayList<>();
			yoroDocumentsList.stream().forEach(y -> {
				yoroDocumentVoList.add(buildAllDocs(y, userVO, userGroupIdsList));
			});
			yoroDocumentVoList.stream().forEach(y -> {
				YoroDocumentsVo yoroDocumentsVo = yoroDocumentVOListBUild(y, yoroDocumentVoList);
				if (yoroDocumentsVo != null && (yoroDocumentsVo.getParentDocumentId() == null)) {
					yoroDocumentVOList.add(yoroDocumentsVo);
				}
//				yoroDocumentVOList.add(yoroDocumentVOListBUild(y, yoroDocumentVoList));
			});
		}
		return yoroDocumentVOList;
	}

	private YoroDocumentsVo buildAllDocs(YoroDocuments yoroDocuments, UsersVO userVO, List<UUID> userGroupIdsList) {
		List<YoroDocumentsVo> yoroDocumentVOList = new ArrayList<>();
		return YoroDocumentsVo.builder().documentId(yoroDocuments.getId()).documentKey(yoroDocuments.getDocumentKey())
				.documentName(yoroDocuments.getDocumentName()).documentData(yoroDocuments.getDocumentData())
				.YoroDocumentsVo(yoroDocumentVOList).parentDocumentId(yoroDocuments.getParentDocumentId())
				.createdBy(yoroDocuments.getCreatedBy()).modifiedBy(yoroDocuments.getModifiedBy())
				.modifiedOn(yoroDocuments.getModifiedOn()).createdOn(yoroDocuments.getCreatedOn()).build();
	}

	private YoroDocumentsVo yoroDocumentVOListBUild(YoroDocumentsVo yoroDocumentsVo,
			List<YoroDocumentsVo> yoroDocumentVoList) {
		List<YoroDocumentsVo> yoroDocumentVOList = new ArrayList<>();
		yoroDocumentVoList.stream().forEach(y -> {
			if (y.getParentDocumentId() != null && yoroDocumentsVo.getDocumentId() != null && StringUtils
					.equals(yoroDocumentsVo.getDocumentId().toString(), y.getParentDocumentId().toString())) {
				yoroDocumentVOList.add(y);

//					yoroDocumentVOListBUild(y, yoroDocumentVOList);
			}
		});
		yoroDocumentsVo.setYoroDocumentsVo(yoroDocumentVOList);
		return yoroDocumentsVo;
	}

	private YoroDocumentsVo constructYoroDocs(YoroDocuments yoroDocuments, UsersVO userVO,
			List<UUID> userGroupIdsList) {
		List<YoroDocumentsVo> yoroDocumentVOList = new ArrayList<>();
		List<YoroDocuments> yoroDocumentsList = yoroDocumentRepository.getYoroDocsByParentComments(
				yoroDocuments.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId(),
				userGroupIdsList);
		if (yoroDocumentsList != null) {
			yoroDocumentsList.stream().forEach(y -> {
				yoroDocumentVOList.add(constructYoroDocs(y, userVO, userGroupIdsList));
			});
		}
		return YoroDocumentsVo.builder().documentId(yoroDocuments.getId()).documentKey(yoroDocuments.getDocumentKey())
				.documentName(yoroDocuments.getDocumentName()).documentData(yoroDocuments.getDocumentData())
				.YoroDocumentsVo(yoroDocumentVOList).parentDocumentId(yoroDocuments.getParentDocumentId())
				.createdBy(yoroDocuments.getCreatedBy()).modifiedBy(yoroDocuments.getModifiedBy())
				.modifiedOn(yoroDocuments.getModifiedOn()).createdOn(yoroDocuments.getCreatedOn()).build();
	}

	@Transactional
	public YoroSecurityDetailsVO getSecurity(UUID yorodocsId) {
		List<UUID> userIdListVo = new ArrayList<>();
		List<SecurityVO> groupSecurityVO = new ArrayList<>();
		List<UUID> groupIdList = new ArrayList<>();
		List<UUID> userIdList = new ArrayList<>();
		Boolean read = false;
		Boolean edit = false;
		if (yorodocsId != null) {
			UsersVO userVO = userService.getLoggedInUserDetails();
			List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
			List<UUID> userIDList = YoroDocumentsSecurityRepository.getListBasedonUserIdAndTenantIdAndActiveFlag(
					yorodocsId, YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (userIDList != null && !userIDList.isEmpty()) {
				userIdListVo = userIDList;
				if (userIDList.contains(userVO.getUserId())) {
					read = true;
					edit = true;
				}
			}
			List<YoroDocumentsSecurity> yoroDocumentsSecurityList = YoroDocumentsSecurityRepository
					.getListBasedonGroupIdAndTenantIdAndActiveFlag(yorodocsId, YorosisContext.get().getTenantId(),
							YorosisConstants.YES);
			if (yoroDocumentsSecurityList != null && !yoroDocumentsSecurityList.isEmpty()) {
				if (userGroupIdsList != null && !userGroupIdsList.isEmpty()) {
					groupIdList.addAll(userGroupIdsList);
				}
				for (YoroDocumentsSecurity ys : yoroDocumentsSecurityList) {
					groupSecurityVO.add(constructSecurityVo(ys));
					groupIdList.add(ys.getYoroGroups().getGroupId());
					if (userGroupIdsList.contains(ys.getYoroGroups().getGroupId())) {
						if (BooleanUtils.isFalse(edit)) {
							edit = charToBoolean(ys.getEditAllowed());
						}
						if (BooleanUtils.isFalse(read)) {
							read = charToBoolean(ys.getReadAllowed());
						}
					}
				}
				Set<UUID> userIdListSet = userGroupRepository.getUserIdByGroupIdList(groupIdList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				userIdList.addAll(userIdListSet);
			}
		}
		return YoroSecurityDetailsVO.builder().documentId(yorodocsId).yoroDocsOwner(userIdListVo)
				.securityVOList(groupSecurityVO).readAllowed(read).updateAllowed(edit).securityUserList(userIdList)
				.build();
	}

	private SecurityVO constructSecurityVo(YoroDocumentsSecurity yoroDocumentsSecurity) {
		return SecurityVO.builder().groupId(yoroDocumentsSecurity.getYoroGroups().getGroupId())
				.readAllowed(charToBoolean(yoroDocumentsSecurity.getReadAllowed()))
				.updateAllowed(charToBoolean(yoroDocumentsSecurity.getEditAllowed())).build();
	}

	@Transactional
	public ResponseStringVO saveSecurity(YoroSecurityDetailsVO yoroSecurityDetailsVO) {
		if (yoroSecurityDetailsVO != null) {
			YoroDocuments yoroDocuments = yoroDocumentRepository.getBasedonIdAndTenantIdAndActiveFlag(
					yoroSecurityDetailsVO.getDocumentId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (yoroDocuments != null) {
				saveOwners(yoroSecurityDetailsVO, yoroDocuments, true);
//				deleteTeamSecurity(yoroSecurityDetailsVO.getDeletedTeamsIdList(), yoroDocuments.getId());
//				saveTeamSecurity(yoroSecurityDetailsVO.getSecurityVOList(), yoroDocuments);
			}
			return ResponseStringVO.builder().response("Security updated successfully").build();
		}
		return ResponseStringVO.builder().build();
	}

	private void saveDefaultOwner(YoroDocuments yoroDocuments) {
		YoroDocumentsSecurity yoroDocumentsSecurity = constructSecurityVOtoDTO();
		yoroDocumentsSecurity.setReadAllowed(YorosisConstants.YES);
		yoroDocumentsSecurity.setEditAllowed(YorosisConstants.YES);
		yoroDocumentsSecurity.setYoroDocuments(yoroDocuments);
		yoroDocumentsSecurity
				.setUsers(userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
						YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YorosisConstants.YES));
		YoroDocumentsSecurityRepository.save(yoroDocumentsSecurity);
	}

	private void saveOwners(YoroSecurityDetailsVO yoroSecurityDetailsVO, YoroDocuments yoroDocuments,
			Boolean checkSecurity) {
		if (yoroSecurityDetailsVO != null && yoroSecurityDetailsVO.getYoroDocsOwner() != null
				&& !yoroSecurityDetailsVO.getYoroDocsOwner().isEmpty()) {
			yoroSecurityDetailsVO.getYoroDocsOwner().stream().forEach(ws -> {
				YoroDocumentsSecurity yoroDocumentsSecurity = constructSecurityVOtoDTO();
				yoroDocumentsSecurity.setReadAllowed(YorosisConstants.YES);
				yoroDocumentsSecurity.setEditAllowed(YorosisConstants.YES);
				yoroDocumentsSecurity.setYoroDocuments(yoroDocuments);
				yoroDocumentsSecurity.setUsers(userRepository.findByUserIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
						ws, YorosisContext.get().getTenantId(), YorosisConstants.YES));
				YoroDocumentsSecurityRepository.save(yoroDocumentsSecurity);
			});
		}
		if (yoroSecurityDetailsVO != null && yoroSecurityDetailsVO.getDeletedOwnerIdList() != null
				&& !yoroSecurityDetailsVO.getDeletedOwnerIdList().isEmpty()) {
			List<YoroDocumentsSecurity> yoroDocumentsSecurity = YoroDocumentsSecurityRepository
					.getListBasedonUserIdAndTenantIdAndActiveFlagForDelete(
							yoroSecurityDetailsVO.getDeletedOwnerIdList(), yoroDocuments.getId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (!yoroDocumentsSecurity.isEmpty()) {
				YoroDocumentsSecurityRepository.deleteAll(yoroDocumentsSecurity);
			}
		}
	}

	private void deleteTeamSecurity(List<UUID> deletedTeamIdList, UUID docId, String type) {
		if (deletedTeamIdList != null && !deletedTeamIdList.isEmpty()) {
			List<YoroDocumentsSecurity> yoroDocumentsSecurity = YoroDocumentsSecurityRepository
					.getListBasedonGroupIdAndWorkspaceIdTenantIdAndActiveFlag(deletedTeamIdList, docId,
							YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (!yoroDocumentsSecurity.isEmpty()) {
				if (StringUtils.equals(type, "update")) {
					yoroDocumentsSecurity.stream().forEach(u -> {
						u.setEditAllowed(YorosisConstants.NO);
					});
					YoroDocumentsSecurityRepository.saveAll(yoroDocumentsSecurity);
				} else {
					List<YoroDocumentsSecurity> deleteList = new ArrayList<YoroDocumentsSecurity>();
					yoroDocumentsSecurity.stream().forEach(r -> {
						if (!StringUtils.equals(r.getEditAllowed(), YorosisConstants.YES)) {
							deleteList.add(r);
						}
					});
					if (!deleteList.isEmpty()) {
						YoroDocumentsSecurityRepository.deleteAll(deleteList);
					}
				}
			}
		}
	}

	@Transactional
	public ResponseStringVO saveTeamSecurity(TeamSecurityTypeVo teamSecurityTypeVo) {
		if (teamSecurityTypeVo != null) {
			YoroDocuments yoroDocuments = yoroDocumentRepository.getBasedonIdAndTenantIdAndActiveFlag(
					teamSecurityTypeVo.getDocumentId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (yoroDocuments != null) {
				saveTeamSecurity(teamSecurityTypeVo.getSecurityVOList(), yoroDocuments, teamSecurityTypeVo.getType());
				deleteTeamSecurity(teamSecurityTypeVo.getDeletedTeamsIdList(), teamSecurityTypeVo.getDocumentId(),
						teamSecurityTypeVo.getType());
			}
			return ResponseStringVO.builder().response("Security updated successfully").build();
		}
		return ResponseStringVO.builder().build();
	}

	private void saveTeamSecurity(List<SecurityVO> securityVOList, YoroDocuments yoroDocuments, String type) {
		if (securityVOList != null && !securityVOList.isEmpty()) {
			List<YoroDocumentsSecurity> yoroDocumentsSecurityList = StringUtils.equals(type, "update")
					? YoroDocumentsSecurityRepository.getListBasedonGroupIdAndTenantIdAndActiveFlagForUpdate(
							yoroDocuments.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: YoroDocumentsSecurityRepository.getListBasedonGroupIdAndTenantIdAndActiveFlagForRead(
							yoroDocuments.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (yoroDocumentsSecurityList != null && !yoroDocumentsSecurityList.isEmpty()) {
				YoroDocumentsSecurityRepository.deleteAll(yoroDocumentsSecurityList);
			}
			List<YoroDocumentsSecurity> securityUUIDList = YoroDocumentsSecurityRepository
					.getListBasedonGroupIdAndTenantIdAndActiveFlag(yoroDocuments.getId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES);
			List<YoroDocumentsSecurity> yoroDocumentsSecurityListForSave = new ArrayList<>();
			List<UUID> addedUUIDList = new ArrayList<>();
			securityVOList.stream().forEach(yd -> {
				if (securityUUIDList != null && !securityUUIDList.isEmpty()) {
					securityUUIDList.stream().forEach(s -> {
						if (StringUtils.equals(s.getYoroGroups().getGroupId().toString(), yd.getGroupId().toString())) {
							if (StringUtils.equals(type, "update")) {
								s.setEditAllowed(booleanToChar(yd.getUpdateAllowed()));
								s.setReadAllowed(booleanToChar(yd.getReadAllowed()));
							} else {
								s.setReadAllowed(booleanToChar(yd.getReadAllowed()));
							}
							yoroDocumentsSecurityListForSave.add(s);
							addedUUIDList.add(yd.getGroupId());
						}
					});
				}
				if (addedUUIDList.isEmpty() || !addedUUIDList.contains(yd.getGroupId())) {
					YoroDocumentsSecurity yoroDocumentsSecurity = constructSecurityVOtoDTO();
					yoroDocumentsSecurity.setEditAllowed(booleanToChar(yd.getUpdateAllowed()));
					yoroDocumentsSecurity.setReadAllowed(booleanToChar(yd.getReadAllowed()));
					yoroDocumentsSecurity.setYoroDocuments(yoroDocuments);
					yoroDocumentsSecurity.setYoroGroups(groupRepository
							.findByGroupIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(
									yd.getGroupId(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
									YorosisConstants.NO));
					yoroDocumentsSecurityListForSave.add(yoroDocumentsSecurity);
				}
			});
			if (!yoroDocumentsSecurityListForSave.isEmpty()) {
				YoroDocumentsSecurityRepository.saveAll(yoroDocumentsSecurityListForSave);
			}
		}

	}

	private YoroDocumentsSecurity constructSecurityVOtoDTO() {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return YoroDocumentsSecurity.builder().modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YorosisConstants.YES).build();
	}

	@Transactional
	public ResponseStringVO deleteWorkspace(UUID docsId) {
		String message = null;
		List<YoroDocuments> yoroDocumentsListForDelete = new ArrayList<>();
		YoroDocuments yoroDocuments = yoroDocumentRepository.getBasedonIdAndTenantIdAndActiveFlag(docsId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (yoroDocuments != null) {
			yoroDocuments.setActiveFlag(YorosisConstants.NO);
			yoroDocumentsListForDelete.add(yoroDocuments);
			getYorodocsListForDelete(yoroDocumentsListForDelete, yoroDocuments.getId());
			yoroDocumentRepository.saveAll(yoroDocumentsListForDelete);
			message = "Document deleted successfully";
		} else {
			message = "Document does not exists";
		}
		return ResponseStringVO.builder().response(message).build();
	}

	private void getYorodocsListForDelete(List<YoroDocuments> yoroDocumentsListForDelete, UUID docsId) {
		List<YoroDocuments> yoroDocumentsList = yoroDocumentRepository.getBasedonParentIdAndTenantIdAndActiveFlag(
				docsId, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (yoroDocumentsList != null && !yoroDocumentsList.isEmpty()) {
			yoroDocumentsList.stream().forEach(y -> {
				y.setActiveFlag(YorosisConstants.NO);
				getYorodocsListForDelete(yoroDocumentsListForDelete, y.getId());
			});
			yoroDocumentsListForDelete.addAll(yoroDocumentsList);
		}
	}

	public byte[] getFile(UUID id) throws IOException {
		YoroDocuments yoroDocuments = yoroDocumentRepository.getBasedonIdAndTenantIdAndActiveFlag(id,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (yoroDocuments != null) {
			return fileManagerService.downloadFile(yoroDocuments.getDocumentData());
		}

		return null;
	}

	private String saveDocumentData(YoroDocumentVO yoroDocumentVO, String contentType, byte[] byteArray)
			throws IOException {
		String fileKey = new StringBuilder("yoro-docs/").append(yoroDocumentVO.getDocumentKey()).append(LocalTime.now())
				.toString();
		FileUploadVO fileUploadVO = FileUploadVO.builder().key(fileKey).contentSize(byteArray.length)
				.inputStream(byteArray).contentType(contentType).build();
		fileManagerService.saveUploadFile(fileUploadVO);
		return fileKey;
	}

	@Transactional
	public List<YorDocsNamesVo> getYoroDocsNamesList() {
		List<YorDocsNamesVo> workflowCountListVo = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> listUUID = getGroupAsUUID(userVO);
		List<Object[]> processDefinitionList = yoroDocumentRepository.getDocumentsCountByWorkspaceId(
				YorosisContext.get().getTenantId(), userVO.getUserId(), listUUID, YorosisConstants.YES);
		if (processDefinitionList != null) {
			workflowCountListVo = processDefinitionList.stream().map(this::constructYoroDocsNames)
					.collect(Collectors.toList());
		}
		return workflowCountListVo;
	}

	@Transactional
	public List<YorDocsNamesVo> getAllYoroDocsNamesList() {
		List<YorDocsNamesVo> workflowCountListVo = new ArrayList<>();
		List<Object[]> processDefinitionList = yoroDocumentRepository
				.getAllDocumentsCountByWorkspaceId(YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (processDefinitionList != null) {
			workflowCountListVo = processDefinitionList.stream().map(this::constructYoroDocsNames)
					.collect(Collectors.toList());
		}
		return workflowCountListVo;
	}

	@Transactional
	public ResponseStringVO saveInactiveUser(ReactiveOrInactiveUsers userId) {
		List<YoroDocumentsSecurity> yoroDocumentsSecurityList = YoroDocumentsSecurityRepository
				.getListBasedonUserIdAndTenantIdAndActiveFlag(userId.getUserIdList(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (!yoroDocumentsSecurityList.isEmpty() && !yoroDocumentsSecurityList.isEmpty()) {
			yoroDocumentsSecurityList.stream().forEach(y -> {
				y.setActiveFlag(YorosisConstants.NO);
			});
			YoroDocumentsSecurityRepository.saveAll(yoroDocumentsSecurityList);
		}
		return ResponseStringVO.builder().build();
	}

	@Transactional
	public ResponseStringVO saveReactiveUser(ReactiveOrInactiveUsers userId) {
		List<YoroDocumentsSecurity> yoroDocumentsSecurityList = YoroDocumentsSecurityRepository
				.getListBasedonUserIdAndTenantIdAndActiveFlag(userId.getUserIdList(),
						YorosisContext.get().getTenantId(), YorosisConstants.NO);
		if (!yoroDocumentsSecurityList.isEmpty() && !yoroDocumentsSecurityList.isEmpty()) {
			yoroDocumentsSecurityList.stream().forEach(y -> {
				y.setActiveFlag(YorosisConstants.YES);
			});
			YoroDocumentsSecurityRepository.saveAll(yoroDocumentsSecurityList);
		}
		return ResponseStringVO.builder().build();
	}

	private YorDocsNamesVo constructYoroDocsNames(Object[] taskboardNamesVo) {
		return YorDocsNamesVo.builder().workspaceId((UUID) taskboardNamesVo[0])
				.yoroDocsCount((long) taskboardNamesVo[1]).build();
	}

	private List<UUID> getGroupAsUUID(UsersVO userVO) {
		List<GroupVO> listGroupVO = userVO.getGroupVOList();

		if (listGroupVO.isEmpty()) {
			return java.util.Collections.emptyList();
		}

		return listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
	}

	private String booleanToChar(boolean value) {
		return value ? YorosisConstants.YES : YorosisConstants.NO;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YorosisConstants.YES, value);
	}

	public LicenseVO isAllowed() {
		String currentTenantId = YorosisContext.get().getTenantId();

		LicenseVO licenseVO = proxyService.isAllowed(currentTenantId, "general", "documents");

		Long allDocumentsCount = yoroDocumentRepository.getTotalDocumentsCount(currentTenantId, YorosisConstants.YES);

		if (allDocumentsCount < licenseVO.getAllowedLimit()) {
			licenseVO.setResponse("within the limit");
			return licenseVO;
		}
		licenseVO.setResponse("You have exceeded your limit");
		return licenseVO;
	}

	@Transactional
	public List<YoroDocumentsVo> getYoroDocsNamesAndWorkspaceNamesList() {
		List<YoroDocumentsVo> documentsList = new ArrayList<>();
		List<Object[]> documentAndWorkspaceNamesList = yoroDocumentRepository
				.getDocumentAndWorkspaceNamesList(YorosisContext.get().getTenantId(), YorosisConstants.YES);
		for (Object[] obj : documentAndWorkspaceNamesList) {
			UUID documentId = obj[0] != null ? UUID.fromString(obj[0].toString()) : null;
			String documentName = obj[1] != null ? obj[1].toString() : "";
			String workspaceName = obj[2] != null ? obj[2].toString() : "";
			YoroDocumentsVo yoroDocumentsVo = YoroDocumentsVo.builder().documentId(documentId)
					.documentName(
							StringUtils.isBlank(workspaceName) ? documentName : documentName + " - " + workspaceName)
					.build();
			documentsList.add(yoroDocumentsVo);
		}
		return documentsList;
	}

	@Transactional
	public ResponseStringVO inactivateDocs(SubscriptionExpireVO subscriptionExpireVO) {
		String response = null;
		List<YoroDocuments> documentsList = yoroDocumentRepository
				.getAllDocumentsList(YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (!documentsList.isEmpty() && documentsList.size() > 5) {
			List<YoroDocuments> pickedDocsList = yoroDocumentRepository.docsToInactivate(
					subscriptionExpireVO.getDocumentsIdList(), YorosisContext.get().getTenantId(),
					YorosisConstants.YES);
			pickedDocsList.stream().forEach(t -> t.setActiveFlag(YorosisConstants.NO));
			yoroDocumentRepository.saveAll(pickedDocsList);
			response = "Removed picked documents";
		}
		return ResponseStringVO.builder().response(response).build();
	}

}
