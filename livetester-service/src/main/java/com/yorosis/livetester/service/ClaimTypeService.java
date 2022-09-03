package com.yorosis.livetester.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.livetester.entities.ClaimType;
import com.yorosis.livetester.repo.ClaimTypeRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.vo.ClaimTypeVO;
import com.yorosis.livetester.vo.ResponseVO;

@Service
public class ClaimTypeService {

	@Autowired
	private ClaimTypeRepository claimTypeRepository;

	@Transactional
	public ResponseVO saveClaimType(ClaimTypeVO claimTypeVO) {
		String message = null;
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		String user = YorosisContext.get().getUserName();
		if (claimTypeVO.getId() == null || claimTypeVO.getId() <= 0) {
			ClaimType claimType = ClaimType.builder().claimTypeCode(claimTypeVO.getClaimTypeCode()).description(claimTypeVO.getDescription()).formType(claimTypeVO.getFormType())
					.createdBy(user).createdDate(currentTimestamp).updatedBy(user).updatedDate(currentTimestamp).build();

			claimTypeRepository.save(claimType);
			message = "ClaimType created succesfully";
		} else {
			ClaimType claimType = claimTypeRepository.getOne(claimTypeVO.getId());
			claimType.setDescription(claimTypeVO.getDescription());
			claimType.setFormType(claimTypeVO.getFormType());
			claimType.setUpdatedBy(user);
			claimType.setUpdatedDate(currentTimestamp);

			claimTypeRepository.save(claimType);
			message = "ClaimType updated successfully";
		}

		return ResponseVO.builder().response(message).build();
	}

	@Transactional
	public List<ClaimTypeVO> getClaimType() {
		List<ClaimTypeVO> list = new ArrayList<>();

		List<ClaimType> claimTypeList = claimTypeRepository.findAllByOrderByIdDesc();
		for (ClaimType claimType : claimTypeList) {
			ClaimTypeVO claimTypeVO = ClaimTypeVO.builder().id(claimType.getId()).claimTypeCode(claimType.getClaimTypeCode()).description(claimType.getDescription())
					.formType(claimType.getFormType()).build();
			list.add(claimTypeVO);
		}

		return list;
	}

	@Transactional
	public ClaimTypeVO getClaimTypeDetail(Integer id) {
		ClaimType claimType = claimTypeRepository.getOne(id);

		return ClaimTypeVO.builder().id(claimType.getId()).claimTypeCode(claimType.getClaimTypeCode()).description(claimType.getDescription()).formType(claimType.getFormType())
				.build();
	}

	@Transactional
	public ResponseVO deleteClaimTypeDetail(Integer id) {
		String message = "Claim type deleted succesfully";

		claimTypeRepository.deleteById(id);
		return ResponseVO.builder().response(message).isDeleted(1).build();
	}

}
