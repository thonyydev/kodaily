import { View, StyleSheet } from 'react-native';

import { AppScreen } from '@/components/layout/app-screen';
import { ScreenHeader } from '@/components/layout/screen-header';
import { AppText } from '@/components/ui/app-text';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeader } from '@/components/ui/section-header';
import { spacing } from '@/shared/theme';

export default function ProfileScreen() {
  return (
    <AppScreen>
      <ScreenHeader title="Perfil" />
      <EmptyState
        identifier="perfil.sys"
        title="Conta em preparação"
        description="Suas informações aparecerão aqui quando a autenticação estiver disponível."
      />
      <View style={styles.about}>
        <SectionHeader title="Sobre o Kodaily" />
        <AppText color="textMuted">
          Um diário para acompanhar seus projetos e sessões de programação.
        </AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({ about: { gap: spacing.sm } });
