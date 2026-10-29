# AFTERHOURS // Edgerunners Bounty System

Plataforma full-stack ficcional de gerenciamento de contratos táticos geolocalizados, carteira de recompensas auditável e progressão de reputação de operadores.

---

## Sobre o Projeto e Contexto de Aprendizado

> [!IMPORTANT]
> **Aviso sobre o propósito deste repositório:** Este projeto **não** deve ser considerado uma peça de portfólio principal, mas sim um **exercício prático de experimentação e estudo guiado**.

Este sistema nasceu como uma exploração prática utilizando o **Google Antigravity** para acelerar a prototipação, conectar conceitos arquiteturais e experimentar novas tecnologias de interface sobre uma base de backend já conhecida:

1. **Domínio do Backend (SENAI):** Toda a base arquitetural do servidor — API REST com Java e Spring Boot, modelagem relacional com Spring Data JPA / Hibernate, banco de dados MySQL e autenticação stateless via Spring Security e JWT — reflete os conhecimentos que já consolidei durante o meu **Curso Técnico em Desenvolvimento de Sistemas no SENAI**.
2. **Primeiro Contato com React no Frontend:** Possuo conhecimentos básicos em HTML, CSS e JavaScript puro, mas este projeto representa meu **primeiro contato prático com React** (junto com TypeScript e Tailwind CSS). Como irei iniciar o módulo formal de React no SENAI ainda este mês, utilizei o Google Antigravity para adiantar conceitos como componentização, *Hooks* (`useState`, `useEffect`, `useMemo`, `useContext`), roteamento com React Router e integração com APIs REST via Axios.
3. **Escopo Deliberado (Sem Docker e Sem Testes Automatizados):** Como ainda não estudei containerização com **Docker** nem **testes automatizados** (unitários/integração) na grade curricular do curso técnico até o momento, optei conscientemente por deixá-los fora do escopo deste exercício para focar nas camadas que já domino ou que estou adiantando agora.

---

## Visão Geral do Sistema

O projeto evoluiu do conceito inicial de um mural de contratos cyberpunk (*Edgerunners*) para o terminal operacional **AFTERHOURS**: uma rede privada ficcional onde operadores independentes consultam dossiês geolocalizados ao redor do globo (coordenadas reais WGS84), aceitam missões compatíveis com seu nível de reputação, submetem hashes de conclusão e acompanham seu extrato financeiro fictício.

### Principais Funcionalidades

- **Autenticação e Controle de Acesso (RBAC):** Registro e login de operadores com senhas criptografadas via `BCrypt` e emissão de tokens `JWT` (perfis `OPERATOR` e `ADMIN`).
- **Catálogo Global e Cartografia Interativa (WGS84):** Visualização de contratos em grade, mapa mundial interativo (**MapLibre GL JS**) ou visão híbrida, com filtros combinados de risco (`LOW`, `MEDIUM`, `HIGH`, `PSYCHO`), região geográfica, status e elegibilidade por reputação.
- **Ciclo de Vida Transacional de Operações:**
  - Vinculação de contratos disponíveis (`AVAILABLE` -> `ACCEPTED`) com validação de reputação mínima no servidor.
  - Sala de Operações com checklist tático de objetivos e submissão de comprovante/hash de execução.
  - Liquidação idempotente (`COMPLETED`) com crédito automático na carteira fictícia, registro de transação no ledger, evento de progressão de reputação e notificação interna.
- **Dossiê do Operador e Extrato Auditável:** Personalização de identidade (*callsign*, especialização, biografia e insígnia) e consulta ao histórico completo de movimentações de créditos e reputação.
- **Painel Administrativo Geoespacial:** Exclusivo para `ROLE_ADMIN`, permitindo criar e editar contratos clicando diretamente no mapa mundial para capturar latitude e longitude, além de monitorar métricas globais da rede.
- **Modo Demonstração (Contingência Offline):** Caso o backend Spring Boot não esteja em execução, a tela de login oferece acesso explícito a um modo de demonstração local para permitir a inspeção da interface React.

---

## Tecnologias Utilizadas

### Backend (`src/main/java/com/guidaerique/edgerunners`)
- **Java 17** e **Spring Boot**
- **Spring Web (MVC):** Construção dos endpoints REST.
- **Spring Data JPA / Hibernate:** Persistência relacional e mapeamento objeto-relacional.
- **Spring Security + JJWT (`0.12.6`):** Autenticação stateless via Bearer Token JWT e autorização baseada em papéis (`@PreAuthorize`).
- **MySQL (`mysql-connector-j`):** Banco de dados relacional.
- **Springdoc OpenAPI (`2.8.5`):** Documentação interativa da API via Swagger UI.
- **Lombok:** Redução de código boilerplate nas entidades e serviços.

