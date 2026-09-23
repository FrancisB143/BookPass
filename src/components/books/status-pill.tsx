import { Pill } from '@/components/ui/pill';
import { STATUS_LABEL, type BookStatus } from '@/types';

/** Green when a book can be borrowed, amber while it is out, neutral if held. */
const TONE: Record<BookStatus, 'success' | 'error' | 'neutral'> = {
  available: 'success',
  borrowed: 'error',
  reserved: 'neutral',
};

export function StatusPill({ status }: { status: BookStatus }) {
  return <Pill label={STATUS_LABEL[status]} tone={TONE[status]} dot />;
}
