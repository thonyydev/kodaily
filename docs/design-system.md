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
| AppButton     | Sans, toque de 48 pt, pressão e foco preservados; sem borda adicional              |
| AppCard       | Superfície discreta, borda neutra de 1 pt e raio de 6 pt; sem cabeçalho de janela  |
| AppIcon       | Ícones decorativos ocultos do leitor; neutros por padrão e sem molduras            |
| ScreenHeader  | Título obrigatório; descrição e identificador mono opcionais, sem marcadores       |
| SectionHeader | Apenas título sans, sem borda ou descrição redundante                              |
| EmptyState    | Ícone ou identificador mono no mesmo espaço, título e descrição; sem card ou fundo |

EmptyState aceita `icon` ou `identifier`, mutuamente exclusivos nos tipos. O identificador substitui o ícone e não cria um novo nível de cabeçalho. AppCard mantém somente props de View; não há labels ou variantes novas de painel. Nenhum componente ou dependência foi criado. Navegação nativa, ref Web, safe areas, fonte ampliada, foco, loading/disabled e retorno permanecem preservados.
