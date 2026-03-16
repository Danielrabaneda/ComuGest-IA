'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteNoticeButtonProps {
    noticeId: string
}

export function DeleteNoticeButton({ noticeId }: DeleteNoticeButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar este comunicado?')) return

        setIsDeleting(true)
        try {
            const { error } = await supabase.from('notices').delete().eq('id', noticeId)
            if (error) throw error

            toast.success('Comunicado eliminado con éxito')
            router.push('/notices')
        } catch (error) {
            console.error('Error deleting notice:', error)
            const message = error instanceof Error ? error.message : 'Error desconocido'
            toast.error('Error al eliminar el comunicado: ' + message)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Button
            variant="outline"
            className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold h-10 px-4 flex items-center gap-2"
            onClick={handleDelete}
            disabled={isDeleting}
        >
            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            Eliminar
        </Button>
    )
}
