"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { logAuthDebugInfo, testFirestorePermissions, debugAuthState } from '@/lib/firebase/auth-debug'
import type { AuthDebugInfo } from '@/lib/firebase/auth-debug'

export default function AuthDebugPanel() {
    const { user, loading } = useAuth()
    const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleDebugAuth = async () => {
        setIsLoading(true)
        try {
            const info = await debugAuthState()
            setDebugInfo(info)
            await logAuthDebugInfo()
        } catch (error) {
            console.error('Debug auth failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleTestPermissions = async () => {
        setIsLoading(true)
        try {
            await testFirestorePermissions()
        } catch (error) {
            console.error('Permission test failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (loading) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>🔐 Auth Debug Panel</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Loading authentication state...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>🔐 Auth Debug Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span>Status:</span>
                        <Badge variant={user ? "default" : "destructive"}>
                            {user ? "Authenticated" : "Not Authenticated"}
                        </Badge>
                    </div>

                    {user && (
                        <div className="text-sm space-y-1">
                            <p><strong>UID:</strong> {user.uid}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Verified:</strong> {user.emailVerified ? '✅' : '❌'}</p>
                            <p><strong>Name:</strong> {user.displayName || 'Not set'}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Button
                        onClick={handleDebugAuth}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Debugging...' : 'Debug Auth State'}
                    </Button>

                    <Button
                        onClick={handleTestPermissions}
                        disabled={isLoading || !user}
                        variant="outline"
                        className="w-full"
                    >
                        {isLoading ? 'Testing...' : 'Test Firestore Permissions'}
                    </Button>
                </div>

                {debugInfo && (
                    <div className="space-y-2 text-xs border-t pt-4">
                        <h4 className="font-semibold">Debug Results:</h4>
                        <div className="space-y-1">
                            <p><strong>Authenticated:</strong> {debugInfo.isAuthenticated ? '✅' : '❌'}</p>
                            {debugInfo.error && (
                                <p className="text-red-600"><strong>Error:</strong> {debugInfo.error}</p>
                            )}
                            {debugInfo.user && (
                                <p><strong>UID:</strong> {debugInfo.user.uid}</p>
                            )}
                            {debugInfo.idToken && (
                                <p><strong>Token:</strong> {debugInfo.idToken.substring(0, 20)}...</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="text-xs text-muted-foreground border-t pt-4">
                    <p>💡 Check the browser console for detailed logs</p>
                    <p>🔥 Open DevTools → Console to see Firebase debug info</p>
                </div>
            </CardContent>
        </Card>
    )
}