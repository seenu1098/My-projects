package com.yorosis.yoroapps.vo;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSignatureVo {
	private UUID signatureId;
	private String signatureName;
	private String signatureKey;
	private boolean defaultSignature;
	private UUID userId;
	private String response;
}
