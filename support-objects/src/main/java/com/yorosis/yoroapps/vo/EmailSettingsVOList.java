package com.yorosis.yoroapps.vo;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailSettingsVOList {
	private List<EmailSettingsVO> orgEmailsettingsArray;
	private List<UUID> deletedEmailSettingIdList;
	private String subdomainName;
}
