import { useState, type ReactNode } from 'react'
import { Loader2, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { FormAlert } from '@/components/form'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

type ConfirmDialogProps = Readonly<{
  Icon: LucideIcon
  variant: 'default' | 'destructive'
  label: string
  title: string
  description: ReactNode
  dismissLabel: string
  mutation: { isPending: boolean; error: Error | null; reset: () => void }
  onConfirm: (close: (message: string) => void) => void
}>

// A plain Button confirms (not AlertDialogAction, which would close the dialog before the request ends).
export function ConfirmDialog({
  Icon,
  variant,
  label,
  title,
  description,
  dismissLabel,
  mutation,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) mutation.reset()
  }

  function close(message: string) {
    setOpen(false)
    toast.success(message)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size="sm">
          <Icon data-icon="inline-start" />
          {label}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.error && <FormAlert>{mutation.error.message}</FormAlert>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>{dismissLabel}</AlertDialogCancel>
          <Button variant={variant} onClick={() => onConfirm(close)} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {label}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
