package com.yorosis.yoroapps.vo;

import java.util.UUID;

import javax.persistence.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ThemesVO {
	private UUID id;
	private String themeName;
	private String themeId;
	private String activeFlag;
}
