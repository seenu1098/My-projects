package com.yorosis.livetester.service;

import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
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

import com.yorosis.livetester.entities.Users;
import com.yorosis.livetester.repo.UsersRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class TokenProviderService {

	@Autowired
	private UsersRepository userRepository;

	private static final String SIGNING_KEY = "yorosis-signing-key";
	private static final long ACCESS_TOKEN_VALIDITY_SECONDS = 5 * 60L * 60L;
	private static final String AUTHORITIES_KEY = "scopes";
	private static final String GLOBAL_ACCESS = "global-access";

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

	public String generateToken(Authentication authentication) {
		final String authorities = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(","));
		Users user = userRepository.findByUserName(authentication.getName());
		Boolean globalAccess = null;
		if (StringUtils.equalsIgnoreCase(user.getGlobalSpecification(), "N")) {
			globalAccess = false;
		} else {
			globalAccess = true;
		}

		return Jwts.builder().setSubject(authentication.getName()).claim(AUTHORITIES_KEY, authorities).claim(GLOBAL_ACCESS, globalAccess)
				.signWith(SignatureAlgorithm.HS256, SIGNING_KEY).setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY_SECONDS * 1000)).compact();
	}

	public boolean validateToken(String token, UserDetails userDetails) {
		final String username = getUsernameFromToken(token);
		return (username.equalsIgnoreCase(userDetails.getUsername()) && !isTokenExpired(token));
	}

	public UsernamePasswordAuthenticationToken getAuthentication(final String token, final UserDetails userDetails) {
		final JwtParser jwtParser = Jwts.parser().setSigningKey(SIGNING_KEY);

		final Jws<Claims> claimsJws = jwtParser.parseClaimsJws(token);
		final Claims claims = claimsJws.getBody();

		final Collection<? extends GrantedAuthority> authorities = Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(",")).map(SimpleGrantedAuthority::new)
				.collect(Collectors.toList());

		return new UsernamePasswordAuthenticationToken(userDetails, "", authorities);
	}

}
