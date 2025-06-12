"use client"

import { useState } from 'react'
import { Upload, Database, AlertCircle, CheckCircle, FileText, Download } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { RestaurantManager } from '@/components/dining/restaurant-manager'
import { bulkImporter } from '@/scripts/import-restaurants'

interface ImportStatus {
    isImporting: boolean
    progress: number
    message: string
    results?: {
        success: boolean
        totalProcessed: number
        totalImported: number
        totalSkipped: number
        totalErrors: number
        errors: Array<{ restaurant: string; error: string }>
    }
}

export default function RestaurantImportPage() {
    const [importStatus, setImportStatus] = useState<ImportStatus>({
        isImporting: false,
        progress: 0,
        message: ''
    })

    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            if (file.type === 'application/json') {
                setSelectedFile(file)
                setImportStatus({ isImporting: false, progress: 0, message: '' })
            } else {
                alert('Please select a valid JSON file')
            }
        }
    }

    const handleImport = async () => {
        if (!selectedFile) return

        try {
            setImportStatus({
                isImporting: true,
                progress: 10,
                message: 'Reading file...'
            })

            const fileContent = await selectedFile.text()
            const jsonData = JSON.parse(fileContent) as unknown

            setImportStatus({
                isImporting: true,
                progress: 30,
                message: 'Validating data structure...'
            })

            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setImportStatus(prev => ({
                    ...prev,
                    progress: Math.min(prev.progress + 5, 90)
                }))
            }, 1000)

            setImportStatus({
                isImporting: true,
                progress: 50,
                message: 'Importing restaurants to Firebase...'
            })

            const result = await bulkImporter.importFromData(jsonData, {
                batchSize: 25,
                validateData: true,
                logProgress: true
            })

            clearInterval(progressInterval)

            setImportStatus({
                isImporting: false,
                progress: 100,
                message: result.success ? 'Import completed successfully!' : 'Import completed with errors',
                results: result
            })

        } catch (error) {
            setImportStatus({
                isImporting: false,
                progress: 0,
                message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
        }
    }

    const downloadSampleData = () => {
        const sampleData = {
            "metadata": {
                "total_locations": 2,
                "last_updated": "2024-01-01",
                "data_sources": ["Disney Official Website"],
                "note": "Sample data structure for Disney restaurant import"
            },
            "locations": {
                "magic-kingdom": {
                    "name": "Magic Kingdom",
                    "restaurants": [
                        {
                            "id": "sample-restaurant",
                            "name": "Sample Restaurant",
                            "description": "A sample restaurant for testing imports",
                            "location": {
                                "latitude": 28.4177,
                                "longitude": -81.5812,
                                "areaName": "Fantasyland"
                            },
                            "cuisine_types": ["American"],
                            "service_type": "Table Service",
                            "price_range": "$$",
                            "dining_experience": "Casual Dining",
                            "operating_hours": {
                                "Monday": "11:00 AM - 9:00 PM",
                                "Tuesday": "11:00 AM - 9:00 PM",
                                "Wednesday": "11:00 AM - 9:00 PM",
                                "Thursday": "11:00 AM - 9:00 PM",
                                "Friday": "11:00 AM - 9:00 PM",
                                "Saturday": "11:00 AM - 9:00 PM",
                                "Sunday": "11:00 AM - 9:00 PM"
                            },
                            "phone_number": "(407) 939-3463",
                            "reservation_info": {
                                "accepts_reservations": true,
                                "requires_reservations": false,
                                "advance_reservation_days": 60
                            },
                            "dining_plan_info": {
                                "accepts_dining_plan": true,
                                "table_service_credits": 1
                            },
                            "special_features": ["Kids Menu", "Allergy Friendly"],
                            "character_dining": {
                                "has_character_dining": false
                            },
                            "average_rating": 4.2,
                            "tags": ["Family Friendly", "Quick Service"]
                        }
                    ]
                }
            }
        }

        const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'sample-restaurant-data.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <main className="container mx-auto py-8 px-4 md:px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold">Restaurant Data Import</h1>
                    <p className="text-lg text-muted-foreground">
                        Import Disney restaurant data from JSON files into the Firebase database
                    </p>
                </div>

                <Tabs defaultValue="import" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="import">Import Data</TabsTrigger>
                        <TabsTrigger value="manage">Manage Database</TabsTrigger>
                    </TabsList>

                    <TabsContent value="import" className="space-y-6">
                        {/* Import Instructions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Data Format Requirements
                                </CardTitle>
                                <CardDescription>
                                    Your JSON file should follow the Disney restaurant data structure
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium mb-2">Required Structure:</h4>
                                        <ul className="text-sm space-y-1 text-muted-foreground">
                                            <li>• <code>metadata</code> - Import information</li>
                                            <li>• <code>locations</code> - Grouped by park/area</li>
                                            <li>• <code>restaurants</code> - Array of restaurant objects</li>
                                            <li>• All required fields per restaurant</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Supported Features:</h4>
                                        <ul className="text-sm space-y-1 text-muted-foreground">
                                            <li>• Character dining information</li>
                                            <li>• Dining plan compatibility</li>
                                            <li>• Operating hours and reservations</li>
                                            <li>• Menu items and pricing</li>
                                        </ul>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={downloadSampleData}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Sample JSON
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* File Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="h-5 w-5" />
                                    Upload Restaurant Data
                                </CardTitle>
                                <CardDescription>
                                    Select a JSON file containing Disney restaurant data to import
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="border border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="file-upload"
                                        disabled={importStatus.isImporting}
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <div className="space-y-2">
                                            <p className="text-lg font-medium">
                                                {selectedFile ? selectedFile.name : 'Click to select JSON file'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Supports .json files up to 50MB
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {selectedFile && (
                                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <span className="font-medium">{selectedFile.name}</span>
                                            <Badge variant="secondary">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </Badge>
                                        </div>
                                        <Button
                                            onClick={handleImport}
                                            disabled={importStatus.isImporting}
                                        >
                                            {importStatus.isImporting ? (
                                                <>
                                                    <Database className="h-4 w-4 mr-2 animate-spin" />
                                                    Importing...
                                                </>
                                            ) : (
                                                <>
                                                    <Database className="h-4 w-4 mr-2" />
                                                    Start Import
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {/* Progress */}
                                {importStatus.isImporting && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>{importStatus.message}</span>
                                            <span>{importStatus.progress}%</span>
                                        </div>
                                        <Progress value={importStatus.progress} />
                                    </div>
                                )}

                                {/* Results */}
                                {importStatus.results && (
                                    <Alert className={importStatus.results.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                                        <div className="flex items-center gap-2">
                                            {importStatus.results.success ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                            )}
                                            <AlertTitle>
                                                {importStatus.results.success ? 'Import Successful' : 'Import Completed with Issues'}
                                            </AlertTitle>
                                        </div>
                                        <AlertDescription className="mt-2">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium">Processed:</span> {importStatus.results.totalProcessed}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Imported:</span> {importStatus.results.totalImported}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Skipped:</span> {importStatus.results.totalSkipped}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Errors:</span> {importStatus.results.totalErrors}
                                                </div>
                                            </div>
                                            {importStatus.results.errors.length > 0 && (
                                                <details className="mt-4">
                                                    <summary className="cursor-pointer font-medium">View Errors ({importStatus.results.errors.length})</summary>
                                                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                                                        {importStatus.results.errors.map((error, index) => (
                                                            <div key={index} className="text-xs bg-red-100 p-2 rounded">
                                                                <span className="font-medium">{error.restaurant}:</span> {error.error}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </details>
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="manage" className="space-y-6">
                        <RestaurantManager allowManagement={true} />
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    )
}