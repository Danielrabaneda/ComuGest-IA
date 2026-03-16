'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Settings,
    Users,
    ShieldCheck,
    Plus,
    Trash2,
    CheckCircle2,
    Copy,
    Zap,
    Loader2,
    ChevronRight,
    Sparkles,
    Clock,
    X,
    Upload,
    Edit2,
    Save,
    User
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Community, Space, Doc, Profile } from '@/types'
import { cn } from '@/lib/utils'
import { AssistantDrawer } from '@/components/community/AssistantDrawer'

export default function AdminPage() {
    const [community, setCommunity] = useState<Community | null>(null)
    const [spaces, setSpaces] = useState<Space[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'info' | 'spaces' | 'communities' | 'ai' | 'neighbors' | 'profile'>('communities')
    const [allCommunities, setAllCommunities] = useState<Community[]>([])

    // Profile info state
    const [adminProfile, setAdminProfile] = useState<Profile | null>(null)
    const [editProfileName, setEditProfileName] = useState('')
    const [editProfileEmail, setEditProfileEmail] = useState('')
    const [editProfilePhone, setEditProfilePhone] = useState('')
    const [editProfileAddress, setEditProfileAddress] = useState('')
    const [editProfileHours, setEditProfileHours] = useState('')
    const [isSavingProfile, setIsSavingProfile] = useState(false)

    // Info state
    const [editName, setEditName] = useState('')
    const [editAddress, setEditAddress] = useState('')
    const [editNif, setEditNif] = useState('')
    const [isSavingInfo, setIsSavingInfo] = useState(false)
    const [isRegeneratingCode, setIsRegeneratingCode] = useState(false)

    // Create Community state
    const [isCreatingCommunity, setIsCreatingCommunity] = useState(false)
    const [newCommunityName, setNewCommunityName] = useState('')
    const [newCommunityAddress, setNewCommunityAddress] = useState('')
    const [newCommunityNif, setNewCommunityNif] = useState('')
    const [isSavingCommunity, setIsSavingCommunity] = useState(false)

    // Spaces state
    const [isCreatingSpace, setIsCreatingSpace] = useState(false)
    const [newSpaceName, setNewSpaceName] = useState('')
    const [newSpaceCapacity, setNewSpaceCapacity] = useState('10')
    const [newSpaceOpening, setNewSpaceOpening] = useState('09:00')
    const [newSpaceClosing, setNewSpaceClosing] = useState('22:00')
    const [newSpaceDays, setNewSpaceDays] = useState<string[]>(['L', 'M', 'X', 'J', 'V', 'S', 'D'])
    const [newSpaceImageFile, setNewSpaceImageFile] = useState<File | null>(null)
    const [isSavingSpace, setIsSavingSpace] = useState(false)
    const [deletingSpaceId, setDeletingSpaceId] = useState<string | null>(null)
    const [spaceImagePreview, setSpaceImagePreview] = useState<string | null>(null)
    const [editingSpaceDataId, setEditingSpaceDataId] = useState<string | null>(null)
    const [editingRulesSpaceId, setEditingRulesSpaceId] = useState<string | null>(null)
    const [editRulesContent, setEditRulesContent] = useState('')
    const [isSavingRules, setIsSavingRules] = useState(false)

    // AI Knowledge state
    const [aiDocs, setAiDocs] = useState<Doc[]>([])
    const [newDocTitle, setNewDocTitle] = useState('')
    const [newDocContent, setNewDocContent] = useState('')
    const [isSavingDoc, setIsSavingDoc] = useState(false)
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
    const [isExtractingText, setIsExtractingText] = useState(false)
    const [suggestedNotice, setSuggestedNotice] = useState<{ title: string; body: string; type: string } | null>(null)
    const [isPublishingNotice, setIsPublishingNotice] = useState(false)

    // Global AI Knowledge state
    const [showGlobalForm, setShowGlobalForm] = useState(false)
    const [newGlobalDocTitle, setNewGlobalDocTitle] = useState('')
    const [newGlobalDocContent, setNewGlobalDocContent] = useState('')
    const [isSavingGlobalDoc, setIsSavingGlobalDoc] = useState(false)
    const [isExtractingGlobalText, setIsExtractingGlobalText] = useState(false)

    // Neighbors management state
    const [neighbors, setNeighbors] = useState<Profile[]>([])
    const [isProcessingNeighbor, setIsProcessingNeighbor] = useState<string | null>(null)

    // Activity counts for all communities
    const [communityActivity, setCommunityActivity] = useState<Record<string, number>>({})

    // Assistant Drawer state
    const [isAssistantOpen, setIsAssistantOpen] = useState(false)
    const [assistantContext, setAssistantContext] = useState<{
        type: 'space_rules'
        spaceName: string
        spaceId: string
    } | undefined>(undefined)

    const supabase = createClient()

    const fetchActivityCounts = async (communities: Community[]) => {
        const communityIds = communities.map(c => c.id)
        if (communityIds.length === 0) return

        try {
            const [incidentsRes, neighborsRes, reservationsRes] = await Promise.all([
                supabase.from('incidents').select('community_id').eq('status', 'open').in('community_id', communityIds),
                supabase.from('profiles').select('community_id').eq('status', 'pending').in('community_id', communityIds),
                supabase.from('reservations').select('community_id').eq('status', 'pending').in('community_id', communityIds)
            ])

            const activityMap: Record<string, number> = {}
            
            // Initialize with 0
            communityIds.forEach(id => activityMap[id] = 0)

            // Accumulate counts
            incidentsRes.data?.forEach(item => activityMap[item.community_id] = (activityMap[item.community_id] || 0) + 1)
            neighborsRes.data?.forEach(item => activityMap[item.community_id] = (activityMap[item.community_id] || 0) + 1)
            reservationsRes.data?.forEach(item => activityMap[item.community_id] = (activityMap[item.community_id] || 0) + 1)

            setCommunityActivity(activityMap)
        } catch (error) {
            console.error('Error fetching activity counts:', error)
        }
    }

    const fetchAdminData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            if (!profile) return

            setAdminProfile(profile as Profile)
            setEditProfileName(profile.full_name || '')
            setEditProfileEmail(profile.email || '')
            setEditProfilePhone(profile.phone || '')
            setEditProfileAddress(profile.office_address || '')
            setEditProfileHours(profile.office_hours || '')

            // Si es admin, siempre queremos ver todas las comunidades
            const { data: allCommData } = await supabase.from('communities').select('*').order('name', { ascending: true })
            if (allCommData) {
                setAllCommunities(allCommData as Community[])
                // Buscamos actividad para todas las comunidades
                fetchActivityCounts(allCommData as Community[])
            }

            // Si no tiene comunidad asignada y es admin, le dejamos en la pestaña de comunidades
            if (!profile.community_id) {
                if (profile.role === 'admin') {
                    setActiveTab('communities')
                }
                setIsLoading(false)
                return
            }

            // Si tiene comunidad, cargamos sus datos específicos
            const [commRes, spacesRes, docsRes, neighborsRes] = await Promise.all([
                supabase.from('communities').select('*').eq('id', profile.community_id).single(),
                supabase.from('spaces').select('*').eq('community_id', profile.community_id).order('created_at', { ascending: false }),
                supabase.from('docs').select('*').eq('community_id', profile.community_id).eq('type', 'other').order('created_at', { ascending: false }),
                supabase.from('profiles').select('*').eq('community_id', profile.community_id).order('status', { ascending: false })
            ])

            if (commRes.data) {
                setCommunity(commRes.data as Community)
                setEditName(commRes.data.name)
                setEditAddress(commRes.data.address || '')
                setEditNif(commRes.data.nif || '')
                // Si ya tiene comunidad, podemos empezar en 'info' o quedarnos en 'communities'
                // setActiveTab('info') 
            }
            if (spacesRes.data) setSpaces(spacesRes.data)
            if (docsRes.data) setAiDocs(docsRes.data as Doc[])
            if (neighborsRes.data) setNeighbors(neighborsRes.data)
        } catch (error) {
            console.error('Error fetching admin data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleApplyRules = async (content: string) => {
        if (!assistantContext?.spaceId) return

        try {
            const { error } = await supabase
                .from('spaces')
                .update({ rules: content })
                .eq('id', assistantContext.spaceId)

            if (error) throw error

            // Update local state
            setSpaces(spaces.map(s => s.id === assistantContext.spaceId ? { ...s, rules: content } : s))
            toast.success('Reglas integradas con éxito')
            setIsAssistantOpen(false)
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al integrar las reglas')
        }
    }

    const handleSaveRules = async (spaceId: string) => {
        setIsSavingRules(true)
        try {
            const { error } = await supabase
                .from('spaces')
                .update({ rules: editRulesContent })
                .eq('id', spaceId)

            if (error) throw error

            setSpaces(spaces.map(s => s.id === spaceId ? { ...s, rules: editRulesContent } : s))
            toast.success('Reglas actualizadas correctamente')
            setEditingRulesSpaceId(null)
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al guardar las reglas')
        } finally {
            setIsSavingRules(false)
        }
    }

    useEffect(() => {
        fetchAdminData()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSwitchCommunity = async (communityId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase.from('profiles').update({ community_id: communityId }).eq('id', user.id)
            if (error) throw error

            toast.success('Comunidad cambiada correctamente')
            window.location.reload()
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error('Error al cambiar de comunidad: ' + (err.message || 'Error desconocido'))
        }
    }

    const handleCreateCommunity = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCommunityName.trim()) return
        setIsSavingCommunity(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuario no autenticado')

            // 1. Create the new community
            const code = Math.random().toString(36).substring(2, 10).toUpperCase()
            const { data: newComm, error: commError } = await supabase
                .from('communities')
                .insert({
                    name: newCommunityName,
                    address: newCommunityAddress,
                    nif: newCommunityNif,
                    code,
                    plan: 'pro'
                })
                .select()
                .single()

            if (commError) throw commError

            // 2. Assign the user as admin of the new community
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ community_id: newComm.id, role: 'admin' })
                .eq('id', user.id)

            if (profileError) throw profileError

            toast.success('¡Comunidad creada con éxito!')
            window.location.reload() // Reload to fetch context for the new community
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al crear la comunidad')
        } finally {
            setIsSavingCommunity(false)
        }
    }

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || file.type !== 'application/pdf') return
        setIsExtractingText(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const req = await fetch('/api/ai/upload-pdf', { method: 'POST', body: formData })
            const res = await req.json()
            if (!req.ok) throw new Error(res.error || 'Error al procesar el PDF')
            setNewDocContent(prev => prev ? prev + '\n\n' + res.text : res.text)
            if (!newDocTitle) setNewDocTitle(file.name.replace('.pdf', ''))
            toast.success('Texto extraído del PDF con éxito')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al procesar el PDF')
        } finally {
            setIsExtractingText(false)
            e.target.value = ''
        }
    }

    const handleGlobalPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || file.type !== 'application/pdf') return
        setIsExtractingGlobalText(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const req = await fetch('/api/ai/upload-pdf', { method: 'POST', body: formData })
            const res = await req.json()
            if (!req.ok) throw new Error(res.error || 'Error al procesar el PDF')
            setNewGlobalDocContent(prev => prev ? prev + '\n\n' + res.text : res.text)
            if (!newGlobalDocTitle) setNewGlobalDocTitle(file.name.replace('.pdf', ''))
            toast.success('Texto global extraído del PDF con éxito')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al procesar el PDF global')
        } finally {
            setIsExtractingGlobalText(false)
            e.target.value = ''
        }
    }

    const handleCreateGlobalAiDoc = async (e: React.FormEvent) => {
        e.preventDefault()
        if (allCommunities.length <= 1) return
        if (!newGlobalDocTitle.trim() || !newGlobalDocContent.trim()) return
        
        setIsSavingGlobalDoc(true)
        try {
            const insertPromises = allCommunities.map(c => 
                supabase.from('docs').insert({
                    community_id: c.id,
                    title: `[GLOBAL] ${newGlobalDocTitle}`,
                    body: newGlobalDocContent,
                    type: 'other'
                })
            )
            await Promise.all(insertPromises)
            
            toast.success(`Conocimiento global aplicado a ${allCommunities.length} comunidades`)
            setNewGlobalDocTitle('')
            setNewGlobalDocContent('')
            setShowGlobalForm(false)
            fetchAdminData() // refresh docs
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al guardar conocimiento global')
        } finally {
            setIsSavingGlobalDoc(false)
        }
    }

    const handleCreateAiDoc = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!community || !newDocTitle.trim() || !newDocContent.trim()) return
        setIsSavingDoc(true)
        try {
            const { data, error } = await supabase
                .from('docs')
                .insert({
                    community_id: community.id,
                    title: newDocTitle,
                    body: newDocContent,
                    type: 'other'
                })
                .select()
                .single()
            if (error) throw error
            setAiDocs([data, ...aiDocs])
            toast.success('Documento guardado. Analizando si hay avisos relevantes...')

            // Analizar el documento para detectar avisos
            const analysisRes = await fetch('/api/ai/analyze-doc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    docTitle: newDocTitle,
                    docContent: newDocContent,
                    communityName: community.name
                })
            })
            const analysis = await analysisRes.json()

            if (analysis.should_notify && analysis.notice) {
                setSuggestedNotice(analysis.notice)
                toast.success('¡La IA ha redactado un aviso para los vecinos!')
            }

            setNewDocTitle('')
            setNewDocContent('')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al guardar el documento')
        } finally {
            setIsSavingDoc(false)
        }
    }

    const handlePublishNotice = async () => {
        if (!suggestedNotice || !community) return
        setIsPublishingNotice(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { error } = await supabase.from('notices').insert({
                community_id: community.id,
                created_by: user!.id,
                title: suggestedNotice.title,
                body: suggestedNotice.body,
                short_body: suggestedNotice.body.slice(0, 120),
                type: suggestedNotice.type as 'general' | 'meeting' | 'maintenance' | 'cleaning' | 'works',
            })
            if (error) throw error
            toast.success('¡Aviso publicado para todos los vecinos!')
            setSuggestedNotice(null)
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al publicar el aviso')
        } finally {
            setIsPublishingNotice(false)
        }
    }

    const handleDeleteAiDoc = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este documento de contexto?')) return
        setDeletingDocId(id)
        try {
            const { error } = await supabase.from('docs').delete().eq('id', id)
            if (error) throw error
            setAiDocs(aiDocs.filter(d => d.id !== id))
            toast.success('Documento eliminado')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al eliminar el documento')
        } finally {
            setDeletingDocId(null)
        }
    }

    const handleApproveNeighbor = async (neighborId: string) => {
        setIsProcessingNeighbor(neighborId)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status: 'active' })
                .eq('id', neighborId)
            if (error) throw error
            setNeighbors(neighbors.map(n => n.id === neighborId ? { ...n, status: 'active' } : n))
            toast.success('Vecino aprobado correctamente')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al aprobar vecino')
        } finally {
            setIsProcessingNeighbor(null)
        }
    }

    const handleRejectNeighbor = async (neighborId: string) => {
        setIsProcessingNeighbor(neighborId)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ community_id: null, status: 'active' }) // Se le quita la comunidad
                .eq('id', neighborId)
            if (error) throw error
            setNeighbors(neighbors.filter(n => n.id !== neighborId))
            toast.success('Solicitud rechazada')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al rechazar solicitud')
        } finally {
            setIsProcessingNeighbor(null)
        }
    }

    const copyInviteCode = () => {
        if (community?.code) {
            navigator.clipboard.writeText(community.code)
            toast.success('¡Código copiado al portapapeles!')
        }
    }

    const handleSaveInfo = async () => {
        if (!community) return
        if (!editName.trim()) {
            toast.error('El nombre no puede estar vacío')
            return
        }
        setIsSavingInfo(true)
        try {
            const { error } = await supabase
                .from('communities')
                .update({ name: editName, address: editAddress, nif: editNif })
                .eq('id', community.id)

            if (error) throw error
            setCommunity({ ...community, name: editName, address: editAddress, nif: editNif })
            toast.success('Información de la comunidad actualizada')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al guardar la información')
        } finally {
            setIsSavingInfo(false)
        }
    }

    const handleRegenerateCode = async () => {
        if (!community) return
        if (!confirm('¿Estás seguro de regenerar el código? Los vecinos que no hayan entrado necesitarán el nuevo código para registrarse.')) return
        setIsRegeneratingCode(true)
        try {
            const newCode = Math.random().toString(36).substring(2, 10).toUpperCase()
            const { data, error } = await supabase
                .from('communities')
                .update({ code: newCode })
                .eq('id', community.id)
                .select('code')
                .single()
            if (error) throw error
            setCommunity({ ...community, code: data.code })
            toast.success('Código de invitación regenerado')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al regenerar el código')
        } finally {
            setIsRegeneratingCode(false)
        }
    }

    const toggleDay = (day: string) => {
        setNewSpaceDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        )
    }

    const handleSpaceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setNewSpaceImageFile(file)
            setSpaceImagePreview(URL.createObjectURL(file))
        }
    }

    const handleCreateSpace = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!community) return
        setIsSavingSpace(true)
        try {
            let imageUrl = null
            if (newSpaceImageFile) {
                try {
                    const fileExt = newSpaceImageFile.name.split('.').pop()
                    const fileName = `${Math.random()}.${fileExt}`
                    const filePath = `${community.id}/${fileName}`

                    console.log('Intentando subir imagen a bucket space-images...', filePath)

                    const { error: uploadError } = await supabase.storage
                        .from('space-images')
                        .upload(filePath, newSpaceImageFile, {
                            cacheControl: '3600',
                            upsert: false
                        })

                    if (uploadError) {
                        console.error('ERROR CRÍTICO STORAGE:', uploadError)
                        toast.error(`Imagen no guardada: ${uploadError.message}. El espacio se creará sin imagen.`)
                        // No lanzamos error aquí para permitir que se cree el espacio
                    } else {
                        const { data: { publicUrl } } = supabase.storage
                            .from('space-images')
                            .getPublicUrl(filePath)

                        imageUrl = publicUrl
                        console.log('Imagen subida con éxito:', imageUrl)
                    }
                } catch (storageErr) {
                    console.error('Error inesperado en Storage:', storageErr)
                }
            }

            const spaceData: Record<string, string | number | string[] | null> = {
                name: newSpaceName,
                max_capacity: parseInt(newSpaceCapacity) || 10,
                opening_time: newSpaceOpening.length === 5 ? newSpaceOpening + ':00' : newSpaceOpening,
                closing_time: newSpaceClosing.length === 5 ? newSpaceClosing + ':00' : newSpaceClosing,
                available_days: newSpaceDays,
                ...(imageUrl ? { image_url: imageUrl } : {})
            };

            if (editingSpaceDataId) {
                const { data, error } = await supabase
                    .from('spaces')
                    .update(spaceData)
                    .eq('id', editingSpaceDataId)
                    .select()
                    .single()
                if (error) throw error
                setSpaces(spaces.map(s => s.id === editingSpaceDataId ? data : s))
                toast.success('Espacio actualizado con éxito')
            } else {
                const { data, error } = await supabase
                    .from('spaces')
                    .insert({
                        community_id: community.id,
                        reservation_duration: 60,
                        ...spaceData
                    })
                    .select()
                    .single()
                if (error) throw error
                setSpaces([data, ...spaces])
                toast.success('Espacio creado con éxito')
            }
            
            setIsCreatingSpace(false)
            setEditingSpaceDataId(null)
            setNewSpaceName('')
            setNewSpaceImageFile(null)
            setSpaceImagePreview(null)
            setNewSpaceDays(['L', 'M', 'X', 'J', 'V', 'S', 'D'])
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al guardar el espacio')
        } finally {
            setIsSavingSpace(false)
        }
    }

    const handleEditSpace = (space: Space) => {
        setEditingSpaceDataId(space.id)
        setNewSpaceName(space.name)
        setNewSpaceCapacity(space.max_capacity?.toString() || '10')
        setNewSpaceOpening(space.opening_time?.substring(0, 5) || '09:00')
        setNewSpaceClosing(space.closing_time?.substring(0, 5) || '22:00')
        setNewSpaceDays(space.available_days || ['L', 'M', 'X', 'J', 'V', 'S', 'D'])
        setSpaceImagePreview(space.image_url || null)
        setNewSpaceImageFile(null)
        setIsCreatingSpace(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDeleteSpace = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar el espacio "${name}"? Todas las reservas asociadas se perderán.`)) return
        setDeletingSpaceId(id)
        try {
            const { error } = await supabase.from('spaces').delete().eq('id', id)
            if (error) throw error
            setSpaces(spaces.filter(s => s.id !== id))
            toast.success('Espacio eliminado')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al eliminar el espacio')
        } finally {
            setDeletingSpaceId(null)
        }
    }

    const handleSaveProfile = async () => {
        if (!adminProfile) return
        setIsSavingProfile(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    full_name: editProfileName,
                    email: editProfileEmail,
                    phone: editProfilePhone,
                    office_address: editProfileAddress,
                    office_hours: editProfileHours
                })
                .eq('id', adminProfile.id)
            if (error) throw error
            toast.success('Perfil de administrador actualizado')
            
            setAdminProfile({ 
                ...adminProfile, 
                full_name: editProfileName, 
                email: editProfileEmail, 
                phone: editProfilePhone,
                office_address: editProfileAddress,
                office_hours: editProfileHours
            })
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al actualizar el perfil')
        } finally {
            setIsSavingProfile(false)
        }
    }

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-1">Configuración del Panel</h1>
                    <p className="text-slate-500 text-lg font-medium">
                        {community ? `Gestión administrativa de la comunidad ${community.name}.` : "Gestión global de comunidades."}
                    </p>
                </div>
                <div className="flex gap-3 bg-slate-100 p-1.5 rounded-2xl flex-wrap">
                    <Button
                        variant={activeTab === 'info' ? 'default' : 'ghost'}
                        className={cn("rounded-xl font-bold italic tracking-tight uppercase px-6", activeTab === 'info' ? "shadow-md bg-slate-900 text-white" : "text-slate-500")}
                        onClick={() => community && setActiveTab('info')}
                        disabled={!community}
                    >
                        Información
                    </Button>
                    <Button
                        variant={activeTab === 'spaces' ? 'default' : 'ghost'}
                        className={cn("rounded-xl font-bold italic tracking-tight uppercase px-6", activeTab === 'spaces' ? "shadow-md bg-slate-900 text-white" : "text-slate-500")}
                        onClick={() => community && setActiveTab('spaces')}
                        disabled={!community}
                    >
                        Espacios
                    </Button>
                    <Button
                        variant={activeTab === 'communities' ? 'default' : 'ghost'}
                        className={cn("rounded-xl font-bold italic tracking-tight uppercase px-6", activeTab === 'communities' ? "shadow-md bg-slate-900 text-white" : "text-slate-500")}
                        onClick={() => setActiveTab('communities')}
                    >
                        Comunidades
                    </Button>
                    <Button
                        variant={activeTab === 'ai' ? 'default' : 'ghost'}
                        className={cn("rounded-xl font-bold italic tracking-tight uppercase px-6 text-primary", activeTab === 'ai' ? "shadow-md bg-primary text-white" : "")}
                        onClick={() => setActiveTab('ai')}
                    >
                        Secretario IA
                    </Button>
                    <Button
                        variant={activeTab === 'neighbors' ? 'default' : 'ghost'}
                        className={cn("rounded-xl font-bold italic tracking-tight uppercase px-6 relative", activeTab === 'neighbors' ? "shadow-md bg-slate-900 text-white" : "text-slate-500")}
                        onClick={() => community && setActiveTab('neighbors')}
                        disabled={!community}
                    >
                        Vecinos
                        {neighbors.some(n => n.status === 'pending') && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                                {neighbors.filter(n => n.status === 'pending').length}
                            </span>
                        )}
                    </Button>
                    <Button
                        variant={activeTab === 'profile' ? 'default' : 'ghost'}
                        className={cn("rounded-xl font-bold italic tracking-tight uppercase px-6", activeTab === 'profile' ? "shadow-md bg-slate-900 text-white" : "text-slate-500")}
                        onClick={() => setActiveTab('profile')}
                    >
                        Mi Perfil
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {activeTab === 'communities' && (
                    <div className="col-span-1 lg:col-span-3 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase underline decoration-primary/20 underline-offset-8 decoration-4">
                                GESTIÓN DE COMUNIDADES
                            </h3>
                            <Button
                                onClick={() => setIsCreatingCommunity(!isCreatingCommunity)}
                                className="font-bold italic tracking-tighter uppercase bg-primary text-white rounded-xl shadow-md px-6"
                            >
                                {isCreatingCommunity ? 'Cancelar' : <><Plus size={18} className="mr-2" /> Nueva Comunidad</>}
                            </Button>
                        </div>

                        {isCreatingCommunity && (
                            <Card className="border-2 border-primary/20 shadow-xl bg-primary/5 rounded-3xl p-8 mb-8 animate-in fade-in zoom-in duration-500">
                                <form onSubmit={handleCreateCommunity} className="space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Plus size={24} className="text-primary" />
                                        <h4 className="text-xl font-black text-slate-900 italic tracking-tighter uppercase">
                                            Crear Nueva Comunidad
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nombre del Edificio / Residencial</Label>
                                            <Input required placeholder="Ej: Edificio Los Pinos" className="h-12 rounded-xl bg-white" value={newCommunityName} onChange={(e) => setNewCommunityName(e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">NIF / CIF (Opcional)</Label>
                                            <Input placeholder="Ej: H12345678" className="h-12 rounded-xl bg-white" value={newCommunityNif} onChange={(e) => setNewCommunityNif(e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Dirección (Opcional)</Label>
                                            <Input placeholder="Ej: Calle Principal 123" className="h-12 rounded-xl bg-white md:col-span-2" value={newCommunityAddress} onChange={(e) => setNewCommunityAddress(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" disabled={isSavingCommunity} className="h-12 px-8 rounded-xl font-black uppercase tracking-widest italic bg-primary text-white shadow-lg">
                                            {isSavingCommunity ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                                            Crear y Administrar
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allCommunities.map(comm => {
                                const activityCount = communityActivity[comm.id] || 0;
                                return (
                                    <div key={comm.id} className="relative group">
                                        <Card
                                            className={cn(
                                                "border-2 transition-all cursor-pointer rounded-3xl hover:shadow-xl hover:border-primary/50 h-full",
                                                comm.id === community?.id ? "border-primary shadow-lg bg-primary/5" : "border-slate-100"
                                            )}
                                            onClick={() => handleSwitchCommunity(comm.id)}
                                        >
                                            <CardHeader className="p-6">
                                                <CardTitle className="text-xl font-black italic tracking-tighter uppercase mb-1">{comm.name}</CardTitle>
                                                <Badge className="w-fit">{comm.plan === 'pro' ? 'PRO' : 'BÁSICO'}</Badge>
                                            </CardHeader>
                                            <CardContent className="p-6 pt-0">
                                                <p className="text-xs font-bold text-slate-400">Dirección: {comm.address || 'No definida'}</p>
                                            </CardContent>
                                        </Card>
                                        
                                        {activityCount > 0 && (
                                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse z-10">
                                                {activityCount > 9 ? '+9' : activityCount}
                                            </div>
                                        )}

                                        {comm.id === community?.id && (
                                            <div className="absolute top-4 right-4 text-primary bg-white/80 rounded-full p-0.5">
                                                <CheckCircle2 size={20} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="lg:col-span-3 space-y-10">
                        {/* Global Knowledge Section */}
                        <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-2 border-primary/30 rounded-3xl p-8 mb-6 relative overflow-hidden">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-primary/20">
                                        <Zap size={28} className="text-primary fill-primary/80 animate-pulse" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">
                                        Base de Conocimiento Global
                                    </h3>
                                </div>
                                <p className="text-slate-700 font-medium mb-6 max-w-3xl">
                                    Añade leyes, manuales o normas que afecten a <b className="text-primary">todas las comunidades</b> que administras al mismo tiempo. 
                                    {allCommunities.length <= 1 ? (
                                        <span className="text-red-500 font-bold block mt-2 bg-red-50 p-3 rounded-xl border border-red-100 w-fit">
                                            (Se activa automáticamente al tener más de 1 comunidad. Actualmente solo gestionas 1.)
                                        </span>
                                    ) : (
                                        <span className="text-primary font-bold block mt-2 bg-white/50 p-3 rounded-xl border border-primary/20 w-fit backdrop-blur-sm">
                                            (Actualmente administras {allCommunities.length} comunidades.)
                                        </span>
                                    )}
                                </p>
                                
                                {allCommunities.length > 1 && (
                                    <Button
                                        onClick={() => setShowGlobalForm(!showGlobalForm)}
                                        className="mb-8 font-black italic tracking-tighter uppercase bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xl shadow-primary/20"
                                        size="lg"
                                    >
                                        {showGlobalForm ? 'Ocultar Panel' : 'Añadir Conocimiento Global'}
                                        <ChevronRight size={20} className={cn("ml-2 transition-transform", showGlobalForm ? "rotate-90" : "")}/>
                                    </Button>
                                )}

                                {showGlobalForm && allCommunities.length > 1 && (
                                    <Card className="border-2 border-primary/20 shadow-2xl bg-white/95 backdrop-blur-md rounded-3xl p-8 mb-8 animate-in fade-in zoom-in duration-500">
                                        <form onSubmit={handleCreateGlobalAiDoc} className="space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-xs font-black text-primary uppercase tracking-widest">Título del Documento Global</Label>
                                                <Input required placeholder="Ej: Ley de Propiedad Horizontal..." className="h-12 rounded-xl bg-slate-50 border-primary/20 focus-visible:ring-primary" value={newGlobalDocTitle} onChange={(e) => setNewGlobalDocTitle(e.target.value)} />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-black text-primary uppercase tracking-widest">Contenido</Label>
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={handleGlobalPdfUpload}
                                                            disabled={isExtractingGlobalText}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                                        />
                                                        <Button type="button" variant="outline" size="sm" className="rounded-xl h-9 text-primary border-primary/30 bg-primary/10 hover:bg-primary/20 pointer-events-none relative z-0" disabled={isExtractingGlobalText}>
                                                            {isExtractingGlobalText ? <Loader2 className="animate-spin mr-2" size={14} /> : <Upload className="mr-2" size={14} />}
                                                            {isExtractingGlobalText ? 'Analizando PDF...' : 'Subir y extraer PDF'}
                                                        </Button>
                                                    </div>
                                                </div>
                                                <textarea
                                                    required
                                                    placeholder="Pega aquí el contenido global o extrae texto de un archivo PDF..."
                                                    className="w-full min-h-[250px] p-4 rounded-xl border border-primary/20 bg-slate-50 focus:outline-primary/50 resize-y font-mono text-sm leading-relaxed"
                                                    value={newGlobalDocContent}
                                                    onChange={(e) => setNewGlobalDocContent(e.target.value)}
                                                />
                                            </div>
                                            <Button type="submit" disabled={isSavingGlobalDoc} className="h-14 px-8 rounded-xl font-black text-lg uppercase tracking-widest italic bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 w-full hover:scale-[1.02] transition-transform">
                                                {isSavingGlobalDoc ? <Loader2 className="animate-spin mr-2" size={24} /> : <Sparkles className="mr-2" size={24} />}
                                                Distribuir a {allCommunities.length} Comunidades
                                            </Button>
                                        </form>
                                    </Card>
                                )}
                            </div>
                        </div>

                        <div className="bg-primary/5 border-2 border-primary/20 rounded-3xl p-8 mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Zap size={32} className="text-primary fill-primary/50" />
                                <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">
                                    Base de Conocimiento IA
                                </h3>
                            </div>
                            <p className="text-slate-600 font-medium mb-8">
                                Sube documentos, normas o información general que quieres que el <b>Secretario IA</b> lea y tenga en cuenta para contestar a los vecinos de tu comunidad de forma inteligente.
                            </p>

                            <Card className="border-none shadow-xl bg-white rounded-3xl p-8 mb-8">
                                <form onSubmit={handleCreateAiDoc} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Título del Documento o Fragmento</Label>
                                        <Input required placeholder="Ej: Normativa de la piscina 2024, Problemas con el ascensor..." className="h-12 rounded-xl bg-slate-50" value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Contenido</Label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={handlePdfUpload}
                                                    disabled={isExtractingText}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                                />
                                                <Button type="button" variant="outline" size="sm" className="rounded-xl h-9 text-primary border-primary/20 bg-primary/5 pointer-events-none relative z-0" disabled={isExtractingText}>
                                                    {isExtractingText ? <Loader2 className="animate-spin mr-2" size={14} /> : <Upload className="mr-2" size={14} />}
                                                    {isExtractingText ? 'Analizando PDF...' : 'Subir y extraer PDF'}
                                                </Button>
                                            </div>
                                        </div>
                                        <textarea
                                            required
                                            placeholder="Pega aquí el contenido o usa el botón de arriba para extraer el texto de un archivo PDF..."
                                            className="w-full min-h-[250px] p-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-primary/50 resize-y font-mono text-sm leading-relaxed"
                                            value={newDocContent}
                                            onChange={(e) => setNewDocContent(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" disabled={isSavingDoc} className="h-12 px-8 rounded-xl font-black uppercase tracking-widest italic bg-primary text-white shadow-lg w-full">
                                        {isSavingDoc ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                                        Enseñar a la IA
                                    </Button>
                                </form>
                            </Card>

                            {suggestedNotice && (
                                <div className="mb-8 animate-in fade-in zoom-in duration-500">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="text-amber-500 fill-amber-500/20" size={20} />
                                        <h4 className="text-lg font-black text-slate-900 italic tracking-tighter uppercase">Aviso Sugerido por la IA</h4>
                                    </div>
                                    <Card className="border-2 border-amber-200 shadow-xl bg-amber-50/30 rounded-3xl overflow-hidden">
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <Badge variant="outline" className="bg-amber-100/50 border-amber-200 text-amber-700 font-bold uppercase tracking-widest text-[10px]">
                                                        {suggestedNotice.type}
                                                    </Badge>
                                                    <h5 className="text-xl font-black text-slate-900 italic uppercase leading-tight">
                                                        {suggestedNotice.title}
                                                    </h5>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-600"
                                                    onClick={() => setSuggestedNotice(null)}
                                                >
                                                    <X size={18} />
                                                </Button>
                                            </div>
                                            <p className="text-slate-700 font-medium leading-relaxed leading-snug">
                                                {suggestedNotice.body}
                                            </p>
                                            <div className="flex items-center gap-3 pt-2">
                                                <Button
                                                    onClick={handlePublishNotice}
                                                    disabled={isPublishingNotice}
                                                    className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase italic text-xs tracking-widest shadow-lg shadow-amber-500/20"
                                                >
                                                    {isPublishingNotice ? <Loader2 className="animate-spin mr-2" size={14} /> : <Zap size={14} className="mr-2 fill-white" />}
                                                    Publicar Aviso Ahora
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setSuggestedNotice(null)}
                                                    className="h-10 px-6 rounded-xl text-slate-400 hover:text-slate-600 font-black uppercase italic text-xs tracking-widest"
                                                >
                                                    Descartar Sugerencia
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            <h4 className="text-xl font-black text-slate-900 italic tracking-tighter uppercase mb-6">Documentos Guardados</h4>
                            <div className="space-y-4">
                                {aiDocs.length === 0 && (
                                    <p className="text-slate-400 text-center py-6 font-medium italic">Aún no le has dado información al Secretario IA.</p>
                                )}
                                {aiDocs.map((doc) => (
                                    <div key={doc.id} className="bg-white rounded-2xl p-6 flex items-start justify-between shadow-sm border border-slate-100">
                                        <div>
                                            <h5 className="font-bold text-lg mb-1">{doc.title}</h5>
                                            <p className="text-slate-500 text-sm line-clamp-2">{doc.body}</p>
                                        </div>
                                        <Button disabled={deletingDocId === doc.id} variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl px-3" onClick={() => handleDeleteAiDoc(doc.id)}>
                                            {deletingDocId === doc.id ? <Loader2 className="animate-spin" size={18} /> : 'Eliminar'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'info' && (
                    <>
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
                                <CardHeader className="bg-slate-900 text-white p-10">
                                    <div className="bg-primary/20 p-3 rounded-2xl w-fit mb-6">
                                        <Settings size={32} className="text-primary" />
                                    </div>
                                    <CardTitle className="text-3xl font-black italic tracking-tighter uppercase mb-2">Comunidad Oficial</CardTitle>
                                    <p className="text-slate-400 font-medium">Datos informativos básicos para el panel vecinal.</p>
                                </CardHeader>
                                <CardContent className="p-10 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre del proyecto</Label>
                                            <Input className="h-14 rounded-2xl border-2 border-slate-100 font-bold text-lg bg-slate-50" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Identificador Fiscal / NIF</Label>
                                            <Input className="h-14 rounded-2xl border-2 border-slate-100 font-bold text-lg bg-slate-50" value={editNif} onChange={(e) => setEditNif(e.target.value)} placeholder="H12345678" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Dirección Física Completa</Label>
                                        <Input className="h-14 rounded-2xl border-2 border-slate-100 font-bold text-lg bg-slate-50" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
                                    </div>
                                </CardContent>
                                <CardFooter className="p-10 bg-slate-50 flex justify-end">
                                    <Button onClick={handleSaveInfo} disabled={isSavingInfo} className="h-12 rounded-xl bg-primary font-black uppercase italic px-10 shadow-lg shadow-primary/20">
                                        {isSavingInfo ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                                        Guardar Cambios
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="space-y-8">
                            <Card className="bg-primary/5 border-none rounded-[40px] p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
                                <div className="relative">
                                    <div className="bg-primary/10 p-2.5 rounded-xl w-fit mb-6 shadow-sm">
                                        <Users size={24} className="text-primary fill-primary/20" />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 italic tracking-tighter uppercase mb-1">CÓDIGO DE ACCESO</h4>
                                    <p className="text-slate-500 font-medium leading-relaxed italic mb-8">
                                        Comparte este código exclusivo con los vecinos para que puedan unirse al panel oficial.
                                    </p>

                                    <div className="bg-white p-6 rounded-[24px] border-2 border-dashed border-primary/20 flex items-center justify-between mb-8 shadow-inner">
                                        <span className="text-3xl font-black text-primary tracking-[0.3em] font-mono leading-none">{community?.code}</span>
                                        <Button variant="ghost" className="rounded-xl h-12 w-12 p-0 text-primary hover:bg-primary/5" onClick={copyInviteCode}>
                                            <Copy size={24} />
                                        </Button>
                                    </div>

                                    <Button variant="link" onClick={handleRegenerateCode} disabled={isRegeneratingCode} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-primary uppercase tracking-widest p-0 h-auto">
                                        {isRegeneratingCode ? <Loader2 className="animate-spin text-primary" size={14} /> : <Sparkles size={14} className="text-primary animate-pulse" />} Regenerar código de seguridad
                                    </Button>
                                </div>
                            </Card>

                            <Card className="bg-slate-900 border-none rounded-[40px] p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                                <div className="bg-white/10 p-3 rounded-2xl w-fit mb-6">
                                    <Zap size={24} className="text-primary fill-primary" />
                                </div>
                                <h4 className="text-xl font-black italic tracking-tighter uppercase mb-1 leading-none">Tu Plan SaaS</h4>
                                
                                <div className="flex flex-wrap gap-2 mt-4 mb-6">
                                    <Badge className={cn(
                                        "border-none font-black italic px-4 py-1.5 h-auto text-[10px] tracking-widest uppercase",
                                        community?.plan === 'pro' ? "bg-primary/20 text-primary" : "bg-slate-700 text-slate-300"
                                    )}>
                                        {community?.plan === 'pro' ? 'PRO VECINAL' : 'PLAN BÁSICO'}
                                    </Badge>
                                    
                                    {community?.subscription_status === 'trial' && (
                                        <Badge variant="outline" className="border-amber-500/50 text-amber-500 font-black italic px-4 py-1.5 h-auto text-[10px] tracking-widest uppercase bg-amber-500/10">
                                            PERIODO DE PRUEBA
                                        </Badge>
                                    )}
                                </div>

                                {community?.subscription_status === 'trial' && community?.trial_ends_at && (
                                    <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Días restantes</span>
                                            <span className="text-lg font-black text-primary italic">
                                                {Math.max(0, differenceInDays(new Date(community.trial_ends_at), new Date()))} días
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-primary h-full transition-all duration-1000" 
                                                style={{ 
                                                    width: `${Math.min(100, (Math.max(0, differenceInDays(new Date(community.trial_ends_at), new Date())) / 30) * 100)}%` 
                                                }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-2 font-medium italic">
                                            Expira el {format(new Date(community.trial_ends_at), "d 'de' MMMM", { locale: es })}
                                        </p>
                                    </div>
                                )}

                                <p className="text-slate-400 font-medium text-sm italic mb-10 leading-relaxed">
                                    {community?.plan === 'pro' 
                                        ? 'Disfrutas de IA ilimitada, gestión de 10 espacios comunes y almacenamiento de 50GB.' 
                                        : 'Explora las ventajas de mejorar al nivel PRO para acceder a todas las funciones.'}
                                </p>
                                <Link href={`/pagar?plan=Pro&communityId=${community?.id}`}>
                                    <Button className="w-full h-12 rounded-2xl bg-white text-slate-900 font-black italic uppercase text-xs tracking-widest shadow-2xl hover:bg-slate-100 transition-colors">
                                        {community?.subscription_status === 'trial' ? 'ACTIVAR PLAN PRO' : 'GESTIONAR SUSCRIPCIÓN'}
                                    </Button>
                                </Link>
                            </Card>
                        </div>
                    </>
                )}

                {activeTab === 'spaces' && (
                    <div className="lg:col-span-3 space-y-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase underline decoration-primary/20 underline-offset-8 decoration-4">
                                GESTIÓN DE ESPACIOS COMUNES
                            </h3>
                            <Button onClick={() => {
                                if (isCreatingSpace) {
                                    setIsCreatingSpace(false)
                                    setEditingSpaceDataId(null)
                                    setNewSpaceName('')
                                    setNewSpaceImageFile(null)
                                    setSpaceImagePreview(null)
                                    setNewSpaceDays(['L', 'M', 'X', 'J', 'V', 'S', 'D'])
                                } else {
                                    setIsCreatingSpace(true)
                                }
                            }} className="rounded-2xl bg-primary h-12 px-8 font-black flex items-center gap-2 shadow-lg shadow-primary/20 italic tracking-tight">
                                {isCreatingSpace ? <X size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
                                {isCreatingSpace ? 'CANCELAR' : 'AÑADIR NUEVO ESPACIO'}
                            </Button>
                        </div>

                        {isCreatingSpace && (
                            <Card className="border-none shadow-2xl bg-white rounded-[40px] p-10 mb-10 animate-in slide-in-from-top-4 duration-500 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                                <form onSubmit={handleCreateSpace} className="space-y-10">
                                    <div className="flex flex-col md:flex-row gap-10">
                                        <div className="flex-1 space-y-8">
                                            <div className="space-y-4">
                                                <Label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Identificación</Label>
                                                <Input required placeholder="Nombre: Piscina, Gimnasio..." className="h-16 text-xl px-6 rounded-[20px] bg-slate-50 border-none shadow-inner font-black italic uppercase" value={newSpaceName} onChange={(e) => setNewSpaceName(e.target.value)} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <Label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Apertura</Label>
                                                    <Input required type="time" className="h-14 rounded-[20px] bg-slate-50 border-none shadow-inner font-bold" value={newSpaceOpening} onChange={(e) => setNewSpaceOpening(e.target.value)} />
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Cierre</Label>
                                                    <Input required type="time" className="h-14 rounded-[20px] bg-slate-50 border-none shadow-inner font-bold" value={newSpaceClosing} onChange={(e) => setNewSpaceClosing(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <Label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Días Disponibles</Label>
                                                <div className="flex flex-wrap gap-3">
                                                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                                                        <button
                                                            key={day}
                                                            type="button"
                                                            onClick={() => toggleDay(day)}
                                                            className={cn(
                                                                "w-14 h-14 rounded-full font-black text-sm transition-all shadow-md transform hover:scale-105 active:scale-95",
                                                                newSpaceDays.includes(day)
                                                                    ? "bg-emerald-500 text-white shadow-emerald-200/50"
                                                                    : "bg-rose-50 text-rose-400 border-2 border-rose-100/50 hover:bg-rose-100/50"
                                                            )}
                                                        >
                                                            {day}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-80 space-y-4">
                                            <Label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Imagen de Portada</Label>
                                            <div
                                                onClick={() => document.getElementById('space-image-input')?.click()}
                                                className="aspect-[4/5] bg-slate-50 rounded-[30px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden relative group"
                                            >
                                                {spaceImagePreview ? (
                                                    <>
                                                        <Image src={spaceImagePreview} fill className="object-cover" alt="Preview" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Upload size={32} className="text-white" />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center p-6">
                                                        <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center mx-auto mb-4 text-slate-300 group-hover:text-primary transition-colors">
                                                            <Upload size={24} />
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subir foto</p>
                                                    </div>
                                                )}
                                                <input id="space-image-input" type="file" className="hidden" accept="image/*" onChange={handleSpaceImageChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-slate-100 gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Aforo Máximo</Label>
                                                <Input required type="number" min="1" className="h-10 w-24 rounded-xl bg-slate-50 border-none shadow-inner font-black text-center mt-1" value={newSpaceCapacity} onChange={(e) => setNewSpaceCapacity(e.target.value)} />
                                            </div>
                                        </div>

                                        <Button type="submit" disabled={isSavingSpace} className="h-16 px-12 rounded-2xl font-black uppercase tracking-wider italic bg-slate-900 text-white shadow-2xl hover:scale-105 transition-transform">
                                            {isSavingSpace ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                                            {editingSpaceDataId ? 'GUARDAR CAMBIOS' : 'GUARDAR ESPACIO COMÚN'}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {spaces.length === 0 && !isCreatingSpace && (
                                <div className="col-span-full py-20 text-center text-slate-400 font-medium">
                                    <p>No hay espacios creados en tu comunidad.</p>
                                </div>
                            )}
                            {spaces.map((space) => (
                                <Card key={space.id} className="border-none shadow-2xl shadow-slate-200/40 rounded-[45px] overflow-hidden bg-white group hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2">
                                    <div className="h-64 relative overflow-hidden bg-slate-100 flex items-center justify-center">
                                        {space.image_url ? (
                                            <Image
                                                src={space.image_url}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={space.name}
                                            />
                                        ) : (
                                            <Zap size={64} className="text-slate-200 fill-slate-200/50" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                        <div className="absolute top-6 right-6 flex gap-2">
                                            <Button onClick={(e) => { e.preventDefault(); handleEditSpace(space); }} className="bg-white/90 backdrop-blur-md text-slate-700 h-12 w-12 p-0 rounded-2xl hover:bg-slate-200 hover:text-slate-900 shadow-2xl transition-all">
                                                <Edit2 size={20} />
                                            </Button>
                                            <Button disabled={deletingSpaceId === space.id} onClick={() => handleDeleteSpace(space.id, space.name)} className="bg-white/90 backdrop-blur-md text-red-500 h-12 w-12 p-0 rounded-2xl hover:bg-red-500 hover:text-white shadow-2xl transition-all">
                                                {deletingSpaceId === space.id ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                                            </Button>
                                        </div>
                                        <div className="absolute bottom-6 left-8">
                                            <Badge className="bg-primary text-white border-none font-black italic px-4 py-1.5 h-auto text-[10px] tracking-widest uppercase mb-2">
                                                {space.max_capacity || 10} PERSONAS
                                            </Badge>
                                            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-lg">{space.name}</h3>
                                        </div>
                                    </div>
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-center gap-6 mb-4">
                                            <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest italic">
                                                <Clock size={16} className="text-primary not-italic" /> {space.opening_time?.slice(0, 5) || '09:00'} a {space.closing_time?.slice(0, 5) || '22:00'}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                                                <span
                                                    key={d}
                                                    className={cn(
                                                        "w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-black border-2 transition-colors",
                                                        space.available_days?.includes(d)
                                                            ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                                                            : "bg-rose-50 text-rose-200 border-rose-100/50"
                                                    )}
                                                >
                                                    {d}
                                                </span>
                                            ))}
                                        </div>
                                        <div 
                                            className={cn(
                                                "mt-6 p-4 rounded-2xl border transition-all cursor-pointer group/rules",
                                                space.rules ? "bg-primary/5 border-primary/10 hover:bg-primary/10" : "bg-slate-50 border-slate-100 hover:border-primary/20"
                                            )}
                                            onClick={() => {
                                                if (editingRulesSpaceId !== space.id) {
                                                    setEditingRulesSpaceId(space.id)
                                                    setEditRulesContent(space.rules || '')
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">Reglamento del Espacio</p>
                                                <Edit2 size={12} className="text-primary opacity-0 group-hover/rules:opacity-100 transition-opacity" />
                                            </div>
                                            
                                            {editingRulesSpaceId === space.id ? (
                                                <div className="space-y-3" onClick={e => e.stopPropagation()}>
                                                    <textarea
                                                        autoFocus
                                                        className="w-full min-h-[120px] p-3 text-xs bg-white border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium leading-relaxed"
                                                        value={editRulesContent}
                                                        onChange={(e) => setEditRulesContent(e.target.value)}
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            className="h-8 text-[10px] font-black uppercase tracking-widest"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setEditingRulesSpaceId(null)
                                                            }}
                                                        >
                                                            Cancelar
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            className="h-8 text-[10px] font-black uppercase tracking-widest bg-primary text-white"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleSaveRules(space.id)
                                                            }}
                                                            disabled={isSavingRules}
                                                        >
                                                            {isSavingRules ? <Loader2 size={12} className="animate-spin mr-1" /> : <Save size={12} className="mr-1" />}
                                                            Guardar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className={cn(
                                                    "text-xs font-medium leading-relaxed",
                                                    space.rules ? "text-slate-600 line-clamp-4" : "text-slate-400 italic"
                                                )}>
                                                    {space.rules || 'Haz clic para añadir el reglamento de uso de este espacio...'}
                                                </p>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardFooter className="px-8 py-8 pt-0 mt-2 flex justify-between items-center">
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setAssistantContext({
                                                    type: 'space_rules',
                                                    spaceName: space.name,
                                                    spaceId: space.id
                                                })
                                                setIsAssistantOpen(true)
                                            }}
                                            className="text-primary font-black uppercase text-xs tracking-[0.2em] h-auto p-0 hover:bg-transparent hover:gap-4 transition-all group/btn"
                                        >
                                            GESTIONAR REGLAS IA <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}

                        </div>

                        <div className="bg-slate-900 text-white p-12 rounded-[50px] flex flex-col items-center text-center space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
                            <div className="bg-white/10 p-4 rounded-3xl w-fit shadow-2xl">
                                <ShieldCheck size={48} className="text-primary fill-primary" />
                            </div>
                            <h3 className="text-4xl font-black italic tracking-tighter uppercase max-w-2xl leading-[0.9]">
                                ¿Necesitas ayuda con las reglas de acceso?
                            </h3>
                            <p className="text-slate-400 font-medium text-lg italic max-w-xl">
                                Nuestro Secretario IA puede redactar por ti el reglamento de uso de cada espacio basado en las leyes locales.
                            </p>
                            <Link href="/assistant">
                                <Button className="bg-white text-slate-900 h-14 px-12 rounded-2xl font-black italic uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl relative z-10">
                                    Solicitar a mi Secretario IA
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
                {activeTab === 'neighbors' && (
                    <div className="col-span-3 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase leading-[0.9] mb-2">
                                    Gestión de Vecinos
                                </h3>
                                <p className="text-slate-500 font-medium text-lg italic uppercase tracking-tighter">
                                    Aprueba el acceso de nuevos residentes a la comunidad
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20">
                                <CardHeader className="p-10 pb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <CardTitle className="text-2xl font-black italic tracking-tighter uppercase">Solicitudes Pendientes</CardTitle>
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nuevos vecinos esperando aprobación</p>
                                </CardHeader>
                                <CardContent className="px-10 pb-10 space-y-4">
                                    {neighbors.filter(n => n.status === 'pending').length === 0 ? (
                                        <div className="py-12 flex flex-col items-center text-center space-y-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                            <div className="bg-white p-4 rounded-2xl shadow-sm text-slate-300">
                                                <Users size={32} />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] italic">No hay solicitudes pendientes</p>
                                        </div>
                                    ) : (
                                        neighbors.filter(n => n.status === 'pending').map(neighbor => (
                                            <div key={neighbor.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-amber-200 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                                        <Users size={20} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-black italic uppercase text-slate-900 truncate">{neighbor.full_name || 'Nuevo Vecino'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{neighbor.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        onClick={() => handleApproveNeighbor(neighbor.id)}
                                                        disabled={isProcessingNeighbor === neighbor.id}
                                                        className="h-9 px-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black uppercase italic text-[10px] tracking-widest"
                                                    >
                                                        {isProcessingNeighbor === neighbor.id ? <Loader2 size={14} className="animate-spin" /> : 'Aprobar'}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleRejectNeighbor(neighbor.id)}
                                                        disabled={isProcessingNeighbor === neighbor.id}
                                                        className="h-9 px-4 rounded-xl text-red-500 hover:bg-red-50 font-black uppercase italic text-[10px] tracking-widest"
                                                    >
                                                        Rechazar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20">
                                <CardHeader className="p-10 pb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-primary/10 p-2 rounded-xl text-primary">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <CardTitle className="text-2xl font-black italic tracking-tighter uppercase">Vecinos Activos</CardTitle>
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Residentes con acceso total</p>
                                </CardHeader>
                                <CardContent className="px-10 pb-10 space-y-4">
                                    {neighbors.filter(n => n.status === 'active').map(neighbor => (
                                        <div key={neighbor.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Users size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-black italic uppercase text-slate-900">{neighbor.full_name || 'Sin Nombre'}</p>
                                                        {neighbor.role === 'admin' && <Badge className="bg-slate-900 text-[8px] h-4">ADMIN</Badge>}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{neighbor.email}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] font-black italic uppercase border-primary/20 text-primary">ACTIVO</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
                {activeTab === 'profile' && (
                    <div className="lg:col-span-3 space-y-8 animate-in fade-in zoom-in duration-500">
                        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
                            <CardHeader className="bg-slate-900 text-white p-10">
                                <div className="bg-primary/20 p-3 rounded-2xl w-fit mb-6">
                                    <User size={32} className="text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-black italic tracking-tighter uppercase mb-2">Perfil del Administrador</CardTitle>
                                <p className="text-slate-400 font-medium">Información de contacto pública para las comunidades que administras. Si eres administrador de fincas o el presidente puedes poner aquí tus datos o los de tu empresa.</p>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre del Gestor / Empresa</Label>
                                        <Input className="h-14 rounded-2xl border-2 border-slate-100 font-bold text-lg bg-slate-50" value={editProfileName} onChange={(e) => setEditProfileName(e.target.value)} placeholder="Ej: Gestoría Fincas Sur" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Correo Electrónico (Contacto Público)</Label>
                                        <Input className="h-14 rounded-2xl border-2 border-slate-100 font-bold text-lg bg-slate-50" value={editProfileEmail} onChange={(e) => setEditProfileEmail(e.target.value)} placeholder="Ej: info@fincassur.com" type="email" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Teléfono (Contacto Público)</Label>
                                        <Input className="h-14 rounded-2xl border-2 border-slate-100 font-bold text-lg bg-slate-50" value={editProfilePhone} onChange={(e) => setEditProfilePhone(e.target.value)} placeholder="Ej: 912 345 678 o 600..." />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Dirección de la Oficina</Label>
                                        <Input className="h-14 rounded-2xl border-2 border-slate-100 font-bold text-lg bg-slate-50" value={editProfileAddress} onChange={(e) => setEditProfileAddress(e.target.value)} placeholder="Ej: Calle Principal 1, Planta 2" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Horario de Atención</Label>
                                        <Input className="h-14 rounded-2xl border-2 border-slate-100 font-bold text-lg bg-slate-50" value={editProfileHours} onChange={(e) => setEditProfileHours(e.target.value)} placeholder="Ej: L-V 09:00 a 14:00" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-10 bg-slate-50 flex justify-end">
                                <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="h-12 rounded-xl bg-primary font-black uppercase italic px-10 shadow-lg shadow-primary/20">
                                    {isSavingProfile ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                                    Guardar Perfil
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </div>

            <AssistantDrawer
                isOpen={isAssistantOpen}
                onClose={() => setIsAssistantOpen(false)}
                context={assistantContext}
                onApplyAction={handleApplyRules}
            />
        </div>
    )
}
