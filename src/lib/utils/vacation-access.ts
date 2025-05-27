import { getVacation } from '@/lib/firebase/realtime-database'

/**
 * Vacation access permission levels
 */
export type VacationPermission = 'view' | 'edit' | 'manage'

/**
 * Vacation member roles
 */
export type VacationRole = 'owner' | 'editor' | 'viewer'

/**
 * Access verification result
 */
export interface AccessVerificationResult {
    hasAccess: boolean
    userRole?: VacationRole
    error?: string
    permissions?: {
        canView: boolean
        canEdit: boolean
        canManage: boolean
        canInvite: boolean
        canManageBudget: boolean
    }
}

/**
 * Message operation permissions result
 */
export interface MessagePermissionResult {
    canPerform: boolean
    userRole?: VacationRole
    error?: string
}

/**
 * Verify if a user has access to a vacation with comprehensive permission checking
 * @param vacationId - The vacation ID to check access for
 * @param userId - The user ID to verify access for
 * @param requiredPermission - The minimum permission level required
 * @returns Promise<AccessVerificationResult>
 */
export async function verifyVacationAccess(
    vacationId: string,
    userId: string,
    requiredPermission: VacationPermission = 'view'
): Promise<AccessVerificationResult> {
    try {
        // Input validation
        if (!vacationId || !userId) {
            return {
                hasAccess: false,
                error: 'Vacation ID and user ID are required'
            }
        }

        if (vacationId.length < 10 || userId.length < 10) {
            return {
                hasAccess: false,
                error: 'Invalid vacation ID or user ID format'
            }
        }

        // Fetch vacation data from Firebase Realtime Database
        const vacation = await getVacation(vacationId)

        if (!vacation) {
            return {
                hasAccess: false,
                error: 'Vacation not found'
            }
        }

        // Check if user is a member of this vacation
        const userMembership = vacation.members?.[userId]

        if (!userMembership) {
            return {
                hasAccess: false,
                error: 'User is not a member of this vacation'
            }
        }

        const userRole = userMembership.role as VacationRole

        // Define permission hierarchy
        const permissionLevels: Record<VacationPermission, VacationRole[]> = {
            'view': ['owner', 'editor', 'viewer'],
            'edit': ['owner', 'editor'],
            'manage': ['owner']
        }

        // Check if user's role meets the required permission level
        const allowedRoles = permissionLevels[requiredPermission]
        const hasAccess = allowedRoles.includes(userRole)

        if (!hasAccess) {
            return {
                hasAccess: false,
                userRole,
                error: `Insufficient permissions. Required: ${requiredPermission}, User role: ${userRole}`
            }
        }

        // Generate detailed permissions based on role and membership settings
        const permissions = {
            canView: true, // All members can view
            canEdit: ['owner', 'editor'].includes(userRole),
            canManage: userRole === 'owner',
            canInvite: userMembership.permissions?.inviteOthers || userRole === 'owner',
            canManageBudget: userMembership.permissions?.manageBudget || userRole === 'owner'
        }

        return {
            hasAccess: true,
            userRole,
            permissions
        }

    } catch (error) {
        console.error('Error verifying vacation access:', error)
        return {
            hasAccess: false,
            error: 'Failed to verify vacation access'
        }
    }
}

/**
 * Verify if a user can perform specific message operations
 * @param vacationId - The vacation ID
 * @param userId - The user ID
 * @param operation - The operation type
 * @param messageUserId - For edit/delete operations, the ID of the message author
 * @returns Promise<MessagePermissionResult>
 */
export async function verifyMessagePermissions(
    vacationId: string,
    userId: string,
    operation: 'read' | 'send' | 'edit' | 'delete',
    messageUserId?: string
): Promise<MessagePermissionResult> {
    // First verify basic vacation access
    const accessCheck = await verifyVacationAccess(vacationId, userId, 'view')

    if (!accessCheck.hasAccess) {
        return {
            canPerform: false,
            error: accessCheck.error
        }
    }

    const userRole = accessCheck.userRole!

    switch (operation) {
        case 'read':
            // All vacation members can read messages
            return { canPerform: true, userRole }

        case 'send':
            // All vacation members can send messages
            return { canPerform: true, userRole }

        case 'edit':
            // Users can edit their own messages, owners can edit any message
            if (userRole === 'owner' || userId === messageUserId) {
                return { canPerform: true, userRole }
            }
            return {
                canPerform: false,
                userRole,
                error: 'You can only edit your own messages'
            }

        case 'delete':
            // Users can delete their own messages, owners can delete any message
            if (userRole === 'owner' || userId === messageUserId) {
                return { canPerform: true, userRole }
            }
            return {
                canPerform: false,
                userRole,
                error: 'You can only delete your own messages'
            }

        default:
            return {
                canPerform: false,
                error: 'Invalid operation'
            }
    }
}

/**
 * Check if a user is the owner of a vacation
 * @param vacationId - The vacation ID
 * @param userId - The user ID to check
 * @returns Promise<boolean>
 */
export async function isVacationOwner(vacationId: string, userId: string): Promise<boolean> {
    const accessCheck = await verifyVacationAccess(vacationId, userId, 'view')
    return accessCheck.hasAccess && accessCheck.userRole === 'owner'
}

/**
 * Check if a user can invite others to a vacation
 * @param vacationId - The vacation ID
 * @param userId - The user ID to check
 * @returns Promise<boolean>
 */
export async function canInviteToVacation(vacationId: string, userId: string): Promise<boolean> {
    const accessCheck = await verifyVacationAccess(vacationId, userId, 'view')
    return accessCheck.hasAccess && (accessCheck.permissions?.canInvite || false)
}

/**
 * Get user's role in a vacation
 * @param vacationId - The vacation ID
 * @param userId - The user ID
 * @returns Promise<VacationRole | null>
 */
export async function getUserVacationRole(vacationId: string, userId: string): Promise<VacationRole | null> {
    const accessCheck = await verifyVacationAccess(vacationId, userId, 'view')
    return accessCheck.hasAccess ? accessCheck.userRole || null : null
}

/**
 * Validate vacation and message IDs format
 * @param vacationId - The vacation ID to validate
 * @param messageId - Optional message ID to validate
 * @returns { isValid: boolean, error?: string }
 */
export function validateIds(vacationId: string, messageId?: string): { isValid: boolean, error?: string } {
    if (!vacationId || vacationId.length < 10) {
        return { isValid: false, error: 'Invalid vacation ID format' }
    }

    if (messageId && messageId.length < 10) {
        return { isValid: false, error: 'Invalid message ID format' }
    }

    return { isValid: true }
}

/**
 * Validate message content
 * @param content - The message content to validate
 * @param maxLength - Maximum allowed length (default: 2000)
 * @returns { isValid: boolean, error?: string }
 */
export function validateMessageContent(content: string, maxLength: number = 2000): { isValid: boolean, error?: string } {
    if (!content || content.trim().length === 0) {
        return { isValid: false, error: 'Message content cannot be empty' }
    }

    if (content.length > maxLength) {
        return { isValid: false, error: `Message content too long (max ${maxLength} characters)` }
    }

    return { isValid: true }
}

/**
 * Validate message type
 * @param type - The message type to validate
 * @returns { isValid: boolean, error?: string }
 */
export function validateMessageType(type: string): { isValid: boolean, error?: string } {
    const validTypes = ['text', 'location', 'photo', 'poll']

    if (!validTypes.includes(type)) {
        return { isValid: false, error: 'Invalid message type' }
    }

    return { isValid: true }
}