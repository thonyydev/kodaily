# AGENTS.md — Kodaily

> Instruções de trabalho para Codex e outros agentes de código. Leia este arquivo integralmente antes de modificar o projeto.
> O Kodaily está sendo reconstruído do zero com Expo SDK 58, preservando o projeto Supabase existente.

## 1. Missão e princípios

**Kodaily** é um diário de desenvolvimento para programadores: um lugar para acompanhar projetos, registrar sessões de programação e enxergar a evolução pessoal ao longo do tempo.

Princípios de produto, em ordem:
1. **Valor individual primeiro:** o app precisa ser útil com apenas um usuário, sem depender de comunidade.
2. **Registro sem fricção:** iniciar, finalizar e consultar uma sessão deve ser rápido e previsível.
3. **Confiabilidade dos dados:** nunca perder silenciosamente uma sessão ou exibir métricas inventadas.
4. **Interface premium e clara:** visual consistente, acessível, dark-first e apropriado para iOS e Android.
5. **Simplicidade sustentável:** preferir arquitetura modular e código explícito a abstrações e dependências prematuras.

### Público-alvo
Desenvolvedores iniciantes e experientes que querem entender quanto programam, em quais projetos trabalham e como evoluem.

### Escopo do MVP v1
- Autenticação por e-mail/senha usando o **Supabase Auth existente**.
- Sessão persistida e rotas privadas; login, cadastro, recuperação de senha quando possível com o setup atual e logout.
- Perfil básico do desenvolvedor, usando apenas campos realmente existentes no banco.
- CRUD de projetos do usuário (nome e demais campos conforme schema real).
- Registro de sessão de programação: início, pausa/retomada, fim, projeto, notas e tecnologias **quando compatíveis com o schema verificado**.
- Rascunho local de sessão em andamento para recuperar a UI após reabrir o app, sem alegar sincronização entre aparelhos.
- Home com resumo real (tempo programado, últimas sessões, projetos recentes e consistência quando houver dados suficientes).
- Histórico de sessões, com estados vazios e detalhes.
- Navegação nativa por abas e experiência cuidada de loading, erro, sucesso e estados sem dados.

### Fora do MVP — NÃO implementar sem solicitação explícita
- Feed social, seguir pessoas, curtidas, comentários, clubes, rankings.
- Integração com GitHub/WakaTime, sincronização automática de IDE, IA e recomendações.
- Assinaturas, paywall, XP complexo e gamificação competitiva.
- Push notifications, widgets, Android/iOS extensions e background tracking nativo.
- Modo offline com fila de sincronização; o rascunho local de sessão **não** é offline sync.

## 2. Stack e compatibilidade

- **Expo SDK 58 / React Native 0.88 / TypeScript estrito**.
- **Expo Router**, com `NativeTabs` de `expo-router/native-tabs` (API estável do SDK 58).
- **Supabase** (`@supabase/supabase-js`) como Auth + PostgreSQL já provisionados.
- **TanStack Query** para estado remoto, cache e invalidação de queries.
- **React Hook Form + Zod** para formulários que se beneficiem de validação; instalar/usar só quando necessário.
- **React Native / Expo** e componentes nativos compatíveis com **Expo Go SDK 58**.
- **AsyncStorage** e `react-native-url-polyfill` para a persistência da sessão Auth, seguindo o guia atualizado de React Native do Supabase; não adicionar outro mecanismo de Auth storage sem motivo.
- npm como gerenciador de pacotes, com `package-lock.json` versionado. Usar `npx expo install` para pacotes que dependem de compatibilidade com Expo.

**Restrição absoluta:** o usuário testa pelo Expo Go no iPhone; não exigir custom development build, Xcode, módulos nativos adicionais, EAS Build ou Mac para funcionar o MVP. Antes de instalar qualquer dependência nativa, confirmar compatibilidade com Expo Go 58. Caso não seja compatível, escolher alternativa suportada e explicar.

**Cuidados SDK 58:** não usar imports internos `react-native/Libraries/*`, APIs removidas do React Native 0.87/0.88, nem `expo-router/unstable-native-tabs`. Não importar diretamente APIs de `@react-navigation/*` para a navegação do app quando houver o equivalente do Expo Router.

