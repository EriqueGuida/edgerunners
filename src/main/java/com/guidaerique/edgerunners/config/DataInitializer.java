package com.guidaerique.edgerunners.config;

import com.guidaerique.edgerunners.model.*;
import com.guidaerique.edgerunners.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Inicializador de dados que garante a existência de contas de demonstração (Operador e Administrador)
 * e contratos geolocalizados ao redor da Terra para o catálogo e o mapa MapLibre GL JS.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final HunterRepository hunterRepository;
    private final ContractRepository contractRepository;
    private final NotificationRepository notificationRepository;
    private final ReputationEventRepository reputationEventRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedDefaultAccounts();
        seedGeolocatedContracts();
    }

    private void seedDefaultAccounts() {
        if (!hunterRepository.existsByUsername("admin")) {
            Hunter admin = Hunter.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .callsign("DIRECTOR_ZERO")
                    .specialization("DIREÇÃO DE OPERAÇÕES GLOBAIS")
                    .bio("Conta administrativa responsável pela curadoria, despacho e auditoria de contratos da rede AFTERHOURS.")
                    .avatarCode("ADMIN_CORE")
                    .streetCred(50)
                    .eddies(150000.0)
                    .createdAt(LocalDateTime.now())
                    .build();
            hunterRepository.save(admin);
            log.info("[AFTERHOURS] Conta administrativa inicializada (usuário: admin / senha: admin123)");
        }

        if (!hunterRepository.existsByUsername("operador")) {
            Hunter operator = Hunter.builder()
                    .username("operador")
                    .password(passwordEncoder.encode("afterhours"))
                    .role(Role.OPERATOR)
                    .callsign("OP_VANGUARD")
                    .specialization("INFILTRAÇÃO & EXTRAÇÃO DE DADOS")
                    .bio("Operador tático independente com atuação em zonas financeiras e infraestrutura crítica.")
                    .avatarCode("VANGUARD_01")
                    .streetCred(15)
                    .eddies(24500.0)
                    .createdAt(LocalDateTime.now())
                    .build();
            Hunter savedOp = hunterRepository.save(operator);

            reputationEventRepository.save(ReputationEvent.builder()
                    .operator(savedOp)
                    .delta(15)
                    .reputationAfter(15)
                    .reason("Histórico operacional prévio validado pela diretoria AFTERHOURS.")
                    .createdAt(LocalDateTime.now())
                    .build());

            notificationRepository.save(Notification.builder()
                    .operator(savedOp)
                    .title("REDE AFTERHOURS // CANAL OPERACIONAL ATIVO")
                    .message("Bem-vindo ao terminal tático, OP_VANGUARD. Há novos contratos geolocalizados aguardando avaliação.")
                    .type("INFO")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build());
            log.info("[AFTERHOURS] Conta de operador padrão inicializada (usuário: operador / senha: afterhours)");
        }
    }

    private void seedGeolocatedContracts() {
        if (contractRepository.count() > 0) {
            return;
        }

        List<Contract> initialContracts = List.of(
                Contract.builder()
                        .title("Extração de Criptografia Quântica em Shinjuku")
                        .targetName("Servidor Kestrel-09")
                        .faction("Aethelgard Dynamics")
                        .reward(45000.0)
                        .threatLevel(ThreatLevel.PSYCHO)
                        .status(ContractStatus.AVAILABLE)
                        .summary("Extração física de chaves pós-quânticas em centro de processamento de alta segurança no distrito de Shinjuku.")
                        .briefing("A Aethelgard Dynamics identificou o vazamento de um lote de chaves mestras armazenadas em um cofre frio isolado da rede no 42º andar do complexo Shinjuku Mitsui. O operador deverá infiltrar-se durante a janela de manutenção térmica, extrair o módulo físico e transmitir o hash de integridade.")
                        .objectives("Infiltrar-se no 42º andar via duto de resfriamento;Extrair o módulo criptográfico Kestrel-09 sem acionar o bloqueio biométrico;Transmitir o código de confirmação no ponto de extração")
                        .requirements("Reputação mínima 10. Proibido uso de explosivos ou interferência eletromagnética ampla.")
                        .minReputation(10)
                        .reputationReward(20)
                        .locationName("Shinjuku, Tóquio — Japão")
                        .region("ÁSIA-PACÍFICO")
                        .latitude(35.6895)
                        .longitude(139.6917)
                        .verificationPrompt("Insira o hash de integridade extraído do módulo Kestrel-09 (ex: KESTREL-SHA-902).")
                        .createdAt(LocalDateTime.now().minusHours(5))
                        .build(),

                Contract.builder()
                        .title("Interceptação de Remessa Biométrica na Avenida Paulista")
                        .targetName("Comboio Blindado V-12")
                        .faction("Helios Biotech")
                        .reward(28500.0)
                        .threatLevel(ThreatLevel.HIGH)
                        .status(ContractStatus.AVAILABLE)
                        .summary("Clonagem não destrutiva de registros genéticos transportados entre centros financeiros em São Paulo.")
                        .briefing("Um veículo de transferência de dados da Helios Biotech cruzará o corredor subterrâneo da Avenida Paulista às 02:40 UTC. O cliente exige uma cópia espelhada do manifesto de carga via acoplamento de curto alcance sem interromper o trajeto do comboio.")
                        .objectives("Posicionar repetidor tático no túnel da Paulista;Sincronizar leitura de pacotes a menos de 15 metros do veículo V-12;Confirmar checksum do manifesto clonado")
                        .requirements("Operação estritamente furtiva. O comboio não deve detectar perda de pacotes.")
                        .minReputation(5)
                        .reputationReward(15)
                        .locationName("Av. Paulista, São Paulo — Brasil")
                        .region("AMÉRICA LATINA")
                        .latitude(-23.5614)
                        .longitude(-46.6559)
                        .verificationPrompt("Informe o checksum de sincronização do comboio V-12.")
                        .createdAt(LocalDateTime.now().minusHours(4))
                        .build(),

                Contract.builder()
                        .title("Neutralização de Nó Clandestino em Kreuzberg")
                        .targetName("Estação Subterrânea U-04")
                        .faction("Coletivo Null-Sec")
                        .reward(14000.0)
                        .threatLevel(ThreatLevel.MEDIUM)
                        .status(ContractStatus.AVAILABLE)
                        .summary("Desativação de repetidores ilegais instalados em galeria ferroviária desativada de Berlim.")
                        .briefing("Um grupo dissidente instalou antenas de interceptação em uma subestação abandonada sob Kreuzberg, comprometendo rotas de comunicação de operadores europeus. Desative os três módulos de transmissão e recupere o log de acessos.")
                        .objectives("Localizar a entrada secundária da galeria U-04;Desenergizar os 3 repetidores de sinal;Extrair o cartão de registro de tráfego")
                        .requirements("Acesso liberado para operadores de nível inicial (Reputação >= 1).")
                        .minReputation(1)
                        .reputationReward(10)
                        .locationName("Kreuzberg, Berlim — Alemanha")
                        .region("EUROPA")
                        .latitude(52.4986)
                        .longitude(13.4033)
                        .verificationPrompt("Informe o código serial do repetidor principal desativado.")
                        .createdAt(LocalDateTime.now().minusHours(3))
                        .build(),

                Contract.builder()
                        .title("Recuperação de Dossiê Financeiro em Marina Bay")
                        .targetName("Terminal Portuário S-3")
                        .faction("Consórcio Meridian")
                        .reward(22000.0)
                        .threatLevel(ThreatLevel.HIGH)
                        .status(ContractStatus.AVAILABLE)
                        .summary("Auditoria forçada em contêiner automatizado de servidores no porto de Singapura.")
                        .briefing("O Consórcio Meridian precisa recuperar registros contábeis retidos em um contêiner de dados refrigerado no Terminal S-3 de Marina Bay antes de seu embarque marítimo. O operador deve conectar-se diretamente à porta óptica do contêiner.")
                        .objectives("Identificar o contêiner MRD-884 no pátio automatizado;Conectar terminal de decodificação na porta óptica;Transferir arquivo de auditoria e limpar logs locais")
                        .requirements("Cuidado com drones de patrulha portuária automatizados.")
                        .minReputation(5)
                        .reputationReward(12)
                        .locationName("Marina Bay, Singapura")
                        .region("ÁSIA-PACÍFICO")
                        .latitude(1.2834)
                        .longitude(103.8607)
                        .verificationPrompt("Informe o código de manifesto extraído do contêiner MRD-884.")
                        .createdAt(LocalDateTime.now().minusHours(2))
                        .build(),

                Contract.builder()
                        .title("Varredura de Contramedidas em Gangnam")
                        .targetName("Torre Han-River")
                        .faction("Kurogane Systems")
                        .reward(8500.0)
                        .threatLevel(ThreatLevel.LOW)
                        .status(ContractStatus.AVAILABLE)
                        .summary("Verificação de segurança física e varredura de escutas em sala de conselho corporativo em Seul.")
                        .briefing("A Kurogane Systems suspeita de espionagem industrial antes de uma fusão estratégica. O operador realizará uma varredura de espectro eletromagnético no 28º andar da Torre Han-River e removerá quaisquer transmissores passivos.")
                        .objectives("Executar varredura de radiofrequência no 28º andar;Neutralizar microtransmissores encontrados;Emitir laudo criptografado de conformidade")
                        .requirements("Nível de risco baixo. Ideal para construção rápida de reputação na rede.")
                        .minReputation(1)
                        .reputationReward(10)
                        .locationName("Gangnam, Seul — Coreia do Sul")
                        .region("ÁSIA-PACÍFICO")
                        .latitude(37.4979)
                        .longitude(127.0276)
                        .verificationPrompt("Informe a frequência ou ID do transmissor neutralizado.")
                        .createdAt(LocalDateTime.now().minusHours(1))
                        .build(),

                Contract.builder()
                        .title("Sabotagem de Bunker de Dados nos Alpes")
                        .targetName("Complexo Criptográfico Helvetia")
                        .faction("Vanguard Sovereign")
                        .reward(62000.0)
                        .threatLevel(ThreatLevel.PSYCHO)
                        .status(ContractStatus.AVAILABLE)
                        .summary("Injeção de payload lógico em instalação subterrânea de armazenamento frio próxima a Zurique.")
                        .briefing("O Complexo Helvetia opera servidores isolados sob rocha granítica nos arredores de Zurique. A Vanguard Sovereign autorizou uma operação de alto risco para injetar uma rotina de bloqueio seletivo nos backups de uma organização rival.")
                        .objectives("Ultrapassar o perímetro de sensores térmicos externos;Acessar o terminal mestre da galeria B;Executar payload de bloqueio e confirmar assinatura criptográfica")
                        .requirements("Exige Operador Sênior (Reputação >= 15). Janela máxima de permanência: 12 minutos.")
                        .minReputation(15)
                        .reputationReward(25)
                        .locationName("Zurique — Suíça")
                        .region("EUROPA")
                        .latitude(47.3769)
                        .longitude(8.5417)
                        .verificationPrompt("Informe a assinatura de execução gerada pelo terminal Helvetia.")
                        .createdAt(LocalDateTime.now().minusMinutes(45))
                        .build(),

                Contract.builder()
                        .title("Rastreamento de Transmissão Fantasma em Manhattan")
                        .targetName("Antena Chrysler-Sec")
                        .faction("Echelon Intelligence")
                        .reward(16800.0)
                        .threatLevel(ThreatLevel.MEDIUM)
                        .status(ContractStatus.AVAILABLE)
                        .summary("Triangulação e desligamento de farol de dados anônimo operando em Midtown Manhattan.")
                        .briefing("Sinais criptografados de origem desconhecida estão sendo retransmitidos a partir do topo de um edifício comercial em Midtown. Identifique a unidade de hardware responsável, registre o endereço MAC de origem e desconecte a alimentação.")
                        .objectives("Triangular a fonte exata do sinal em Midtown;Registrar chave pública do transmissor;Desconectar unidade sem danificar o armazenamento interno")
                        .requirements("Acesso aos terraços técnicos requer credencial de manutenção simulada.")
                        .minReputation(1)
                        .reputationReward(10)
                        .locationName("Midtown, Nova York — EUA")
                        .region("AMÉRICA DO NORTE")
                        .latitude(40.7549)
                        .longitude(-73.9840)
                        .verificationPrompt("Informe o identificador de hardware do farol desconectado.")
                        .createdAt(LocalDateTime.now().minusMinutes(25))
                        .build(),

                Contract.builder()
                        .title("Proteção de Cabo Submarino no Canal de Suez")
                        .targetName("Estação de Aterragem Red-Sea 02")
                        .faction("Global Backbone Alliance")
                        .reward(34000.0)
                        .threatLevel(ThreatLevel.HIGH)
                        .status(ContractStatus.AVAILABLE)
                        .summary("Inspeção tática e remoção de grampo óptico em ponto de interconexão intercontinental no Egito.")
                        .briefing("Latências anômalas foram detectadas no tronco óptico que conecta a Europa à Ásia. Há indícios de acoplamento físico clandestino na caixa de junção costeira. O operador deve localizar o grampo óptico, removê-lo e restabelecer a integridade do link.")
                        .objectives("Inspecionar a câmara de junção costeira Red-Sea 02;Remover acoplador óptico clandestino;Validar atenuação do sinal abaixo de 0.2 dB")
                        .requirements("Reputação mínima 8. Operação noturna em zona costeira monitorada.")
                        .minReputation(8)
                        .reputationReward(15)
                        .locationName("Porto Said / Cairo — Egito")
                        .region("ORIENTE MÉDIO & ÁFRICA")
                        .latitude(30.0444)
                        .longitude(31.2357)
                        .verificationPrompt("Informe o código de diagnóstico óptico pós-remoção.")
                        .createdAt(LocalDateTime.now().minusMinutes(10))
                        .build()
        );

        contractRepository.saveAll(initialContracts);
        log.info("[AFTERHOURS] {} contratos geolocalizados semeados com sucesso.", initialContracts.size());
    }
}
