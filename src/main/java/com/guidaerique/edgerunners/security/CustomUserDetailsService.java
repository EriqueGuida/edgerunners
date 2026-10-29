package com.guidaerique.edgerunners.security;

import com.guidaerique.edgerunners.model.Hunter;
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
 * permitindo a validação de credenciais durante a autenticação.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final HunterRepository hunterRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Hunter hunter = hunterRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Hunter não encontrado em Night City: " + username));

        // Concede a autoridade padrão ROLE_HUNTER a todo caçador autenticado.
        return new User(
                hunter.getUsername(),
                hunter.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_HUNTER"))
        );
    }
}
