import { TriangleAlert } from 'lucide-react';
import { Button } from './Button';
import { Dialog } from './Dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = 'Excluir',
  loading,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title}>
      <div className="flex gap-3 rounded-lg bg-danger/8 p-3">
        <TriangleAlert className="size-5 shrink-0 text-danger" aria-hidden />
        <p className="text-sm text-gray-700">{message}</p>
      </div>

      <div className="mt-5 flex gap-3">
        <Button variant="secondary" fullWidth onClick={() => onOpenChange(false)} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="danger" fullWidth onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
