package com.isfahan.km.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SecurityWhitelistConfig {

    public static final String[] WHITELIST = new String[] {
            "/api/auth/**",
            "/api/public/**",
            "/api/experience-panels/**",
            "/api/admin/**",
            "/api/knowledge/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/actuator/**"
    };

    @Bean(name = "whitelistUrls")
    public String[] whitelistUrls() {
        return WHITELIST;
    }
}
