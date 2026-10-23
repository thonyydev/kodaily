import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { AppScreen } from '@/components/layout/app-screen';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { EmptyState } from '@/components/ui/empty-state';
import { spacing } from '@/shared/theme';

export default function TodayScreen() {
  const router = useRouter();
  const [today, setToday] = useState<string>();

  useFocusEffect(
    useCallback(() => {
      setToday(
        new Date().toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
        }),
      );
    }, []),
  );

  return (
    <AppScreen>
      <View style={styles.context}>
        <View style={styles.brand}>
          <AppText variant="mono" color="accent" aria-hidden>
            {'>_'}
          </AppText>
          <AppText variant="label">kodaily</AppText>
        </View>
        <AppText variant="mono" color="textMuted">
          {today ?? 'Contexto do dia'}
        </AppText>
      </View>

      <AppCard style={styles.focus}>
        <AppText variant="title" accessibilityRole="header">
          Seu momento de foco.
        </AppText>
        <AppButton
          label="Iniciar sessão"
          icon="play"
          onPress={() => router.navigate('/session')}
          accessibilityHint="Abre uma apresentação do recurso, ainda em preparação"
        />
        <AppText variant="caption" color="textMuted">
          O registro de sessões está em preparação. Conheça o recurso.
        </AppText>
      </AppCard>

      <EmptyState
        identifier="atividade.log"
        title="Atividade recente"
        description="Suas sessões aparecerão aqui quando o registro estiver disponível."
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  context: { gap: spacing.xs },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  focus: { gap: spacing.md, padding: spacing.md },
});
