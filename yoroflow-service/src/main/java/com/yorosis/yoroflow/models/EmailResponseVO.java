package com.yorosis.yoroflow.models;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmailResponseVO {

	private String trackingId;
	private String status;
	private LocalDateTime sentDateTime;

}
