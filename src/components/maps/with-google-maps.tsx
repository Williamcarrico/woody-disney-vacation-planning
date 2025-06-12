import { GoogleMapsProvider } from '@vis.gl/react-google-maps'
import { ReactNode } from 'react'

interface WithGoogleMapsProps {
    children: ReactNode
}

export function withGoogleMaps<T extends Record<string, any>>(
    WrappedComponent: React.ComponentType<T>
) {
    const WithGoogleMapsComponent = (props: T) => {
        return (
            <GoogleMapsProvider>
                <WrappedComponent {...props} />
            </GoogleMapsProvider>
        )
    }

    WithGoogleMapsComponent.displayName = `withGoogleMaps(${WrappedComponent.displayName || WrappedComponent.name
        })`

    return WithGoogleMapsComponent
}

// Alternative: Simple wrapper component
export function GoogleMapsWrapper({ children }: WithGoogleMapsProps) {
    return <GoogleMapsProvider>{children}</GoogleMapsProvider>
}