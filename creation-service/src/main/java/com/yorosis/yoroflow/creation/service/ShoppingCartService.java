package com.yorosis.yoroflow.creation.service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.sql.Timestamp;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import javax.imageio.ImageIO;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.yoroapps.entities.ShoppingCart;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.ShoppingCartVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.ShoppingCartRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import net.coobird.thumbnailator.Thumbnails;

@Service
public class ShoppingCartService {

	@Autowired
	private ShoppingCartRepository shoppingCartRepository;

	@Autowired
	private FileManagerService fileManagerService;

	@PersistenceContext
	private EntityManager em;

	private ShoppingCart constructVOToDTO(ShoppingCartVO shoppingCartVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return ShoppingCart.builder().activeFlag(YoroappsConstants.YES).tenantId(YorosisContext.get().getTenantId())
				.cartName(shoppingCartVO.getShoppingCartName()).cartData(shoppingCartVO.getShoppingCartJson()).cartLabel(shoppingCartVO.getShoppingCartlabel())
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).createdBy(YorosisContext.get().getUserName()).createdDate(timestamp)
				.build();
	}

	private ShoppingCartVO constructDTOToVO(ShoppingCart shoppingCart) {
		return ShoppingCartVO.builder().shoppingCartId(shoppingCart.getId()).shoppingCartName(shoppingCart.getCartName())
				.shoppingCartlabel(shoppingCart.getCartLabel()).shoppingCartJson(shoppingCart.getCartData()).build();
	}

	@Transactional
	public ResponseStringVO save(ShoppingCartVO shoppingCartVO) throws IOException {
		if (shoppingCartVO.getShoppingCartId() == null) {
			setRepeatableImage(shoppingCartVO.getShoppingCartJson());
			shoppingCartRepository.save(constructVOToDTO(shoppingCartVO));
			return ResponseStringVO.builder().response("Shopping Cart created successfully").build();
		} else {
			ShoppingCart shoppingCart = shoppingCartRepository.getOne(shoppingCartVO.getShoppingCartId());
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			setRepeatableImage(shoppingCartVO.getShoppingCartJson());
			shoppingCart.setCartLabel(shoppingCartVO.getShoppingCartlabel());
			shoppingCart.setCartName(shoppingCartVO.getShoppingCartName());
			shoppingCart.setCartData(shoppingCartVO.getShoppingCartJson());
			shoppingCart.setModifiedBy(YorosisContext.get().getUserName());
			shoppingCart.setModifiedOn(timestamp);
			shoppingCartRepository.save(shoppingCart);

			return ResponseStringVO.builder().response("Shopping Cart updated successfully").build();
		}
	}

	@Transactional
	public ResponseStringVO checkCartName(String cartName) {
		ShoppingCart shoppingCart = shoppingCartRepository.getShoppingCartByName(cartName, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (shoppingCart == null) {
			return ResponseStringVO.builder().response("continue").build();
		} else {
			return ResponseStringVO.builder().response("duplicate").build();
		}
	}

	@Transactional
	public ShoppingCartVO getShoppingCartDetails(String name) {
		ShoppingCart shoppingCart = shoppingCartRepository.getShoppingCartByName(name, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (shoppingCart != null) {
			return constructDTOToVO(shoppingCart);
		}
		return ShoppingCartVO.builder().build();
	}

	@Transactional
	public List<ShoppingCartVO> getCartName(String name) throws IOException {
		List<ShoppingCartVO> cartNameList = new ArrayList<>();
		List<ShoppingCart> shoppingCartList = null;
		if (StringUtils.isEmpty(name)) {
			shoppingCartList = shoppingCartRepository.getShoppingCartList(YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		} else {
			CriteriaBuilder criteriaTableBuilder = em.getCriteriaBuilder();
			CriteriaQuery<ShoppingCart> criteriaTableQuery = criteriaTableBuilder.createQuery(ShoppingCart.class);
			Root<ShoppingCart> shoppingCartRoot = criteriaTableQuery.from(ShoppingCart.class);

			Predicate predicateForCartName = criteriaTableBuilder
					.or(criteriaTableBuilder.like(criteriaTableBuilder.lower(shoppingCartRoot.get("cartLabel")), "%" + name.toLowerCase() + "%"));
			Predicate predicateForActiveFlag = criteriaTableBuilder.equal(shoppingCartRoot.get("activeFlag"), YoroappsConstants.YES);

			Predicate predicateForCartNameList = criteriaTableBuilder.and(predicateForCartName, predicateForActiveFlag);
			criteriaTableQuery.select(shoppingCartRoot).where(predicateForCartNameList);
			TypedQuery<ShoppingCart> createTableQuery = em.createQuery(criteriaTableQuery);
			shoppingCartList = createTableQuery.getResultList();
		}

		if (shoppingCartList != null && !shoppingCartList.isEmpty()) {
			for (ShoppingCart shoppingCart : shoppingCartList) {
				cartNameList.add(constructDTOToVO(shoppingCart));
			}
		}

		return cartNameList;
	}

	private String getImageThumbNail(String str) throws IOException {
		String thumbnailSeparator = "data:image/";

		String thumbnailImage = str.substring(thumbnailSeparator.length(), str.indexOf(";"));
		String separator = "-";
		int sepPos = str.indexOf(",");
		str = str.substring(sepPos + separator.length());
		byte[] bytes = Base64.getDecoder().decode(str);
		String imageKey = UUID.randomUUID().toString() + LocalTime.now();
		saveImageInS3(imageKey, bytes);

		bytes = Base64.getDecoder().decode(addThumbnailImage(str, thumbnailImage));
		String imageKeyThumbnail = imageKey + "thumbnail";
		saveImageInS3(imageKeyThumbnail, bytes);

		return imageKeyThumbnail;
	}

	private void saveImageInS3(String imageKey, byte[] bytes) {
		fileManagerService.uploadFile(imageKey, new ByteArrayInputStream(bytes), bytes.length);
	}

	private String addThumbnailImage(String image, String thumbnailImageType) throws IOException {
		byte[] imageByte = Base64.getDecoder().decode(image);
		ByteArrayInputStream bis = new ByteArrayInputStream(imageByte);
		BufferedImage originalImage = ImageIO.read(bis);
		bis.close();
		if (originalImage != null) {
			BufferedImage thumbnail = Thumbnails.of(originalImage).scale(0.25).asBufferedImage();
			ByteArrayOutputStream os = new ByteArrayOutputStream();
			ImageIO.write(thumbnail, thumbnailImageType, os);
			return Base64.getEncoder().encodeToString(os.toByteArray());
		} else {
			return image;
		}
	}

	private void setRepeatableImage(JsonNode field) throws IOException {
		if (field.has("field")) {
			JsonNode fields = field.get("field");
			if (fields.has("control")) {
				JsonNode control = fields.get("control");
				if (control.has("stepDetails")) {
					JsonNode stepDetailsList = control.get("stepDetails");
					for (JsonNode stepDetail : stepDetailsList) {
						if (stepDetail.has("controlType")) {
							JsonNode controlTypes = stepDetail.get("controlType");
							if (controlTypes.has("controlType") && StringUtils.equals(controlTypes.get("controlType").asText(), "image")
									&& stepDetail.has("stepValues")) {
								JsonNode stepValuesList = stepDetail.get("stepValues");
								for (JsonNode stepValue : stepValuesList) {
									if (stepValue.has("key") && stepValue.get("key").asText() != null
											&& StringUtils.startsWith(stepValue.get("key").asText(), "data:image/")) {
										String imageKeyThumbnail = getImageThumbNail(stepValue.get("key").asText());
										change(stepValue, "key", imageKeyThumbnail);
									}
								}
							}
						}
					}
				}
			}
		}
	}

	private void change(JsonNode parent, String fieldName, String newValue) {
		if (parent.has(fieldName)) {
			((ObjectNode) parent).put(fieldName, newValue);
		}
		// Now, recursively invoke this method on all properties
		for (JsonNode child : parent) {
			change(child, fieldName, newValue);
		}
	}

}
