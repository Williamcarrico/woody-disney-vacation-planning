import {
  Storage,
  StorageReference,
  UploadResult,
  UploadTask,
  UploadTaskSnapshot,
  ref,
  uploadBytes,
  uploadBytesResumable,
  uploadString,
  getDownloadURL,
  deleteObject,
  listAll,
  list,
  getMetadata,
  updateMetadata,
  FullMetadata,
  UploadMetadata,
  StringFormat,
  ListOptions,
  ListResult,
  StorageError
} from 'firebase/storage'
import { getClientStorage } from './client-optimized'
import { performanceMonitor, SmartCache } from './firebase-performance'
import { firebaseErrorHandler, FirebaseErrorType } from './firebase-error-handler'

// Upload options with enhanced features
export interface UploadOptions {
  metadata?: UploadMetadata
  onProgress?: (progress: number, snapshot: UploadTaskSnapshot) => void
  onPause?: () => void
  onResume?: () => void
  resumable?: boolean
  maxRetries?: number
  compress?: boolean
  maxSizeMB?: number
  maxWidthOrHeight?: number
  contentType?: string
}

// Download options
export interface DownloadOptions {
  useCache?: boolean
  cacheTTL?: number
}

// List options
export interface StorageListOptions extends ListOptions {
  recursive?: boolean
  filesOnly?: boolean
  foldersOnly?: boolean
}

// File info interface
export interface FileInfo {
  name: string
  fullPath: string
  size: number
  contentType?: string
  timeCreated: string
  updated: string
  downloadURL?: string
  metadata?: Record<string, string>
}

// Optimized Storage Service
export class StorageService {
  private static instance: StorageService | null = null
  private storage: Storage
  private cache: SmartCache<string> // Cache for download URLs
  private activeUploads = new Map<string, UploadTask>()

  private constructor() {
    this.storage = getClientStorage()
    this.cache = new SmartCache('storage_urls', {
      ttl: 60 * 60 * 1000, // 1 hour for URLs
      maxSize: 500
    })
  }

  static getInstance(): StorageService {
    if (!this.instance) {
      this.instance = new StorageService()
    }
    return this.instance
  }

  // Generate storage path based on context
  private generatePath(
    context: 'user' | 'vacation' | 'public',
    contextId: string,
    folder: string,
    filename: string
  ): string {
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    
    switch (context) {
      case 'user':
        return `users/${contextId}/${folder}/${timestamp}_${sanitizedFilename}`
      case 'vacation':
        return `vacations/${contextId}/${folder}/${timestamp}_${sanitizedFilename}`
      case 'public':
        return `public/${folder}/${sanitizedFilename}`
      default:
        throw new Error('Invalid storage context')
    }
  }

