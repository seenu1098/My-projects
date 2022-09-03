package com.yorosis.yoroapps.vo;

import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingCartVO {
	private UUID shoppingCartId;
	private String shoppingCartName;
	private String shoppingCartlabel;
	private JsonNode shoppingCartJson;
}
