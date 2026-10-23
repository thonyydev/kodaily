# Minimal Terminal 2.0

Evolução do Minimal Terminal: recuperar a personalidade terminal/Linux nos elementos existentes, preservando a ordem das telas, a leitura e o respiro. O fundo grafite azulado e o ciano continuam iguais. Cada seção tem um destaque dominante; identificadores técnicos complementam os nomes claros em português.

## Tokens e tipografia

A paleta semântica em `src/shared/theme/tokens.ts` permanece:

| Papel                                 | Cor                               |
| ------------------------------------- | --------------------------------- |
| background                            | `#0C1116`                         |
| surface / surfaceElevated             | `#131C23` / `#1C2831`             |
| border / divider                      | `#2B3B45` / `#22313A`             |
| text / textMuted / textDisabled       | `#E8EFF2` / `#A0B2BC` / `#758892` |
| accent / accentPressed / accentSubtle | `#81C8D0` / `#69B1BA` / `#193239` |
| onAccent                              | `#0C1116`                         |
| success / warning / danger            | `#A3CFA5` / `#E6C185` / `#EC9B9B` |
| pressed / focus                       | `#293F49` / `#B3E4E8`             |

Ciano destaca ações; verde e âmbar ficam reservados a sucesso e avisos reais. Indisponibilidade de recursos é explicada em texto neutro, sem badges decorativos. `textDisabled` fica restrito a controles inativos. Os testes de contraste AA e de tamanho mínimo de toque foram preservados.

São as mesmas seis variantes: title 28/36, heading 20/28, body 16/25, label 16/24, caption 13/20 e mono 13/21 (tamanho/entrelinha). Sans continua na leitura, nos títulos, botões e navegação. Mono identifica datas, horários, duração, status reais e identificadores curtos. O único ajuste tipográfico de token é `fontVariant: ['tabular-nums']` em `mono`, para manter numerais alinhados; não há novos tamanhos ou fontes.

Fontes nativas de `fonts.ts`: System/Menlo no iOS, sans-serif/monospace no Android e fontes do sistema na Web. Não há fonte remota nem limite artificial de escala.

Spacing preservado: 4, 8, 12, 16, 24, 32, 48 e 64 pt. Blocos separados por 32 pt; largura máxima de 720 pt, em coluna única. Raios e toque mínimo de 48 pt preservados. O painel existente recebe `surface`, borda de 1 pt em `divider` e raio `md` de 6 pt. O CTA usa ciano; a borda é neutra. Não há alturas fixas de texto, sombras ou animações decorativas.

## Composição

- **Hoje:** o glifo `>_` substitui o símbolo de código da marca, com a mesma linha de nome e data. A área de foco já existente recebe a superfície e borda de AppCard, com padding de 16 pt, sem título de janela ou novos filhos. Mensagem, CTA e explicação permanecem. `atividade.log` substitui o ícone do estado vazio, preservando “Atividade recente” como título. Não há contador, badge, status de execução ou métrica preparatória.
- **Projetos:** `~/projetos` ocupa o lugar do ícone de pasta. O título e o estado vazio continuam em português; não existe árvore de arquivos.
- **Histórico:** `historico.log` passa do subtítulo da tela ao lugar do ícone no estado vazio. O título “Histórico” permanece primeiro, sem identificador duplicado, trilho ou timestamps inventados.
- **Perfil:** `perfil.sys` substitui o ícone de pessoa, mantendo o título, a indisponibilidade da conta e a seção sobre o app. Não há saída de comandos, avatar ou informação pessoal simulada.
- **Apresentação de sessão:** mesmo retorno e conteúdo; AppCard compartilha a borda neutra e cantos mais retos do painel de foco.

Cada tela tem um ou dois detalhes identitários marcantes. Os identificadores são legendas visuais, não arquivos ou serviços reais. O prompt da marca é decorativo e fica oculto do leitor de tela; nenhuma ação depende de compreendê-lo. Não foram acrescentadas linhas de conteúdo ou novos componentes visuais. A lógica de data e navegação permanece igual.

Não há comandos, terminal simulado ou dados de demonstração. Estatísticas serão introduzidas progressivamente quando existirem dados reais e utilidade concreta.

## Componentes

| Componente    | Direção                                                                            |
| ------------- | ---------------------------------------------------------------------------------- |
| AppScreen     | Safe areas e scroll preservados; coluna de leitura e respiro entre blocos          |
| AppText       | Sans por padrão; família mono apenas na variante `mono`                            |
| AppButton     | Sans, toque de 48 pt, spring e haptics suaves; blur secundário; foco preservado |
| AppCard       | Superfície discreta, borda neutra de 1 pt e raio de 6 pt; sem cabeçalho de janela  |
| AppIcon       | Ícones decorativos ocultos do leitor; neutros por padrão e sem molduras            |
| ScreenHeader  | Título obrigatório; descrição e identificador mono opcionais, sem marcadores       |
| SectionHeader | Apenas título sans, sem borda ou descrição redundante                              |
| EmptyState    | Ícone ou identificador mono no mesmo espaço, título e descrição; sem card ou fundo |

