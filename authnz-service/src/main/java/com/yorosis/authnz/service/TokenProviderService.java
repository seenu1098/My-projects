package com.yorosis.authnz.service;

import java.sql.Timestamp;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.authnz.constants.YorosisConstants;
import com.yorosis.authnz.exception.YorosisException;
import com.yorosis.authnz.repository.LoginHistoryRepository;
import com.yorosis.authnz.repository.MenuAssociateRolesRepository;
import com.yorosis.authnz.repository.PagePermissionsRepository;
import com.yorosis.authnz.repository.ServiceTokenRepository;
import com.yorosis.authnz.repository.UserAssociateRolesRepository;
import com.yorosis.authnz.repository.UsersRepository;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.LoginHistory;
import com.yorosis.yoroapps.entities.ServiceToken;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.vo.GroupVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class TokenProviderService {

	private static final String SIGNING_KEY = "yorosis-signing-key";
	private static final long ACCESS_TOKEN_VALIDITY_SECONDS = 5 * 60L * 60L;
	private static final String AUTHORITIES_KEY = "scopes";
	private static final String USER_ROLE = "user_role";
	private static final String SUBDOMAIN = "sub_domain";
	private static final String ASSOCIATE_ROLES = "associate_roles";
	private static final String LOGIN_ID = "login_id";
	public static final String IS_SUBSCRIPTION_EXPIRED = "isSubscriptionExpired";

	@Autowired
	private UserService userService;

	@Autowired
	private PagePermissionsRepository pagePermissionsRepository;

	@Autowired
	private DomainService domainService;

	@Autowired
	private UsersRepository usersRepository;

	@Autowired
	private ServiceTokenRepository serviceTokenRepository;

	@Autowired
	private MenuAssociateRolesRepository menuAssociateRolesRepository;

	@Autowired
	private UserAssociateRolesRepository userAssociateRolesRepository;

	@Autowired
	private LoginHistoryRepository loginHistoryRepository;

	public String getUsernameFromToken(String token) {
		return getClaimFromToken(token, Claims::getSubject);
	}

	public Date getExpirationDateFromToken(String token) {
		return getClaimFromToken(token, Claims::getExpiration);
	}

	public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = getAllClaimsFromToken(token);
		return claimsResolver.apply(claims);
	}

	public Claims getAllClaimsFromToken(String token) {
		return Jwts.parser().setSigningKey(SIGNING_KEY).parseClaimsJws(token).getBody();
	}

	private Boolean isTokenExpired(String token) {
		final Date expiration = getExpirationDateFromToken(token);
		return expiration.before(new Date());
	}

	private Set<String> getUserRole(UsersVO loggedInUserDetails) {
		Set<String> menuPathList = new HashSet<>();

		List<UUID> groupUuidList = loggedInUserDetails.getGroupVOList().stream().map(GroupVO::getGroupId)
				.collect(Collectors.toList());
		List<UUID> roleIdList = userAssociateRolesRepository.getRolesIdListBasedOnUserId(
				loggedInUserDetails.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (!CollectionUtils.isEmpty(roleIdList)) {
			menuPathList.addAll(menuAssociateRolesRepository.getMenuPath(roleIdList, YorosisConstants.YES,
					YorosisContext.get().getTenantId()));
		}
		if (!CollectionUtils.isEmpty(groupUuidList)) {
			menuPathList.addAll(pagePermissionsRepository.getMenuPath(groupUuidList, YorosisConstants.YES,
					YorosisContext.get().getTenantId()));
		}
		return menuPathList;
	}

	public String generateToken(Authentication authentication, String loginUUID) throws YorosisException {
		UsersVO loggedInUserDetails = userService.getLoggedInUserDetails();
		Customers customers = getCustomer();
		boolean subscriptionExpired = domainService.isSubscriptionExpired(customers);
		final String authorities = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority)
				.collect(Collectors.joining(","));

		return Jwts.builder().setSubject(authentication.getName()).claim(AUTHORITIES_KEY, authorities)
				.claim(SUBDOMAIN, getSubDomain()).claim(USER_ROLE, getUserRole(loggedInUserDetails))
				.claim(ASSOCIATE_ROLES, getAssociateRoles(loggedInUserDetails)).claim(LOGIN_ID, loginUUID)
				.claim(YorosisConstants.TENANT_ID, YorosisContext.get().getTenantId())
				.claim(IS_SUBSCRIPTION_EXPIRED, subscriptionExpired).signWith(SignatureAlgorithm.HS256, SIGNING_KEY)
				.setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY_SECONDS * 1000)).compact();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void getlogoutTime(String token) throws JsonMappingException, JsonProcessingException {
		String[] split_string = token.split("\\.");
		Base64.Decoder decoder = Base64.getDecoder();
		String payload = new String(decoder.decode(split_string[1]));
		ObjectMapper mapper = new ObjectMapper();
		JsonNode actualObj = mapper.readTree(payload);
		if (actualObj != null && actualObj.has(LOGIN_ID) && actualObj.get(LOGIN_ID) != null) {
			String loginId = actualObj.get(LOGIN_ID).asText();
			LoginHistory loginHistory = loginHistoryRepository.findByLoginId(UUID.fromString(loginId));
			if (loginHistory != null) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				loginHistory.setLogoutTime(timestamp);
				loginHistoryRepository.save(loginHistory);
			}
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Boolean getlogin(String token) throws JsonMappingException, JsonProcessingException {
		String[] split_string = token.split("\\.");
		Base64.Decoder decoder = Base64.getDecoder();
		String payload = new String(decoder.decode(split_string[1]));
		ObjectMapper mapper = new ObjectMapper();
		JsonNode actualObj = mapper.readTree(payload);
		if (actualObj != null && actualObj.has(LOGIN_ID) && actualObj.get(LOGIN_ID) != null) {
			String loginId = actualObj.get(LOGIN_ID).asText();
			if (StringUtils.isNotEmpty(loginId) && !StringUtils.equals(loginId, "null")) {
				LoginHistory loginHistory = loginHistoryRepository.findByLoginIdAndTenantId(UUID.fromString(loginId),
						YorosisConstants.YES, YorosisContext.get().getTenantId());
				if (loginHistory != null) {
					return true;
				}
			} else {
				return true;
			}
		} else {
			return true;
		}
		return false;
	}

	public Set<String> getAssociateRoles(UsersVO loggedInUserDetails) {
		Set<String> userAssociateRoleList = new HashSet<>();
		if (loggedInUserDetails.getUserRoleList() != null && !loggedInUserDetails.getUserRoleList().isEmpty()) {
			loggedInUserDetails.getUserRoleList().stream().forEach(t -> userAssociateRoleList.add(t.getRolesNames()));
		}
		return userAssociateRoleList;
	}

	public String generateTokenFromAuthService(String userName) throws YorosisException {
		UsersVO loggedInUserDetails = userService.getLoggedInUserDetails();
		Customers customers = getCustomer();
		boolean subscriptionExpired = domainService.isSubscriptionExpired(customers);
		return Jwts.builder().setSubject(userName).claim(AUTHORITIES_KEY, "ROLE_USER").claim(SUBDOMAIN, getSubDomain())
				.claim(USER_ROLE, getUserRole(loggedInUserDetails))
				.claim(ASSOCIATE_ROLES, getAssociateRoles(loggedInUserDetails))
				.claim(YorosisConstants.TENANT_ID, YorosisContext.get().getTenantId())
				.claim(IS_SUBSCRIPTION_EXPIRED, subscriptionExpired).signWith(SignatureAlgorithm.HS256, SIGNING_KEY)
				.setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY_SECONDS * 1000)).compact();
	}

	public String getSubdomain(String token) {
		Claims claims = getAllClaimsFromToken(token);
		return claims.get("sub_domain", String.class);

	}

	private String getSubDomain() throws YorosisException {
		Users user = usersRepository.findByUserNameIgnoreCase(YorosisContext.get().getUserName());
		Customers customer = null;
		YorosisContext currentContext = YorosisContext.get();
		try {
			YorosisContext context = YorosisContext.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA)
					.userName(user.getUserName()).build();
			YorosisContext.set(context);
			customer = domainService.getCustomer(currentContext.getTenantId());
		} finally {
			YorosisContext.clear();
			YorosisContext.set(currentContext);
		}
		return customer.getSubdomainName() + ".yoroflow.com";
	}

	private Customers getCustomer() throws YorosisException {
		Users user = usersRepository.findByUserNameIgnoreCase(YorosisContext.get().getUserName());
		Customers customer = null;
		YorosisContext currentContext = YorosisContext.get();
		try {
			YorosisContext context = YorosisContext.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA)
					.userName(user.getUserName()).build();
			YorosisContext.set(context);
			customer = domainService.getCustomer(currentContext.getTenantId());
		} finally {
			YorosisContext.clear();
			YorosisContext.set(currentContext);
		}
		return customer;
	}

	public boolean validateToken(String token, UserDetails userDetails) {
		final String username = getUsernameFromToken(token);
		return (username.equalsIgnoreCase(userDetails.getUsername()) && !isTokenExpired(token));
	}

	public UsernamePasswordAuthenticationToken getAuthentication(final String token, final UserDetails userDetails) {
		final JwtParser jwtParser = Jwts.parser().setSigningKey(SIGNING_KEY);

		final Jws<Claims> claimsJws = jwtParser.parseClaimsJws(token);
		final Claims claims = claimsJws.getBody();

		final Collection<? extends GrantedAuthority> authorities = Arrays
				.stream(claims.get(AUTHORITIES_KEY).toString().split(",")).map(SimpleGrantedAuthority::new)
				.collect(Collectors.toList());

		return new UsernamePasswordAuthenticationToken(userDetails, "", authorities);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Users getUserFromApikey(String apiKey, String secretKey) {
		ServiceToken serviceToken = serviceTokenRepository.getServiceTokenByApiKey(apiKey,
				YorosisContext.get().getTenantId());
		// && !validateApiKey(secretKey, serviceToken.getSecretKey())
		if (serviceToken == null) {
			return null;
		}
		return serviceToken.getUsers();
	}
}
