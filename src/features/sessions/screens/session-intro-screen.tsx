import { useRouter } from 'expo-router';

import { AppScreen } from '@/components/layout/app-screen';
import { ScreenHeader } from '@/components/layout/screen-header';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';

export default function SessionIntroScreen() {
  const router = useRouter();

  return (
    <AppScreen outsideTabs>
      <AppButton
        label="Voltar"
        icon="back"
        variant="secondary"
        onPress={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
      />
      <ScreenHeader
        title="Sessões de programação"
        description="O cronômetro e o salvamento de sessões ainda estão em preparação."
      />
      <AppCard>
        <AppText variant="label" accessibilityRole="header">
          Como vai funcionar
        </AppText>
        <AppText color="textMuted">
          Você poderá registrar o tempo dedicado a um projeto e guardar notas
          sobre o que fez e aprendeu.
        </AppText>
      </AppCard>
    </AppScreen>
  );
}
