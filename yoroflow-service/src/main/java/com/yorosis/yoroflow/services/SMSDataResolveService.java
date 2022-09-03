package com.yorosis.yoroflow.services;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.MobileNumbersVo;

@Service
public class SMSDataResolveService {

	@Autowired
	private WorkflowService workflowService;

	public List<String> resolvedMobileNumber(ProcessInstanceTask procInstanceTask, List<MobileNumbersVo> mobileNumbersVo) {
		List<String> mobileNumbersList = new ArrayList<>();
		if (!CollectionUtils.isEmpty(mobileNumbersVo)) {
			for (MobileNumbersVo smsFields : mobileNumbersVo) {
				StringBuilder resolvedMobileNumber = new StringBuilder();
				if (!StringUtils.isEmpty(smsFields.getMobileNumber()) && !StringUtils.isEmpty(smsFields.getCountryCode())) {
					resolvedMobileNumber.append(smsFields.getCountryCode());
					if (StringUtils.equals(smsFields.getVariableType(), "pagefield")) {
						ValueType valueType = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(),
								smsFields.getMobileNumber(), VariableType.PAGEFIELD);
						resolvedMobileNumber.append((valueType.getValue().toString()));
					} else {
						resolvedMobileNumber.append(smsFields.getMobileNumber());
					}
					mobileNumbersList.add(resolvedMobileNumber.toString());
				}
			}
		}
		return mobileNumbersList;
	}

	public String resolvedMessageBody(ProcessInstanceTask procInstanceTask, String messageBody) {
		StringBuilder resolvedMessageBody = new StringBuilder();
		if (StringUtils.isNotBlank(messageBody) && StringUtils.contains(messageBody, "${")) {
			for (String primarySplit : StringUtils.split(messageBody, '$')) {

				if (StringUtils.startsWith(primarySplit, "{")) {
					for (String secondarySplit : StringUtils.split(primarySplit, '}')) {
						if (StringUtils.startsWith(secondarySplit, "{")) {
							ValueType valueType = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(),
									StringUtils.substring(secondarySplit, StringUtils.indexOf(secondarySplit, "{") + 1), VariableType.PAGEFIELD);
							resolvedMessageBody.append(valueType.getValue().toString());
						} else {
							resolvedMessageBody.append(secondarySplit);
						}
					}
				} else {
					resolvedMessageBody.append(primarySplit);
				}
			}
			return resolvedMessageBody.toString();
		}
		return messageBody;
	}

}