EmptyState aceita `icon` ou `identifier`, mutuamente exclusivos nos tipos. O identificador substitui o ícone e não cria um novo nível de cabeçalho. AppCard mantém somente props de View; não há labels ou variantes novas de painel. Navegação nativa, ref Web, safe areas, fonte ampliada, foco, loading/disabled e retorno permanecem preservados.

## Feedback de toque — Reacticx

O `AppButton` usa o [pressable do Reacticx](https://github.com/rit3zh/reacticx/tree/main/src/components/atoms/pressable), copiado pelo CLI 0.2.0 após `list` e `info`. Código e licença MIT em `src/shared/components/atoms/pressable/`; tipos públicos em `src/shared/types/pressable/` reexportam a definição local.

Minimalismo se refere à composição, não à quantidade de recursos técnicos. A cópia mantém provider/contexto, pressão e long press, spring ou timing configuráveis, escala, opacidade, rotação, translação, worklet customizado, blur estático/animado, tipos de haptics, callback opcional de som e callback global com opt-out. Recursos podem ser configurados por controle sem ampliar a API do AppButton.

O `PressableProvider` na raiz centraliza os padrões e acompanha mudanças nas preferências de movimento e transparência reduzidos. Não altera o roteamento. Long press usa o reconhecedor nativo de Pressable, que cancela ao rolar e dispara uma vez; substitui o timer manual para evitar ativações após cancelamento. Sem `onLongPress`, nenhum comando ou gesto novo é criado. Props de estado, foco, aria, loading/disabled e callbacks nativos são encaminhadas. Shared values usam `get`/`set` para React Compiler; animação customizada retorna `ViewStyle` e precisa ser um worklet.

Tokens `motion`: escala de pressão `0.98`, escala de long press `0.96`, timing padrão `100` ms, limiar de long press `500` ms e spring `{ damping: 26, stiffness: 360, mass: 0.7 }`. O provider habilita spring nos botões; timing é usado com `useSpring: false`. O retorno fixo em 140 ms foi substituído pelo spring. Somente conteúdo se move; fundo, foco e área de toque ficam estáveis. A cor pressionada é imediata. Movimento reduzido mantém o conteúdo imóvel, inclusive para worklets customizados, sem impedir ações ou haptics. Sem provider, animações usam `ReduceMotion.System`; com provider, seguem a preferência atual observada, inclusive quando ela muda após abrir o app. Desabilitar durante uma pressão restaura o estado.

Tokens `effects.buttonBlur`: intensidade `12`, pressionado `20`. “Voltar” usa uma camada escura, recortada nos mesmos cantos e atrás do rótulo; o CTA mantém o ciano sólido. A base opaca permanece para acessibilidade e fallback. Não se desfoca o texto nem se muda a hierarquia. O blur é desligado em controles indisponíveis ou com “Reduzir transparência” ativo no iOS.

“Iniciar sessão” e “Voltar” recebem um impacto suave ao pressionar. Seleção, sucesso, aviso e erro continuam disponíveis, mas não são disparados sem uma ação real correspondente. O componente não aguarda haptics ou animações para navegar; falha de hardware não bloqueia a ação e gera somente aviso estático em desenvolvimento. O hook de som permanece opcional, sem áudio adicionado.

### Compatibilidade de efeitos

| Plataforma | Blur | Haptics |
| --- | --- | --- |
| iOS / Expo Go 58 | `expo-blur`, intensidade animada; respeita Reduzir transparência | Taptic Engine, impacto `Soft` nos botões; o sistema pode suprimi-lo em economia de energia ou pelas preferências |
| Android 12+ / Expo Go 58 | `BlurTargetView` e `dimezisBlurViewSdk31Plus`; intensidade percebida pode diferir do iOS | `performAndroidHapticsAsync`; impacto suave usa `Context_Click`, seleção usa `Segment_Tick` |
| Android anterior ao 12 | Superfície translúcida pelo fallback oficial, evitando o custo de RenderScript | Mecanismo nativo, sujeito ao hardware e às preferências |
| Web | backdrop-filter do Expo; intensidade animada via estilo, conforme seu adaptador Web; sem filtro, conserva superfície e texto | API do Expo, dependente do navegador/hardware; sem promessa de vibração no desktop |

No Android, sem `blurTarget` externo, o pressable cria um alvo local com a cor da superfície do controle: o material não captura nem desfoca o rótulo. Para desfocar conteúdo externo real, `BlurConfig` aceita `blurTarget`, `blurMethod` e `blurReductionFactor`; o alvo externo deve ser um `BlurTargetView` separado da camada de blur. A interface atual não simula conteúdo sob o botão para exagerar o efeito.

Adicionados somente `expo-blur ~58.0.5` e `expo-haptics ~58.0.7`, via `npx expo install`, compatíveis com Expo Go. Reanimated 4.7.1, Worklets 0.13.0 e Gesture Handler já estavam instalados. Não é necessário Development Build. Configuração Reacticx intacta; `init` não executado. Futuras cópias com `--overwrite` precisam reaplicar e revisar as correções locais. Não foram instalados outros componentes ou exemplos: os recursos recuperados enriquecem as ações existentes, sem novos fluxos ou redesign.

Referências: [Expo BlurView e Android](https://docs.expo.dev/versions/latest/sdk/blur-view/), [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/), [Reanimated e React Compiler](https://docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue/).
