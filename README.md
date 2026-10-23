# Kodaily

Diário de desenvolvimento para acompanhar projetos, sessões de programação e evolução pessoal.

Esta branch implementa a fundação visual Minimal Terminal 2.0 e a navegação. Autenticação, banco de dados, cronômetro e CRUD ainda não estão disponíveis. As telas mostram estados vazios explícitos.

## Executar

Requisitos: Node 22.18+ (ou 24+), npm e Expo Go compatível com SDK 58.

```sh
npm ci
npm start
```

Leia o QR code no Expo Go do iPhone ou Android. Para Web, execute `npm run web`. O app usa Expo SDK 58, React Native 0.88 e TypeScript estrito; nenhuma etapa exige development build.

## Validação

```sh
npx tsc --noEmit
npm run lint
npm test
npx expo-doctor@latest
npx expo export --platform all
git diff --check
```

O runner de testes é o nativo do Node; não usa `--runInBand`. Bundles exportados são artefatos locais e não equivalem a testes físicos.

## Documentação

- [Instruções do projeto](AGENTS.md)
- [Arquitetura e navegação](docs/architecture.md)
- [Design system Minimal Terminal 2.0](docs/design-system.md)

O Supabase existente permanece sem integração nesta etapa. A auditoria de schema e RLS é obrigatória antes de desenvolver operações de banco.
