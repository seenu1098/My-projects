package com.yorosis.yoroflow.models;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageGroupsVO {
	private UUID id;
	private String groupName;
	private String profilePicture;
	private List<MessageGroupUsersVO> messageGroupUsersVOList;
}
