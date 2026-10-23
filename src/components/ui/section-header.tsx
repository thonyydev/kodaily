import { AppText } from '@/components/ui/app-text';

export function SectionHeader({ title }: { title: string }) {
  return (
    <AppText variant="label" accessibilityRole="header">
      {title}
    </AppText>
  );
}
