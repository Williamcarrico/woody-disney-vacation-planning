'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Bell, BellOff, Check, X, Loader2 } from 'lucide-react'
import { messaging } from '@/lib/firebase/messaging'

interface NotificationSetupProps {
    className?: string
    showAsCard?: boolean
}

export default function NotificationSetup({ className, showAsCard = true }: NotificationSetupProps) {
    const { user } = useAuth()
    const [isSupported, setIsSupported] = useState(false)
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [fcmToken, setFcmToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isEnabled, setIsEnabled] = useState(false)

    // Check notification support and permission on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsSupported(messaging.canReceiveNotifications())
            setPermission(Notification.permission)

            // Check if user already has token
            const existingToken = messaging.getToken()
            if (existingToken) {
                setFcmToken(existingToken)
                setIsEnabled(true)
            }
        }
    }, [])

    // Handle enabling notifications
    const handleEnableNotifications = async () => {
        if (!user || !isSupported) {
            toast.error('Notifications not supported on this device')
            return
        }

        setIsLoading(true)

        try {
            // Initialize messaging for user
            const token = await messaging.initializeForUser(user.uid)

            if (token) {
                setFcmToken(token)
                setIsEnabled(true)
                setPermission('granted')
                toast.success('Notifications enabled successfully!')
            } else {
                toast.error('Failed to enable notifications')
            }
        } catch (error) {
            console.error('Error enabling notifications:', error)
            toast.error('Failed to enable notifications')
        } finally {
            setIsLoading(false)
        }
    }

    // Handle disabling notifications
    const handleDisableNotifications = async () => {
        if (!user) return

        setIsLoading(true)

        try {
            await messaging.cleanup(user.uid)
            setFcmToken(null)
            setIsEnabled(false)
            toast.success('Notifications disabled')
        } catch (error) {
            console.error('Error disabling notifications:', error)
            toast.error('Failed to disable notifications')
        } finally {
            setIsLoading(false)
        }
    }

    // Handle test notification
    const handleTestNotification = async () => {
        try {
            await messaging.testNotification()
            toast.success('Test notification sent!')
        } catch (error) {
            console.error('Error sending test notification:', error)
            toast.error('Failed to send test notification')
        }
    }

    // Get permission status badge
    const getPermissionBadge = () => {
        switch (permission) {
            case 'granted':
                return <Badge variant="secondary" className="text-green-600"><Check className="h-3 w-3 mr-1" />Enabled</Badge>
            case 'denied':
                return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Blocked</Badge>
            default:
                return <Badge variant="outline">Not Set</Badge>
        }
    }

    // Don't render if user is not authenticated
    if (!user) return null

    const content = (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h4 className="text-sm font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                        Get notified about new messages and updates
                    </p>
                </div>
                {getPermissionBadge()}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {isEnabled ? (
                        <Bell className="h-4 w-4 text-green-600" />
                    ) : (
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">
                        {isEnabled ? 'Notifications Active' : 'Notifications Disabled'}
                    </span>
                </div>

                <Switch
                    checked={isEnabled}
                    onCheckedChange={isEnabled ? handleDisableNotifications : handleEnableNotifications}
                    disabled={isLoading || !isSupported || permission === 'denied'}
                />
            </div>

            {!isSupported && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                    ⚠️ Push notifications are not supported on this device/browser
                </div>
            )}

            {permission === 'denied' && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    🚫 Notifications are blocked. Please enable them in your browser settings.
                </div>
            )}

            {isEnabled && (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTestNotification}
                        disabled={isLoading}
                    >
                        Send Test
                    </Button>

                    {fcmToken && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            Token: {fcmToken.substring(0, 20)}...
                        </div>
                    )}
                </div>
            )}

            {isLoading && (
                <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                        {isEnabled ? 'Disabling...' : 'Enabling...'}
                    </span>
                </div>
            )}
        </div>
    )

    if (showAsCard) {
        return (
            <Card className={className}>
                <CardHeader className="pb-4">
                    <CardTitle className="text-base">Notification Settings</CardTitle>
                    <CardDescription>
                        Configure push notifications for your vacation planning
                    </CardDescription>
                </CardHeader>
                <CardContent>{content}</CardContent>
            </Card>
        )
    }

    return <div className={className}>{content}</div>
}