Fontes técnicas de referência:
- https://expo.dev/changelog/sdk-58
- https://docs.expo.dev/router/advanced/native-tabs/
- https://docs.expo.dev/agents/codex/
- https://supabase.com/docs/guides/auth/quickstarts/react-native
- https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native

## 3. Supabase: regras inegociáveis

**O backend existe. Não crie outro projeto Supabase. Não presuma o schema.**

Antes de qualquer query persistente ou escrita:
1. Auditar as tabelas, colunas, tipos, constraints, relacionamentos, triggers e políticas RLS realmente disponíveis.
2. Priorizar inspeção **somente leitura** via MCP/CLI/SQL permitido. Se não houver acesso, documentar exatamente qual informação falta. **Nunca inventar colunas** nem simular que uma integração real está funcionando.
3. Conferir inicialmente estas tabelas **esperadas** do planejamento anterior: `profiles`, `projects`, `technologies`, `coding_sessions`, `session_technologies`. A existência exata, os campos e as policies precisam ser verificados. Outras tabelas, inclusive sociais, não são escopo do MVP.
4. Gerar/atualizar tipos TypeScript a partir do schema real quando houver um meio confiável; não criar tipos de banco fictícios.
5. Concentrar acesso ao Supabase em `src/lib/supabase/` e em repositórios por feature; nunca espalhar `.from(...)` por componentes de UI.
6. Respeitar RLS e o usuário autenticado. Não usar `service_role`, `secret key` ou credencial administrativa no aplicativo. Para acesso mobile, utilizar **publishable key** (`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
7. Não enfraquecer policies para “fazer funcionar”: `TO authenticated` sem predicado de propriedade não é isolamento de dados. Em policies de UPDATE, usar condições de propriedade para leitura/atualização e `WITH CHECK` conforme aplicável.
8. Não executar `DROP`, `TRUNCATE`, recriações destrutivas, alterações irreversíveis ou migrações no banco remoto sem aprovação explícita. Se precisar alterar schema, entregar proposta de migração SQL, impacto, riscos e procedimento de reversão antes de aplicá-la.
9. `EXPO_PUBLIC_*` é público no bundle. Jamais colocar service-role, segredos, connection strings com senha ou tokens pessoais nessas variáveis.
10. Não imprimir tokens, passwords, dados de sessões ou secrets em logs. `.env` deve estar ignorado pelo Git; apenas `.env.example` com placeholders vai para o repositório.
11. Dados de projetos e sessões são privados no MVP. Consultas precisam ser coerentes com RLS, filtragem/posse real e modelo de autenticação; jamais acessar dados de terceiros por IDs arbitrários.
12. Não considerar RLS habilitado como prova de policies corretas. Verificar separadamente operações `SELECT/INSERT/UPDATE/DELETE`, privilégios da Data API e ownership quando relevante.

### Configuração pública esperada
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Validar ausência/inconsistência dessas variáveis com mensagem amigável em desenvolvimento; não deixar a UI crashar de forma obscura.

## 4. Arquitetura esperada

O roteador vive em `src/app/` e deve ser **fino**. Lógica de negócio fica fora de arquivos de rota.

```text
src/
  app/
    _layout.tsx
    (auth)/
      sign-in.tsx
      sign-up.tsx
      forgot-password.tsx       # se suportado pelo fluxo de Auth atual
    (app)/
      _layout.tsx
      (tabs)/
        _layout.tsx
        index.tsx                # Hoje
        projects.tsx
        history.tsx
        profile.tsx
      session/                   # tela/modal de sessão ativa ou detalhes
      project/                   # criar/editar/detalhes, conforme necessário
  components/
    ui/                         # Button, Input, Card, EmptyState, etc.
    layout/
  features/
    auth/
    projects/
    sessions/
    dashboard/
    history/
    profile/
  lib/
    supabase/                   # client, database types e utilitários
    query/                      # QueryClient, query keys/providers
  shared/
    theme/                      # tokens, cores, spacing, typography
    hooks/
    utils/                      # datas, duração, erros
    types/
assets/
docs/
  architecture.md
  database-contract.md
  decisions.md                   # ADRs curtas, se justificadas
```

Adaptar apenas quando a estrutura existente tornar outra organização claramente mais simples. Nunca reorganizar tudo sem necessidade.

### Convenções
- Rotas: componentes pequenos; usar hooks, services e repositories da feature.
- Separar API (`repositories`/`services`), regras de negócio, hooks e UI.
- Hooks com prefixo `use`, componentes em `PascalCase`, funções/variáveis em `camelCase`.
- Evitar `any`, `@ts-ignore` e casts inseguros; quando inevitáveis, justificar no código.
- Nada de arquivos gigantes, dependências cíclicas ou imports relativos com muitos `../` quando um alias `@/` resolver.
- Não criar um estado global para dados que pertencem ao TanStack Query ou à tela.
- `QueryClient` único no topo, query keys consistentes e invalidação após mutações.
- Tratamento de erros tipado e mensagens amigáveis, sem vazar payloads sensíveis.
- Não criar mock de dados que parece produção. Dados de demonstração só em fixtures de teste explicitamente marcadas.
- Extrair funções puras para cálculo de duração, agrupamento por dia e streaks, com testes.

## 5. Design system — visual Kodaily

Direção: **minimalismo premium para devs**, escuro por padrão, sensação de ferramenta focada e agradável, não de dashboard empresarial genérico.

- Paleta semântica própria: `background`, `surface`, `surfaceElevated`, `border`, `text`, `textMuted`, `accent`, `success`, `warning`, `danger`.
- Base graphite/near-black, acento índigo/violeta discreto; acessibilidade acima de efeito visual.
- Escala consistente para `spacing`, `radii`, tipografia e estados de interação.
- Botões, inputs, cards, badges, banners e skeletons reutilizáveis; sem overengineering.
- Componentes reagem aos estados `loading`, `error`, `empty`, `success`, `disabled` e `submitting`.
- Safe areas, teclado, scroll, notch/Dynamic Island, light/dark do SO quando aplicável e dispositivos pequenos.
- Área de toque mínima próxima de 44×44 pt; feedback tátil apenas onde fizer sentido e for compatível com Expo Go.
- Respeitar acessibilidade, textos escaláveis, contraste, label de inputs e navegação por leitor de tela.
- Microinterações discretas, sem prejudicar FPS ou bloquear tarefas.
- **Não usar** imagens stock, gradientes exagerados, efeitos pesados ou componentes nativos indisponíveis no Expo Go apenas para parecer sofisticado.
- Textos e mensagens do aplicativo em **português do Brasil**; nomes técnicos e código em inglês.

### Navegação do MVP
`NativeTabs`: **Hoje, Projetos, Histórico, Perfil**. A ação principal “Iniciar sessão” deve ser visível na Home e pode abrir uma rota/modal do `Stack`, sem criar uma quinta aba inútil.

## 6. Regras específicas do domínio

### Projetos
- Exibir exclusivamente projetos do usuário autenticado, conforme schema/RLS reais.
- Validar nomes e campos suportados; desabilitar submissões duplicadas.
- Confirmar ações destrutivas se houver efeito sobre sessões relacionadas; nunca apagar sessões em cascata sem entendimento/consentimento explícitos.
- Refletir criação/edição/exclusão na UI via invalidação correta do cache.

### Sessões e cronômetro
- O tempo deve ser calculado a partir de timestamps/duração acumulada, **não** da quantidade de ticks de `setInterval`. O intervalo é apenas para atualizar a visualização.
- Suportar saída/retorno ao app e possíveis suspensões sem perder tempo acumulado. Usar `AppState` quando necessário.
- Persistir localmente rascunho de sessão ativa (incluindo pausa/retomada, quando implementada). Ao reiniciar, oferecer recuperação clara e evitar duplicidade.
- Armazenar datas em UTC/ISO ou no formato efetivo exigido pelo banco. Converter para fuso local na exibição e no cálculo de streaks por dia local.
- Validar duração positiva, datas coerentes e transições de estado. Bloquear duplo clique de finalização e gravações duplicadas.
- Quando a rede falhar ao finalizar, **não descartar o rascunho local**; permitir nova tentativa sem salvar duplicado.
- Não afirmar que o app rastreia o tempo automaticamente em outras aplicações ou em background. Trata-se de uma sessão iniciada pelo usuário.
- Tecnologia(s) por sessão apenas se a tabela de associação e seus relacionamentos reais permitirem.

### Estatísticas e dashboard
- Dados sempre derivados de sessões **persistidas** e filtradas pelo usuário; sessão em andamento pode ser exibida separadamente e rotulada como tal.
- Cards iniciais úteis: tempo total, tempo dos últimos 7 dias, sessões recentes e projetos ativos, conforme schema/consulta suportar.
- Streaks devem seguir calendário local, sem duplicar múltiplas sessões no mesmo dia e sem tratar dias futuros como atividade.
- Ao faltar dados, mostrar zero/empty state honesto e convite para iniciar a primeira sessão.
- Não inventar precisão ou preencher gráficos com valores fictícios.

## 7. Qualidade, testes e verificação

### Testar especialmente
- Cálculo de duração, pausa/retomada, retorno de background e recuperação de rascunhos.
- Streaks, datas, ordenação e agrupamento do histórico.
- Auth: login, logout, loading inicial, sessão expirada, troca de usuário e estados de confirmação por e-mail.
- Formulários: validação, double submit e erros do Supabase.
- Queries/mutações: cache invalidado, isolamento do usuário e tratamento de falha de rede.
- Projetos excluídos/renomeados com sessões associadas.

### Verificações em cada etapa
Rodar comandos que existirem e reportar os resultados, sem ocultar falhas:
```bash
npx tsc --noEmit
npm run lint
npm test -- --runInBand     # somente se o runner realmente aceitar esta flag
npx expo-doctor
```
- Ajustar a execução de testes ao runner real; por exemplo, Vitest geralmente usa `npm test -- --run`.
- Não declarar “testado no iPhone/Expo Go” sem teste físico ou evidência correspondente.
- Se não for possível executar por falta de credenciais/dispositivo, declarar precisamente o bloqueio.
- Corrigir warnings relevantes criados nesta tarefa; não fazer refactors desconexos.
- Confirmar versão real do SDK, dependências instaladas e compatibilidade Expo Go.

## 8. Como executar qualquer tarefa

1. Ler `AGENTS.md`, inspecionar arquivos relevantes e identificar o escopo solicitado.
2. Escrever um plano curto para mudanças com várias etapas; não começar por refatoração ampla.
3. Confirmar APIs/documentação oficiais quando SDK 58 ou Supabase estiver envolvido.
4. Fazer mudanças pequenas, completas e tipadas, evitando regressões.
5. Validar tipos, lint, testes pertinentes e Expo Doctor quando aplicável.
6. Atualizar docs se houver mudança de arquitetura ou contrato de dados.
7. Encerrar com **resumo**, **arquivos alterados**, **comandos executados + resultados**, **pendências** e **próxima etapa sugerida**.

### Restrições de execução
- Não criar novo backend, não resetar o projeto Supabase e não instalar serviços externos sem necessidade.
- Nunca apagar dados do usuário, executar migração remota, alterar RLS, publicar loja/app ou realizar deploy sem pedido explícito.
- Não fazer `git commit`, `git push`, abrir PR ou merge automaticamente, salvo instrução explícita.
- Não sobrescrever decisões recentes do usuário só porque a estrutura sugerida aqui é diferente.
- Não expandir o escopo do MVP sob o pretexto de “aproveitar a oportunidade”.
- **Priorizar uma feature realmente funcional sobre muitas telas bonitas sem backend.**

## 9. Definition of Done por etapa

Uma feature só está concluída quando:
- Funciona no fluxo real previsto com Supabase (quando acesso/configuração estiverem disponíveis).
- Respeita usuário autenticado, ownership e RLS existentes.
- Possui estados de loading, erro e vazio quando relevantes.
- Tem validação e proteção contra ações duplicadas.
- Usa componentes/tokens reutilizáveis do design system.
- Não introduz dependência incompatível com Expo Go SDK 58.
- Passa nos checks pertinentes; se algum não passar, há diagnóstico explícito.
- A documentação e o resumo final representam o que foi **de fato implementado**, sem alegações falsas.

## 10. Ordem recomendada de implementação

1. Bootstrap Expo 58 + tooling.
2. Auditoria e contrato do Supabase existente.
3. Design system + navegação base.
4. Auth + sessão persistida + proteção de rotas.
5. Projetos (CRUD).
6. Sessões (cronômetro + rascunho + persistência).
7. Home + histórico + estatísticas reais.
8. Perfil + tratamento de erros e estados vazios.
9. Revisão de segurança, testes e experiência no Expo Go.

**Não pule a etapa de auditoria do Supabase antes de desenvolver operações de banco.**