  // Compress image before upload
  private async compressImage(
    file: File,
    maxSizeMB: number = 1,
    maxWidthOrHeight: number = 1920
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const img = new Image()
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          
          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidthOrHeight) {
              height *= maxWidthOrHeight / width
              width = maxWidthOrHeight
            }
          } else {
            if (height > maxWidthOrHeight) {
              width *= maxWidthOrHeight / height
              height = maxWidthOrHeight
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }
          
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to compress image'))
              }
            },
            file.type,
            0.9 // 90% quality
          )
        }
        
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  // Upload file with enhanced features
  async uploadFile(
    file: File | Blob,
    path: string,
    options: UploadOptions = {}
  ): Promise<{ downloadURL: string; metadata: FullMetadata }> {
    const trace = performanceMonitor.startTrace('storage_upload', { path })
    
    try {
      let uploadData: File | Blob = file
      
      // Compress image if requested
      if (options.compress && file instanceof File && file.type.startsWith('image/')) {
        uploadData = await this.compressImage(
          file,
          options.maxSizeMB,
          options.maxWidthOrHeight
        )
      }
      
      // Prepare metadata
      const metadata: UploadMetadata = {
        contentType: options.contentType || (file instanceof File ? file.type : 'application/octet-stream'),
        cacheControl: 'public, max-age=3600',
        ...options.metadata
      }
      
      const storageRef = ref(this.storage, path)
      
      // Use resumable upload for large files or if requested
      if (options.resumable || (uploadData.size > 5 * 1024 * 1024)) { // 5MB
        const uploadTask = uploadBytesResumable(storageRef, uploadData, metadata)
        
        // Store active upload
        this.activeUploads.set(path, uploadTask)
        
        // Handle progress
        if (options.onProgress) {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              options.onProgress!(progress, snapshot)
            },
            undefined,
            undefined
          )
        }
        
        // Handle pause/resume
        if (options.onPause) {
          uploadTask.pause()
          options.onPause()
        }
        
        if (options.onResume) {
          uploadTask.resume()
          options.onResume()
        }
        
        // Wait for upload with retry logic
        const snapshot = await firebaseErrorHandler.executeWithProtection(
          () => uploadTask,
          {
            operationName: 'storage_upload_resumable',
            metadata: { path, size: uploadData.size },
            retryConfig: {
              maxRetries: options.maxRetries || 3,
              retryableErrors: [FirebaseErrorType.NETWORK, FirebaseErrorType.UNAVAILABLE]
            }
          }
        )
        
        // Remove from active uploads
        this.activeUploads.delete(path)
        
        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref)
        
        trace?.stop()
        
        return {
          downloadURL,
          metadata: snapshot.metadata
        }
        
      } else {
        // Simple upload for small files
        const snapshot = await firebaseErrorHandler.executeWithProtection(
          () => uploadBytes(storageRef, uploadData, metadata),
          {
            operationName: 'storage_upload_simple',
            metadata: { path, size: uploadData.size }
          }
        )
        
        const downloadURL = await getDownloadURL(snapshot.ref)
        
        trace?.stop()
        
        return {
          downloadURL,
          metadata: snapshot.metadata
        }
      }
      
    } catch (error) {
      trace?.stop()
      this.activeUploads.delete(path)
      throw error
    }
  }

  // Upload string data (base64, data URL, etc.)
  async uploadString(
    data: string,
    path: string,
    format: StringFormat,
    options: UploadOptions = {}
  ): Promise<{ downloadURL: string; metadata: FullMetadata }> {
    const trace = performanceMonitor.startTrace('storage_upload_string', { path, format })
    
    try {
      const storageRef = ref(this.storage, path)
      const metadata: UploadMetadata = {
        cacheControl: 'public, max-age=3600',
        ...options.metadata
      }
      
      const snapshot = await firebaseErrorHandler.executeWithProtection(
        () => uploadString(storageRef, data, format, metadata),
        {
          operationName: 'storage_upload_string',
          metadata: { path, format }
        }
      )
      
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      trace?.stop()
      
      return {
        downloadURL,
        metadata: snapshot.metadata
      }
      
    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Get download URL with caching
  async getDownloadURL(path: string, options: DownloadOptions = {}): Promise<string> {
    const { useCache = true, cacheTTL } = options
    const trace = performanceMonitor.startTrace('storage_get_url', { path })
    
    try {
      if (useCache) {
        const url = await this.cache.get(
          `url:${path}`,
          async () => {
            const storageRef = ref(this.storage, path)
            return getDownloadURL(storageRef)
          },
          { ttl: cacheTTL }
        )
        
        trace?.stop()
        return url
      }
      
      // Direct fetch without cache
      const storageRef = ref(this.storage, path)
      const url = await firebaseErrorHandler.executeWithProtection(
        () => getDownloadURL(storageRef),
        {
          operationName: 'storage_get_url',
          metadata: { path }
        }
      )
      
      trace?.stop()
      return url
      
    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Delete file
  async deleteFile(path: string): Promise<void> {
    const trace = performanceMonitor.startTrace('storage_delete', { path })
    
    try {
      const storageRef = ref(this.storage, path)
      
      await firebaseErrorHandler.executeWithProtection(
        () => deleteObject(storageRef),
        {
          operationName: 'storage_delete',
          metadata: { path }
        }
      )
      
      // Invalidate cache
      this.cache.invalidate(`url:${path}`)
      
      trace?.stop()
      
    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // List files in a path
  async listFiles(path: string, options: StorageListOptions = {}): Promise<FileInfo[]> {
    const trace = performanceMonitor.startTrace('storage_list', { path })
    
    try {
      const storageRef = ref(this.storage, path)
      const files: FileInfo[] = []
      
      if (options.recursive) {
        // Recursive listing
        const result = await listAll(storageRef)
        
        // Process files
        if (!options.foldersOnly) {
          for (const item of result.items) {
            const metadata = await getMetadata(item)
            files.push({
              name: item.name,
              fullPath: item.fullPath,
              size: metadata.size,
              contentType: metadata.contentType,
              timeCreated: metadata.timeCreated,
              updated: metadata.updated,
              metadata: metadata.customMetadata
            })
          }
        }
        
        // Process folders recursively
        if (!options.filesOnly) {
          for (const prefix of result.prefixes) {
            const subFiles = await this.listFiles(prefix.fullPath, options)
            files.push(...subFiles)
          }
        }
        
      } else {
        // Non-recursive listing
        const listOptions: ListOptions = {
          maxResults: options.maxResults,
          pageToken: options.pageToken
        }
        
        const result = await list(storageRef, listOptions)
        
        // Process files
        if (!options.foldersOnly) {
          for (const item of result.items) {
            const metadata = await getMetadata(item)
            files.push({
              name: item.name,
              fullPath: item.fullPath,
              size: metadata.size,
              contentType: metadata.contentType,
              timeCreated: metadata.timeCreated,
              updated: metadata.updated,
              metadata: metadata.customMetadata
            })
          }
        }
      }
      
      trace?.stop()
      return files
      
    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Get file metadata
  async getFileMetadata(path: string): Promise<FullMetadata> {
    const trace = performanceMonitor.startTrace('storage_get_metadata', { path })
    
    try {
      const storageRef = ref(this.storage, path)
      
      const metadata = await firebaseErrorHandler.executeWithProtection(
        () => getMetadata(storageRef),
        {
          operationName: 'storage_get_metadata',
          metadata: { path }
        }
      )
      
      trace?.stop()
      return metadata
      
    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Update file metadata
  async updateFileMetadata(path: string, metadata: UploadMetadata): Promise<FullMetadata> {
    const trace = performanceMonitor.startTrace('storage_update_metadata', { path })
    
    try {
      const storageRef = ref(this.storage, path)
      
      const updatedMetadata = await firebaseErrorHandler.executeWithProtection(
        () => updateMetadata(storageRef, metadata),
        {
          operationName: 'storage_update_metadata',
          metadata: { path }
        }
      )
      
      trace?.stop()
      return updatedMetadata
      
    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Cancel active upload
  cancelUpload(path: string): boolean {
    const uploadTask = this.activeUploads.get(path)
    if (uploadTask) {
      uploadTask.cancel()
      this.activeUploads.delete(path)
      return true
    }
    return false
  }

  // Pause active upload
  pauseUpload(path: string): boolean {
    const uploadTask = this.activeUploads.get(path)
    if (uploadTask) {
      uploadTask.pause()
      return true
    }
    return false
  }

  // Resume paused upload
  resumeUpload(path: string): boolean {
    const uploadTask = this.activeUploads.get(path)
    if (uploadTask) {
      uploadTask.resume()
      return true
    }
    return false
  }

  // Get active uploads
  getActiveUploads(): string[] {
    return Array.from(this.activeUploads.keys())
  }

  // Clear URL cache
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache statistics
  getCacheStats() {
    return this.cache.getStats()
  }

  // Convenience methods for specific contexts
  async uploadUserFile(
    userId: string,
    file: File,
    folder: 'profile' | 'photos' | 'documents',
    options?: UploadOptions
  ) {
    const path = this.generatePath('user', userId, folder, file.name)
    return this.uploadFile(file, path, options)
  }

  async uploadVacationFile(
    vacationId: string,
    file: File,
    folder: 'photos' | 'documents' | 'itineraries',
    options?: UploadOptions
  ) {
    const path = this.generatePath('vacation', vacationId, folder, file.name)
    return this.uploadFile(file, path, options)
  }

  async uploadPublicFile(
    file: File,
    folder: 'attractions' | 'restaurants' | 'parks',
    options?: UploadOptions
  ) {
    const path = this.generatePath('public', '', folder, file.name)
    return this.uploadFile(file, path, options)
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance()

// Export convenience functions
export const uploadFile = (file: File | Blob, path: string, options?: UploadOptions) =>
  storageService.uploadFile(file, path, options)

export const getFileURL = (path: string, options?: DownloadOptions) =>
  storageService.getDownloadURL(path, options)

export const deleteFile = (path: string) =>
  storageService.deleteFile(path)

export const listFiles = (path: string, options?: StorageListOptions) =>
  storageService.listFiles(path, options)

export const uploadUserPhoto = (userId: string, file: File, options?: UploadOptions) =>
  storageService.uploadUserFile(userId, file, 'photos', options)

export const uploadVacationPhoto = (vacationId: string, file: File, options?: UploadOptions) =>
  storageService.uploadVacationFile(vacationId, file, 'photos', options)