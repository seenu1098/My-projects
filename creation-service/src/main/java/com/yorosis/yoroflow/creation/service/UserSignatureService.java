package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.sql.Timestamp;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.yorosis.yoroapps.entities.UserSignature;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.vo.FileUploadVo;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.UserSignatureListVO;
import com.yorosis.yoroapps.vo.UserSignatureVo;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.UserSignatureRepository;
import com.yorosis.yoroflow.creation.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class UserSignatureService {

	@Autowired
	private UserSignatureRepository userSignatureRepository;

	@Autowired
	private FileManagerService fileManagerService;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private UserService userService;

	private UserSignature construcVOtoDTO(UserSignatureVo userSignatureVo, Users user) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return UserSignature.builder().modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.createdBy(YorosisContext.get().getUserName()).createdDate(timestamp).users(user)
				.defaultSignature(booleanToChar(userSignatureVo.isDefaultSignature()))
				.signatureName(userSignatureVo.getSignatureName()).signatureKey(userSignatureVo.getSignatureKey())
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YoroappsConstants.YES).build();
	}

	private UserSignatureVo construcDTOtoVO(UserSignature userSignature) {
		return UserSignatureVo.builder().signatureId(userSignature.getId())
				.defaultSignature(charToBoolean(userSignature.getDefaultSignature()))
				.signatureName(userSignature.getSignatureName()).signatureKey(userSignature.getSignatureKey()).build();
	}

	@Transactional
	public ResponseStringVO saveAndUpdateSignature(UserSignatureListVO userSignatureVo, Users user) {
		if (userSignatureVo != null && !userSignatureVo.getUserSignatureVoList().isEmpty()) {
			List<UserSignatureVo> userSignatureVoList = userSignatureVo.getUserSignatureVoList();
			deleteUserSignature(userSignatureVo.getDeletedIdList());
			if (userSignatureVoList != null && !userSignatureVoList.isEmpty()) {
				List<UserSignature> userSignatureList = new ArrayList<UserSignature>();
				userSignatureVoList.stream().forEach(signatureVo -> {
					if (signatureVo.getSignatureId() == null) {
						userSignatureList.add(construcVOtoDTO(signatureVo, user));
					} else {
						UserSignature userSignature = userSignatureRepository.getBasedonIdAndTenantIdAndActiveFlag(
								signatureVo.getSignatureId(), YorosisContext.get().getTenantId(),
								YoroappsConstants.YES);
						Timestamp timestamp = new Timestamp(System.currentTimeMillis());
						userSignature.setModifiedBy(YorosisContext.get().getUserName());
						userSignature.setDefaultSignature(booleanToChar(signatureVo.isDefaultSignature()));
						userSignature.setSignatureKey(signatureVo.getSignatureKey());
						userSignature.setSignatureName(signatureVo.getSignatureName());
						userSignature.setModifiedOn(timestamp);
						userSignatureList.add(userSignature);
					}
				});
				if (!userSignatureList.isEmpty()) {
					userSignatureRepository.saveAll(userSignatureList);
				}
			}
		}
		return ResponseStringVO.builder().build();
	}

	@Transactional
	public UserSignatureListVO getUserSignatureListVOList(Users user) {
		List<UserSignatureVo> userSignatureVoList = userSignatureVo(user);
		return UserSignatureListVO.builder().userSignatureVoList(userSignatureVoList).build();
	}

	private List<UserSignatureVo> userSignatureVo(Users user) {
		List<UserSignatureVo> userSignatureVoList = new ArrayList<>();
		List<UserSignature> userSignatureList = userSignatureRepository.getListBasedonTenantIdAndActiveFlag(
				user.getUserId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (!userSignatureList.isEmpty()) {
			userSignatureVoList = userSignatureList.stream().map(this::construcDTOtoVO).collect(Collectors.toList());
		}
		return userSignatureVoList;
	}

	@Transactional
	public List<UserSignatureVo> getUserSignatureList() {
		Users user = userRepository.findByUserName(YorosisContext.get().getUserName());
		if (user != null) {
			return userSignatureVo(user);
		}
		return new ArrayList<UserSignatureVo>();
	}

	private void deleteUserSignature(List<UUID> deleteSignatureList) {
		if (deleteSignatureList != null && !deleteSignatureList.isEmpty()) {
			List<UserSignature> userSignatureList = userSignatureRepository.getListBasedonIdAndTenantIdAndActiveFlag(
					deleteSignatureList, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (!userSignatureList.isEmpty()) {
				userSignatureList.stream().forEach(f -> {
					f.setActiveFlag(YoroappsConstants.NO);
				});
				userSignatureRepository.saveAll(userSignatureList);
			}
		}
	}

	@Transactional
	public UserSignatureVo saveSignature(UserSignatureVo userSignatureVo, MultipartFile file) throws IOException {
		LicenseVO allowed = userService.isAllowed();
		if (!StringUtils.equals(allowed.getPlanName(), "STARTER")) {
			if (file != null && userSignatureVo != null) {
				String fileKey = new StringBuilder("user-signature-").append(UUID.randomUUID()).append(LocalTime.now())
						.toString();
				FileUploadVo fileUploadVO = FileUploadVo.builder().key(fileKey).contentSize(file.getSize())
						.inputStream(file.getBytes()).contentType(file.getContentType()).build();
				fileManagerService.uploadFileFromVo(fileUploadVO);
				userSignatureVo.setSignatureKey(fileKey);
				UserSignatureVo userSignatureVO = saveUserSignature(userSignatureVo);
				return userSignatureVO;
			}
		} else {
			return UserSignatureVo.builder().response("Signature access denied for starter plan").build();
		}
		return UserSignatureVo.builder().build();
	}

	private UserSignatureVo saveUserSignature(UserSignatureVo userSignatureVo) {
		Users user = userRepository.findByUserName(YorosisContext.get().getUserName());
		UserSignature userSignature = null;
		if (userSignatureVo.getSignatureId() == null) {
			userSignature = userSignatureRepository.save(construcVOtoDTO(userSignatureVo, user));
		} else {
			UserSignature updateUserSignature = userSignatureRepository.getBasedonIdAndTenantIdAndActiveFlag(
					userSignatureVo.getSignatureId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			updateUserSignature.setModifiedBy(YorosisContext.get().getUserName());
			updateUserSignature.setDefaultSignature(booleanToChar(userSignatureVo.isDefaultSignature()));
			updateUserSignature.setSignatureKey(userSignatureVo.getSignatureKey());
			updateUserSignature.setSignatureName(userSignatureVo.getSignatureName());
			updateUserSignature.setModifiedOn(timestamp);
			userSignature = userSignatureRepository.save(updateUserSignature);
		}
		if (userSignature != null && StringUtils.equals(userSignature.getDefaultSignature(), "Y")) {
			List<UserSignature> userSignatureList = userSignatureRepository
					.getListBasedonTenantIdAndActiveFlagNotDefault(user.getUserId(), userSignature.getId(),
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (!userSignatureList.isEmpty()) {
				userSignatureList.stream().forEach(u -> {
					u.setDefaultSignature(YoroappsConstants.NO);
				});
				userSignatureRepository.saveAll(userSignatureList);
			}
		}
		UserSignatureVo construcDTOtoVO = construcDTOtoVO(userSignature);
		construcDTOtoVO.setResponse("Signature saved successfully");
		return construcDTOtoVO;
	}

	@Transactional
	public ResponseStringVO deleteUserSignature(UUID signatureId) {
		UserSignature deleteUserSignature = userSignatureRepository.getBasedonIdAndTenantIdAndActiveFlag(signatureId,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (deleteUserSignature != null) {
			deleteUserSignature.setActiveFlag(YoroappsConstants.NO);
			userSignatureRepository.save(deleteUserSignature);
			return ResponseStringVO.builder().response("deleted").build();
		}
		return ResponseStringVO.builder().response("not deleted").build();
	}

	public byte[] getFile(String key) throws IOException {
		return fileManagerService.downloadFile(key);
	}

	private String booleanToChar(boolean value) {
		return value ? YoroappsConstants.YES : YoroappsConstants.NO;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YoroappsConstants.YES, value);
	}

}
