# AFTERHOURS // Frontend Web (`edgerunner-web`)

Interface web da plataforma ficcional **AFTERHOURS**, desenvolvida como parte de um exercício prático de experimentação com o **Google Antigravity** para adiantar os estudos de **React** antes do módulo oficial no Curso Técnico em Desenvolvimento de Sistemas do **SENAI**.

> Para a documentação completa do projeto, contexto acadêmico, instruções do backend Spring Boot e arquitetura geral, consulte o [README principal na raiz do repositório](../README.md).

## Stack do Frontend

- **React 19** + **TypeScript** + **Vite**
- **React Router DOM** (Rotas públicas, autenticação e área operacional protegida)
- **Tailwind CSS** (Design system *Nocturnal Operations Terminal*)
- **Axios** (Comunicação com a API Spring Boot em `http://localhost:8080` e interceptores JWT)
- **MapLibre GL JS** (Mapa mundial interativo com coordenadas WGS84)
- **Framer Motion** & **Lucide React** (Animações e ícones)

## Scripts Disponíveis

Na pasta `edgerunner-web/`, execute:

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Vite HMR)
npm run dev

# Compilar para produção (TypeScript + Vite Build)
npm run build

# Executar verificação estática com Oxlint
npm run lint
```
