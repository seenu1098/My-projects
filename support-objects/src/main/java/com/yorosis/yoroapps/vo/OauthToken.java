package com.yorosis.yoroapps.vo;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class OauthToken {
    private String accessToken;
    private String tokenType;
    private Integer expiresInSeconds;
    private String refreshToken;
    private String scope;
}
