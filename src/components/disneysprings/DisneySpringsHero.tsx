"use client"

import { useDisneySpringsMetadata, useOperationalInfo } from '@/lib/utils/disneySpringsData'
import { MapPin, Clock, Car, Bus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function DisneySpringsHero() {
    const { metadata, loading: metadataLoading } = useDisneySpringsMetadata()
    const { operationalInfo, loading: operationalLoading } = useOperationalInfo()

    const loading = metadataLoading || operationalLoading

    return (
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 h-96">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/disney-springs/disney-springs-hero.jpg')] bg-cover bg-center opacity-30"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            <div className="relative flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                        {metadata?.name || 'Disney Springs'}
                    </h1>

                    <p className="text-xl lg:text-2xl text-white/90 max-w-4xl mb-6">
                        {metadata?.description || 'Discover a vibrant waterfront district filled with unique shops, incredible dining, and world-class entertainment.'}
                    </p>

                    {!loading && (
                        <div className="flex flex-wrap justify-center gap-4 mb-6">
                            {metadata?.size && (
                                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {metadata.size}
                                </Badge>
                            )}

                            {operationalInfo?.hours?.general?.weekdays && (
                                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {operationalInfo.hours.general.weekdays}
                                </Badge>
                            )}

                            {operationalInfo?.parking?.cost && (
                                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                                    <Car className="w-4 h-4 mr-2" />
                                    {operationalInfo.parking.cost}
                                </Badge>
                            )}

                            {operationalInfo?.transportation?.bus && (
                                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                                    <Bus className="w-4 h-4 mr-2" />
                                    Resort Transportation
                                </Badge>
                            )}
                        </div>
                    )}

                    {metadata?.location && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/80">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <span className="text-sm lg:text-base">{metadata.location.address}</span>
                            </div>
                            <div className="text-sm lg:text-base">
                                {metadata.location.resort}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}