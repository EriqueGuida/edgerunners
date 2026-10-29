package com.guidaerique.edgerunners.security;

import com.guidaerique.edgerunners.model.Hunter;
import com.guidaerique.edgerunners.model.Role;
import com.guidaerique.edgerunners.repository.HunterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Adapta a entidade {@link Hunter} para o contrato {@link UserDetails} do Spring Security,
 * atribuindo as autoridades baseadas no papel persistido (OPERATOR ou ADMIN).
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final HunterRepository hunterRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Hunter hunter = hunterRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Operador não localizado na rede AFTERHOURS: " + username));

        Role role = hunter.getRole() != null ? hunter.getRole() : Role.OPERATOR;

        return new User(
                hunter.getUsername(),
                hunter.getPassword(),
                List.of(
                        new SimpleGrantedAuthority("ROLE_" + role.name()),
                        new SimpleGrantedAuthority("ROLE_HUNTER")
                )
        );
    }
}