### Frontend (`edgerunner-web/`)
- **React 19** com **TypeScript** e **Vite**
- **React Router DOM:** Roteamento entre área pública cinematográfica, autenticação e rotas protegidas do terminal.
- **Tailwind CSS:** Estilização utilitária seguindo a paleta *Nocturnal Operations Terminal*.
- **Axios:** Cliente HTTP configurado com interceptores de requisição e resposta para envio e validação do token JWT.
- **MapLibre GL JS:** Renderização de mapas vetoriais/raster interativos com suporte a coordenadas WGS84.
- **Framer Motion & Lucide React:** Transições visuais controladas (com suporte a `prefers-reduced-motion`) e iconografia técnica.

---

## Estrutura do Repositório

```text
edgerunners/
├── pom.xml                                  # Configuração Maven e dependências do Backend
├── src/main/
│   ├── java/com/guidaerique/edgerunners/
│   │   ├── config/                          # OpenApiConfig (Swagger) e DataInitializer (Seed inicial)
│   │   ├── controller/                      # AuthController, ContractController, OperatorController, AdminController
│   │   ├── model/                           # Entidades JPA: Hunter, Contract, Operation, WalletTransaction, ReputationEvent, Notification
│   │   ├── repository/                      # Interfaces Spring Data JPA
│   │   ├── security/                        # SecurityConfig, JwtService, JwtAuthenticationFilter, CustomUserDetailsService
│   │   ├── service/                         # AfterhoursDomainService (Regras de negócio e transações)
│   │   └── EdgerunnersApplication.java      # Ponto de entrada da aplicação Spring Boot
│   └── resources/
│       └── application.properties           # Configurações de conexão MySQL, JPA e chave JWT
└── edgerunner-web/                          # Aplicação Frontend (React + TypeScript + Vite)
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── components/                      # Layouts, rotas protegidas, cards de contrato, drawer de briefing e mapa tático
        ├── context/                         # AuthContext (sessão JWT/Demo) e ImmersionContext (preferências visuais/áudio)
        ├── pages/                           # Landing, Login, Register, Dashboard, Market, MyContracts, Profile, Admin
        ├── services/                        # Configuração do Axios (api.ts) e sincronização de contratos
        └── types/                           # Interfaces TypeScript espelhando o domínio do backend
```

---

## Como Executar o Projeto Localmente

### Pré-requisitos
- **Java JDK 17** ou superior
- **Maven** (ou utilização do wrapper/IDE de sua preferência)
- **MySQL Server** ativo na porta `3306`
- **Node.js** (v18+) e **npm**

### 1. Executando o Backend (Spring Boot)

1. Certifique-se de que o serviço do MySQL está rodando localmente.
2. Verifique as credenciais em `src/main/resources/application.properties` (por padrão configurado para usuário `root` e senha `root`, criando automaticamente o banco `edgerunner_db` caso não exista).
3. Na raiz do projeto, execute:
   ```bash
   mvn spring-boot:run
   ```
4. O servidor iniciará em `http://localhost:8080`.
5. A documentação interativa do **Swagger UI** estará disponível em: `http://localhost:8080/swagger-ui.html`.

#### Contas Semeadas Automaticamente em Desenvolvimento (`DataInitializer`)
Ao iniciar o banco pela primeira vez em ambiente local, o sistema cria automaticamente 8 contratos geolocalizados e duas contas de teste:
- **Operador:** usuário `operador` | senha `afterhours`
- **Administrador:** usuário `admin` | senha `admin123`

### 2. Executando o Frontend (React + Vite)

1. Em um novo terminal, acesse a pasta do frontend:
   ```bash
   cd edgerunner-web
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```
4. Acesse a aplicação no navegador pelo endereço indicado no terminal (geralmente `http://localhost:5173`).

---

## Principais Endpoints da API

| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Público | Registra um novo Operador com reputação inicial 1 e saldo 0. |
| `POST` | `/auth/login` | Público | Autentica credenciais e retorna o Bearer Token JWT. |
| `GET` | `/api/contracts/public-preview` | Público | Retorna uma amostra de contratos disponíveis para a Landing Page. |
| `GET` | `/api/contracts` | Autenticado | Lista todos os contratos cadastrados na rede. |
| `PATCH` | `/api/contracts/{id}/accept` | Autenticado | Vincula o contrato ao operador logado após validar sua reputação. |
| `POST` | `/api/operations/{id}/submissions` | Autenticado | Submete o hash de conclusão, liquida a recompensa e atualiza reputação. |
| `GET` | `/api/operators/me` | Autenticado | Retorna os dados do perfil, contadores operacionais e saldo atual. |
| `PATCH` | `/api/operators/me` | Autenticado | Atualiza *callsign*, especialização, biografia e insígnia do operador. |
| `GET` | `/api/wallet` | Autenticado | Retorna o extrato de transações da carteira e eventos de reputação. |
| `GET` | `/api/notifications` | Autenticado | Lista as notificações internas associadas à conta do operador. |
| `POST` | `/api/admin/contracts` | `ROLE_ADMIN` | Publica um novo contrato geolocalizado no catálogo. |
| `PUT` | `/api/admin/contracts/{id}` | `ROLE_ADMIN` | Edita parâmetros, briefing e coordenadas de um contrato existente. |
| `GET` | `/api/admin/metrics` | `ROLE_ADMIN` | Retorna indicadores globais da plataforma. |

