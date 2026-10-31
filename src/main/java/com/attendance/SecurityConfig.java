package com.attendance;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean UserDetailsService users(@Value("${attendance.admin.username}") String name, @Value("${attendance.admin.password}") String password) {
        return new InMemoryUserDetailsManager(User.withUsername(name).password("{bcrypt}" + new BCryptPasswordEncoder().encode(password)).roles("ADMIN").build());
    }
    @Bean SecurityFilterChain security(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(a -> a.requestMatchers("/login.html", "/styles.css", "/login.js", "/api/csrf", "/favicon.svg").permitAll().anyRequest().authenticated())
            .formLogin(f -> f.loginPage("/login.html").loginProcessingUrl("/login").defaultSuccessUrl("/", true).failureUrl("/login.html?error").permitAll())
            .logout(l -> l.logoutSuccessUrl("/login.html"))
            .exceptionHandling(e -> e.defaultAuthenticationEntryPointFor((req, res, ex) -> res.sendError(401), req -> req.getRequestURI().startsWith("/api/")))
            .build();
    }
}
