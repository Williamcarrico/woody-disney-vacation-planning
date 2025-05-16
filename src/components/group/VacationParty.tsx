import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    UserPlus,
    Users,
    Settings,
    Copy,
    Check,
    CrownIcon,
    Shield,
    LogOut,
    UserX,
} from "lucide-react"
import { toast } from "sonner"
import { doc, collection, getDoc, getDocs, updateDoc, setDoc, query, where, serverTimestamp } from 'firebase/firestore'
import { firestore } from '@/lib/firebase/firebase.config'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types
interface VacationPartyMember {
    id: string
    email: string
    displayName: string
    photoURL?: string
    role: 'owner' | 'admin' | 'member'
    joinedAt: Date
    status: 'active' | 'pending' | 'removed'
}

interface VacationPartySettings {
    allowInvites: boolean
    allowLocationSharing: boolean
    allowItineraryEditing: boolean
    allowPolls: boolean
    privacyLevel: 'public' | 'friends' | 'private'
    notificationPreferences: {
        messages: boolean
        locationUpdates: boolean
        itineraryChanges: boolean
        polls: boolean
    }
}

interface VacationPartyProps {
    readonly vacationId: string
}

export default function VacationParty({ vacationId }: VacationPartyProps) {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
    const [inviteLink, setInviteLink] = useState('')
    const [isLinkCopied, setIsLinkCopied] = useState(false)
    const [editSettingsValues, setEditSettingsValues] = useState<VacationPartySettings | null>(null)
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
    const [memberToRemove, setMemberToRemove] = useState<VacationPartyMember | null>(null)
    const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] = useState(false)

    // Fetch vacation party members
    const { data: partyMembers, isLoading: isMembersLoading } = useQuery({
        queryKey: ['vacationPartyMembers', vacationId],
        queryFn: async () => {
            const membersRef = collection(firestore, 'vacations', vacationId, 'members')
            const snapshot = await getDocs(membersRef)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                joinedAt: doc.data().joinedAt?.toDate() || new Date()
            })) as VacationPartyMember[]
        }
    })

    // Fetch vacation party settings
    const { data: partySettings, isLoading: isSettingsLoading } = useQuery({
        queryKey: ['vacationPartySettings', vacationId],
        queryFn: async () => {
            const settingsRef = doc(firestore, 'vacations', vacationId, 'settings', 'partySettings')
            const snapshot = await getDoc(settingsRef)

            if (!snapshot.exists()) {
                // Create default settings if they don't exist
                const defaultSettings: VacationPartySettings = {
                    allowInvites: true,
                    allowLocationSharing: true,
                    allowItineraryEditing: true,
                    allowPolls: true,
                    privacyLevel: 'private',
                    notificationPreferences: {
                        messages: true,
                        locationUpdates: true,
                        itineraryChanges: true,
                        polls: true
                    }
                }

                await setDoc(settingsRef, defaultSettings)
                return defaultSettings
            }

            return snapshot.data() as VacationPartySettings
        }
    })

    // Check if current user is admin or owner
    const isAdminOrOwner = partyMembers?.find(member =>
        member.id === user?.uid && (member.role === 'admin' || member.role === 'owner')
    )

    // Check if current user is the owner
    const isOwner = partyMembers?.find(member =>
        member.id === user?.uid && member.role === 'owner'
    )

    // Invite mutation
    const inviteMutation = useMutation({
        mutationFn: async (email: string) => {
            // Check if user exists
            const usersRef = collection(firestore, 'users')
            const q = query(usersRef, where('email', '==', email))
            const userSnapshot = await getDocs(q)

            if (userSnapshot.empty) {
                // Create a pending invitation
                const invitationRef = collection(firestore, 'vacations', vacationId, 'invitations')
                await setDoc(doc(invitationRef), {
                    email,
                    role: inviteRole,
                    invitedBy: user?.uid,
                    invitedAt: serverTimestamp(),
                    status: 'pending'
                })

                // TODO: Send email notification

                return { email, status: 'pending' }
            } else {
                // User exists, add them as a member
                const userId = userSnapshot.docs[0].id
                const memberRef = doc(firestore, 'vacations', vacationId, 'members', userId)
                await setDoc(memberRef, {
                    email,
                    displayName: userSnapshot.docs[0].data().displayName || email,
                    photoURL: userSnapshot.docs[0].data().photoURL,
                    role: inviteRole,
                    joinedAt: serverTimestamp(),
                    status: 'pending'
                })

                // Add vacation to user's vacations
                const userVacationsRef = doc(firestore, 'users', userId, 'vacations', vacationId)
                await setDoc(userVacationsRef, {
                    role: inviteRole,
                    joinedAt: serverTimestamp(),
                    status: 'pending'
                })

                return { email, status: 'invited' }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacationPartyMembers', vacationId] })
            setInviteEmail('')
            setIsInviteDialogOpen(false)
            toast("Invitation sent", {
                description: `An invitation has been sent to ${inviteEmail}`,
            })
        },
        onError: (error) => {
            toast.error("Error sending invitation", {
                description: error instanceof Error ? error.message : "Unknown error occurred",
            })
        }
    })

    // Update settings mutation
    const updateSettingsMutation = useMutation({
        mutationFn: async (settings: VacationPartySettings) => {
            const settingsRef = doc(firestore, 'vacations', vacationId, 'settings', 'partySettings')
            // Convert to plain object to satisfy Firestore typing requirements
            const plainSettings = { ...settings }
            await updateDoc(settingsRef, plainSettings)
            return settings
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['vacationPartySettings', vacationId], data)
            setIsSettingsDialogOpen(false)
            toast("Settings updated", {
                description: "Vacation party settings have been updated",
            })
        },
        onError: (error) => {
            toast.error("Error updating settings", {
                description: error instanceof Error ? error.message : "Unknown error occurred",
            })
        }
    })

    // Change member role mutation
    const changeMemberRoleMutation = useMutation({
        mutationFn: async ({ memberId, newRole }: { memberId: string, newRole: 'admin' | 'member' }) => {
            const memberRef = doc(firestore, 'vacations', vacationId, 'members', memberId)
            await updateDoc(memberRef, { role: newRole })

            // Also update in user's vacations
            const userVacationsRef = doc(firestore, 'users', memberId, 'vacations', vacationId)
            await updateDoc(userVacationsRef, { role: newRole })

            return { memberId, newRole }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacationPartyMembers', vacationId] })
            toast("Role updated", {
                description: "Member's role has been updated",
            })
        },
        onError: (error) => {
            toast.error("Error updating role", {
                description: error instanceof Error ? error.message : "Unknown error occurred",
            })
        }
    })

    // Remove member mutation
    const removeMemberMutation = useMutation({
        mutationFn: async (memberId: string) => {
            const memberRef = doc(firestore, 'vacations', vacationId, 'members', memberId)
            await updateDoc(memberRef, { status: 'removed' })

            // Update in user's vacations
            const userVacationsRef = doc(firestore, 'users', memberId, 'vacations', vacationId)
            await updateDoc(userVacationsRef, { status: 'removed' })

            return memberId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacationPartyMembers', vacationId] })
            setIsRemoveMemberDialogOpen(false)
            setMemberToRemove(null)
            toast("Member removed", {
                description: "Member has been removed from the vacation party",
            })
        },
        onError: (error) => {
            toast.error("Error removing member", {
                description: error instanceof Error ? error.message : "Unknown error occurred",
            })
        }
    })

    // Leave vacation party mutation
    const leavePartyMutation = useMutation({
        mutationFn: async () => {
            if (!user?.uid) throw new Error("Not authenticated")

            // If owner, can't leave unless there's another admin
            if (isOwner) {
                const admins = partyMembers?.filter(member =>
                    member.id !== user.uid && member.role === 'admin' && member.status === 'active'
                )

                if (!admins || admins.length === 0) {
                    throw new Error("You must transfer ownership before leaving")
                }

                // Transfer ownership to first admin
                const newOwnerId = admins[0].id
                const newOwnerRef = doc(firestore, 'vacations', vacationId, 'members', newOwnerId)
                await updateDoc(newOwnerRef, { role: 'owner' })

                // Update in user's vacations
                const newOwnerVacationsRef = doc(firestore, 'users', newOwnerId, 'vacations', vacationId)
                await updateDoc(newOwnerVacationsRef, { role: 'owner' })
            }

            // Update current user status
            const memberRef = doc(firestore, 'vacations', vacationId, 'members', user.uid)
            await updateDoc(memberRef, { status: 'removed' })

            // Update in user's vacations
            const userVacationsRef = doc(firestore, 'users', user.uid, 'vacations', vacationId)
            await updateDoc(userVacationsRef, { status: 'removed' })

            return true
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacationPartyMembers', vacationId] })
            setIsLeaveDialogOpen(false)
            toast("Left vacation party", {
                description: "You have left the vacation party",
            })
            // Redirect to vacations list
            window.location.href = '/dashboard'
        },
        onError: (error) => {
            toast.error("Error leaving party", {
                description: error instanceof Error ? error.message : "Unknown error occurred",
            })
        }
    })

    // Generate invite link
    useEffect(() => {
        if (vacationId) {
            setInviteLink(`${window.location.origin}/invite/${vacationId}`)
        }
    }, [vacationId])

    // Initialize edit settings values
    useEffect(() => {
        if (partySettings) {
            setEditSettingsValues(partySettings)
        }
    }, [partySettings])

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault()
        if (inviteEmail) {
            inviteMutation.mutate(inviteEmail)
        }
    }

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink)
        setIsLinkCopied(true)
        setTimeout(() => setIsLinkCopied(false), 3000)
        toast("Link copied", {
            description: "Invite link copied to clipboard",
        })
    }

    const handleSaveSettings = () => {
        if (editSettingsValues) {
            updateSettingsMutation.mutate(editSettingsValues)
        }
    }

    const handleChangeMemberRole = (memberId: string, newRole: 'admin' | 'member') => {
        changeMemberRoleMutation.mutate({ memberId, newRole })
    }

    const handleRemoveMember = (member: VacationPartyMember) => {
        setMemberToRemove(member)
        setIsRemoveMemberDialogOpen(true)
    }

    const confirmRemoveMember = () => {
        if (memberToRemove) {
            removeMemberMutation.mutate(memberToRemove.id)
        }
    }

    const handleLeaveParty = () => {
        setIsLeaveDialogOpen(true)
    }

    const confirmLeaveParty = () => {
        leavePartyMutation.mutate()
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    if (isMembersLoading || isSettingsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Vacation Party
                        </CardTitle>
                        <CardDescription>
                            Manage your vacation party members and settings
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {isAdminOrOwner && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsSettingsDialogOpen(true)}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </Button>
                        )}
                        {isAdminOrOwner && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setIsInviteDialogOpen(true)}
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="members">
                    <TabsList className="mb-4">
                        <TabsTrigger value="members">Members</TabsTrigger>
                        <TabsTrigger value="invitations">Invitations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="members">
                        <ScrollArea className="h-[300px] w-full pr-4">
                            <div className="space-y-4">
                                {partyMembers?.filter(member => member.status === 'active').map(member => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-2 rounded-md border hover:bg-accent/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={member.photoURL} />
                                                <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <div className="font-medium flex items-center gap-2">
                                                    {member.displayName}
                                                    {member.role === 'owner' && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <CrownIcon className="h-4 w-4 text-yellow-500" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Party Owner</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                    {member.role === 'admin' && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Shield className="h-4 w-4 text-blue-500" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Party Admin</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{member.email}</div>
                                            </div>
                                        </div>

                                        {isAdminOrOwner && member.id !== user?.uid && (
                                            <div className="flex gap-2">
                                                {isOwner && (
                                                    <Select
                                                        value={member.role}
                                                        onValueChange={(value) =>
                                                            handleChangeMemberRole(member.id, value as 'admin' | 'member')
                                                        }
                                                        disabled={member.role === 'owner'}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                            <SelectItem value="member">Member</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleRemoveMember(member)}
                                                >
                                                    <UserX className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {member.id === user?.uid && !isOwner && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleLeaveParty}
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Leave
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="invitations">
                        <div className="space-y-4 h-[300px]">
                            {/* Pending invitations - in a real app, fetch from Firebase */}
                            <div className="text-center text-muted-foreground py-8">
                                No pending invitations
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                    {partyMembers?.filter(member => member.status === 'active').length} members
                </div>

                {!isAdminOrOwner && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLeaveParty}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Leave Party
                    </Button>
                )}
            </CardFooter>

            {/* Invite Dialog */}
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite to Vacation Party</DialogTitle>
                        <DialogDescription>
                            Invite friends to join your vacation planning party.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleInvite}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    placeholder="friend@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={inviteRole}
                                    onValueChange={(value) => setInviteRole(value as 'admin' | 'member')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="text-xs text-muted-foreground">
                                    Admins can invite others and manage party settings
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Share invite link</Label>
                                <div className="flex items-center gap-2">
                                    <Input value={inviteLink} readOnly />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopyInviteLink}
                                    >
                                        {isLinkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Anyone with this link can join as a member
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!inviteEmail}>
                                Send Invitation
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Settings Dialog */}
            <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Party Settings</DialogTitle>
                        <DialogDescription>
                            Configure settings for your vacation party.
                        </DialogDescription>
                    </DialogHeader>

                    {editSettingsValues && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="allowInvites">Allow Member Invites</Label>
                                    <div className="text-xs text-muted-foreground">
                                        Let members invite others to join
                                    </div>
                                </div>
                                <Switch
                                    id="allowInvites"
                                    checked={editSettingsValues.allowInvites}
                                    onCheckedChange={(checked) =>
                                        setEditSettingsValues({ ...editSettingsValues, allowInvites: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="allowLocationSharing">Location Sharing</Label>
                                    <div className="text-xs text-muted-foreground">
                                        Allow members to share their location
                                    </div>
                                </div>
                                <Switch
                                    id="allowLocationSharing"
                                    checked={editSettingsValues.allowLocationSharing}
                                    onCheckedChange={(checked) =>
                                        setEditSettingsValues({ ...editSettingsValues, allowLocationSharing: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="allowItineraryEditing">Collaborative Itinerary</Label>
                                    <div className="text-xs text-muted-foreground">
                                        Allow members to edit shared itineraries
                                    </div>
                                </div>
                                <Switch
                                    id="allowItineraryEditing"
                                    checked={editSettingsValues.allowItineraryEditing}
                                    onCheckedChange={(checked) =>
                                        setEditSettingsValues({ ...editSettingsValues, allowItineraryEditing: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="allowPolls">Allow Polls & Voting</Label>
                                    <div className="text-xs text-muted-foreground">
                                        Enable polling and voting features
                                    </div>
                                </div>
                                <Switch
                                    id="allowPolls"
                                    checked={editSettingsValues.allowPolls}
                                    onCheckedChange={(checked) =>
                                        setEditSettingsValues({ ...editSettingsValues, allowPolls: checked })
                                    }
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="privacyLevel">Privacy Level</Label>
                                <Select
                                    value={editSettingsValues.privacyLevel}
                                    onValueChange={(value) =>
                                        setEditSettingsValues({
                                            ...editSettingsValues,
                                            privacyLevel: value as 'public' | 'friends' | 'private'
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">Private (Invitation only)</SelectItem>
                                        <SelectItem value="friends">Friends (Friends can join)</SelectItem>
                                        <SelectItem value="public">Public (Anyone with link)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Notification Preferences</Label>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notifyMessages" className="cursor-pointer">Messages</Label>
                                        <Switch
                                            id="notifyMessages"
                                            checked={editSettingsValues.notificationPreferences.messages}
                                            onCheckedChange={(checked) =>
                                                setEditSettingsValues({
                                                    ...editSettingsValues,
                                                    notificationPreferences: {
                                                        ...editSettingsValues.notificationPreferences,
                                                        messages: checked
                                                    }
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notifyLocation" className="cursor-pointer">Location Updates</Label>
                                        <Switch
                                            id="notifyLocation"
                                            checked={editSettingsValues.notificationPreferences.locationUpdates}
                                            onCheckedChange={(checked) =>
                                                setEditSettingsValues({
                                                    ...editSettingsValues,
                                                    notificationPreferences: {
                                                        ...editSettingsValues.notificationPreferences,
                                                        locationUpdates: checked
                                                    }
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notifyItinerary" className="cursor-pointer">Itinerary Changes</Label>
                                        <Switch
                                            id="notifyItinerary"
                                            checked={editSettingsValues.notificationPreferences.itineraryChanges}
                                            onCheckedChange={(checked) =>
                                                setEditSettingsValues({
                                                    ...editSettingsValues,
                                                    notificationPreferences: {
                                                        ...editSettingsValues.notificationPreferences,
                                                        itineraryChanges: checked
                                                    }
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notifyPolls" className="cursor-pointer">Polls & Voting</Label>
                                        <Switch
                                            id="notifyPolls"
                                            checked={editSettingsValues.notificationPreferences.polls}
                                            onCheckedChange={(checked) =>
                                                setEditSettingsValues({
                                                    ...editSettingsValues,
                                                    notificationPreferences: {
                                                        ...editSettingsValues.notificationPreferences,
                                                        polls: checked
                                                    }
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveSettings}>
                            Save Settings
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Member Confirmation Dialog */}
            <Dialog open={isRemoveMemberDialogOpen} onOpenChange={setIsRemoveMemberDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Member</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this member from your vacation party?
                        </DialogDescription>
                    </DialogHeader>

                    {memberToRemove && (
                        <div className="flex items-center gap-3 py-4">
                            <Avatar>
                                <AvatarImage src={memberToRemove.photoURL} />
                                <AvatarFallback>{getInitials(memberToRemove.displayName)}</AvatarFallback>
                            </Avatar>

                            <div>
                                <div className="font-medium">{memberToRemove.displayName}</div>
                                <div className="text-sm text-muted-foreground">{memberToRemove.email}</div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRemoveMemberDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmRemoveMember}>
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Leave Party Confirmation Dialog */}
            <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Leave Vacation Party</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to leave this vacation party?
                            {isOwner && " As the owner, you'll need to transfer ownership first."}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmLeaveParty}>
                            {isOwner ? "Transfer & Leave" : "Leave Party"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}