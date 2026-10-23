import { AppScreen } from '@/components/layout/app-screen';
import { ScreenHeader } from '@/components/layout/screen-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function ProjectsScreen() {
  return (
    <AppScreen>
      <ScreenHeader title="Projetos" />
      <EmptyState
        identifier="~/projetos"
        title="Seus projetos começam aqui"
        description="O cadastro de projetos estará disponível em uma próxima etapa."
      />
    </AppScreen>
  );
}
