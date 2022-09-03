package com.yorosis.taskboard.services;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.yorosis.taskboard.models.GroupVO;
import com.yorosis.taskboard.repository.CustomPagePermissionsRepository;
import com.yorosis.taskboard.repository.CustomersRepository;
import com.yorosis.taskboard.repository.PagePermissionsRepository;
import com.yorosis.taskboard.repository.UsersRepository;
import com.yorosis.taskboard.taskboard.entities.Customers;
import com.yorosis.taskboard.taskboard.entities.User;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
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
	@Autowired
	private UserService userService;

	@Autowired
	private PagePermissionsRepository pagePermissionsRepository;

	@Autowired
	private CustomPagePermissionsRepository customPagePermissionsRepository;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private UsersRepository usersRepository;

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

	private List<String> getUserRole() {
		List<String> menuPathList = new ArrayList<String>();
		List<UUID> groupUuidList = userService.getLoggedInUserDetails().getGroupVOList().stream().map(GroupVO::getGroupId).collect(Collectors.toList());
		if (!CollectionUtils.isEmpty(groupUuidList)) {
			menuPathList.addAll(customPagePermissionsRepository.getMenuPath(groupUuidList, YorosisConstants.YES, YorosisContext.get().getTenantId()));
			menuPathList.addAll(pagePermissionsRepository.getMenuPath(groupUuidList, YorosisConstants.YES, YorosisContext.get().getTenantId()));
		}
		return menuPathList;
	}

	public String generateToken(Authentication authentication) {
		final String authorities = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(","));

		return Jwts.builder().setSubject(authentication.getName()).claim(AUTHORITIES_KEY, authorities).claim(SUBDOMAIN, getSubDomain())
				.claim(USER_ROLE, getUserRole()).claim(YorosisConstants.TENANT_ID, YorosisContext.get().getTenantId())
				.signWith(SignatureAlgorithm.HS256, SIGNING_KEY).setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY_SECONDS * 1000)).compact();
	}

	private String getSubDomain() {
		User user = usersRepository.findByUserName(YorosisContext.get().getUserName());
		Customers customer = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(user.getTenantId(), YorosisConstants.YES);
		return customer.getSubdomainName() + "." + customer.getActualDomainName();
	}

	public boolean validateToken(String token, UserDetails userDetails) {
		final String username = getUsernameFromToken(token);
		return (username.equalsIgnoreCase(userDetails.getUsername()) && !isTokenExpired(token));
	}

	public UsernamePasswordAuthenticationToken getAuthentication(final String token, final UserDetails userDetails) {
		final JwtParser jwtParser = Jwts.parser().setSigningKey(SIGNING_KEY);

		final Jws<Claims> claimsJws = jwtParser.parseClaimsJws(token);
		final Claims claims = claimsJws.getBody();

		final Collection<? extends GrantedAuthority> authorities = Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
				.map(SimpleGrantedAuthority::new).collect(Collectors.toList());

		return new UsernamePasswordAuthenticationToken(userDetails, "", authorities);
	}

}
