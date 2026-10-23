import { AppScreen } from '@/components/layout/app-screen';
import { ScreenHeader } from '@/components/layout/screen-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function HistoryScreen() {
  return (
    <AppScreen>
      <ScreenHeader title="Histórico" />
      <EmptyState
        identifier="historico.log"
        title="Ainda sem sessões"
        description="Quando o registro estiver disponível, suas sessões aparecerão em ordem cronológica."
      />
    </AppScreen>
  );
}
