# Fundação do Kodaily

Esta etapa contém somente interface e navegação. Não há autenticação, conexão com banco, dados simulados, cronômetro ou persistência. O `AGENTS.md` continua sendo a referência de produto e segurança.

## Organização

```text
src/
  app/
    +html.tsx                   # HTML Web em pt-BR
    _layout.tsx                 # tema de navegação, status bar e Stack raiz
    (app)/
      _layout.tsx               # Stack: abas e páginas externas às abas
      (tabs)/                   # Hoje, Projetos, Histórico, Perfil
      session/index.tsx         # apresentação provisória do recurso
  components/
    app-tabs.tsx                # NativeTabs para iOS e Android
    app-tabs.web.tsx            # abas Web de expo-router/ui
    layout/                     # AppScreen e ScreenHeader
    ui/                         # componentes compartilhados
  features/
    dashboard/screens/
    projects/screens/
    history/screens/
    profile/screens/
    sessions/screens/
  shared/
    components/atoms/pressable/  # Reacticx adaptado, consumido por AppButton
    types/pressable/            # reexport do tipo público, sem duplicação
    theme/                      # tokens Minimal Terminal e tema de navegação
tests/                          # contraste, dimensões e contrato de pressão
```

As rotas reexportam telas das features. Os aliases `@/*` e `@/assets/*` foram preservados. Não há diretórios vazios, providers remotos ou abstrações para funcionalidades ainda ausentes. Hooks, utilitários, repositórios e integrações serão adicionados quando houver uso concreto, nos locais definidos em `AGENTS.md`.

## Navegação e plataformas

- `NativeTabs` usa o entry point estável `expo-router/native-tabs` do SDK 58, com SF Symbols no iOS e Material Symbols no Android.
- A Web usa `Tabs`, `TabList`, `TabTrigger` e `TabSlot` de `expo-router/ui`. A barra faz parte do fluxo, sem cobrir o conteúdo. `TabButton` mantém a adaptação tipada do `ref` de `View` para a instância de `Pressable`, sem casts.
- As abas Web são links em um landmark de navegação, com `aria-current="page"`, foco visível e ativação por Enter. Não simulam o padrão ARIA de painéis com navegação por setas. Estados de botão usam `aria-disabled` e `aria-busy`, reconhecidos por React Native e React Native Web.
- O HTML Web preserva `headNodes` e `bodyNodes` de `useServerDocumentContext`, incluindo scripts de hidratação do SDK 58, e aplica `env(safe-area-inset-*)` no body. A opção `web.output: "server"` existente foi mantida.
- O Stack de `(app)` recebe páginas fora das abas. `/session` é informativa e tem retorno com fallback para `/` em acesso direto. Nenhum tempo é contado ou salvo.
- O Stack raiz permite adicionar futuramente `(auth)` e proteção de rotas. O nome `(app)` não representa autenticação nesta etapa.
- `AppScreen` é um ScrollView com largura máxima, espaçamento e safe areas. No iOS, preserva os insets automáticos de NativeTabs; no Android, o navegador fornece o inset inferior, e a tela cuida dos demais. Fora das abas, todos os insets são tratados pela tela.
- Modo escuro fixo nesta etapa, inclusive navegação, HTML e status bar. Nenhum limite de escala de fonte ou altura fixa é aplicado ao texto. Conteúdo e botões podem crescer e rolar.

## Dependências e assets

Priorizar os pacotes instalados. `expo-symbols` fornece ícones nas três plataformas; a tipografia usa fontes do sistema. O único componente Reacticx copiado é o `pressable`, com seus recursos de provider, animações, long press, feedback e blur preservados e adaptados ao AppButton. Além de Reanimated/Worklets existentes, usa `expo-blur ~58.0.5` e `expo-haptics ~58.0.7`, instalados pelo Expo para o SDK 58/Expo Go. A licença MIT permanece junto ao código. A configuração `component.config.json` resolve os padrões do CLI sem precisar explicitá-los; não executar `init` novamente. Detalhes de acessibilidade e diferenças por plataforma em `design-system.md`.

O `PressableProvider` fica dentro do ThemeProvider na raiz, sem mudar Stack ou abas. Centraliza os padrões e observa movimento/transparência reduzidos uma vez para seus consumidores. `context.tsx` mantém esse contexto; `feedback.ts` faz o mapeamento para haptics de cada plataforma e trata falhas opcionais sem interromper ações. `index.tsx` mantém os reconhecedores nativos e animações, encaminha props nativas e desenha o blur atrás do conteúdo. Os tipos extraídos reexportam a definição local, evitando cópias divergentes.

Removidos `expo-device`, `expo-image` e `expo-web-browser`, usados exclusivamente pelo starter. O Router ainda referencia `@expo/ui`, `expo-glass-effect` e os pacotes de gestos/animação; eles foram preservados, assim como a configuração SQLite e o cliente Supabase preexistentes. Nenhuma integração ou armazenamento foi implementado.

Os exemplos, componentes e script de reset do starter foram removidos após revisar os imports. Assets de ícone/launcher referenciados em `app.json` permanecem: uma identidade de ícone de instalação não faz parte desta etapa. O splash configurado agora usa apenas o fundo Minimal Terminal; Expo Go pode exibir seu próprio splash.

## Verificação

```sh
npx tsc --noEmit
npm run lint
npm test
npx expo-doctor@latest
npx expo export --platform all
git diff --check
```

Os testes usam o runner nativo do Node e o TypeScript já instalado para carregar os tokens puros, sem alterar o formato de módulos do aplicativo. Os testes do pressable substituem o runtime nativo/animação para conferir props, callbacks, reset ao desabilitar, movimento/transparência reduzidos, configurações do provider, long press nativo, blur e falha de haptics; não medem FPS nem simulam gestos nativos. Exportar bundles não valida o comportamento do sistema nativo. No Expo Go SDK 58, conferir as quatro abas, safe areas, rolagem até o último item, fontes ampliadas, VoiceOver/TalkBack, feedback ao pressionar/cancelar, movimento/transparência reduzidos e abrir/voltar da apresentação de sessão. Na Web, conferir teclado, foco, acesso direto a `/session`, quatro abas e largura de 320 px.

Próxima etapa funcional: auditar o Supabase existente, documentar schema/RLS e só então implementar Auth, conforme `AGENTS.md`.

Referências: [NativeTabs e safe areas](https://docs.expo.dev/router/advanced/native-tabs/), [abas Web](https://docs.expo.dev/router/advanced/custom-tabs/), [SDK 58](https://expo.dev/changelog/sdk-58).
