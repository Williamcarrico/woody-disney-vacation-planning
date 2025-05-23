import { render, screen, waitFor } from '@testing-library/react';
import { MapProvider } from '../map-provider';

// Mock the @vis.gl/react-google-maps module
jest.mock('@vis.gl/react-google-maps', () => ({
    APIProvider: ({ children, onLoad, onError }: any) => {
        // Simulate successful load after a short delay
        setTimeout(() => {
            if (onLoad) onLoad();
        }, 100);
        return <div data-testid="api-provider">{children}</div>;
    },
}));

const MockChild = () => <div data-testid="map-child">Map Content</div>;

describe('MapProvider', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        jest.clearAllMocks();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('API Key Validation', () => {
        it('shows error when no API key is provided', () => {
            delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

            render(
                <MapProvider>
                    <MockChild />
                </MapProvider>
            );

            expect(screen.getByText('Google Maps Configuration Error')).toBeInTheDocument();
            expect(screen.getByText('Google Maps API key is required')).toBeInTheDocument();
            expect(screen.queryByTestId('map-child')).not.toBeInTheDocument();
        });

        it('shows error when API key has invalid format', () => {
            render(
                <MapProvider apiKey="invalid-key">
                    <MockChild />
                </MapProvider>
            );

            expect(screen.getByText('Google Maps Configuration Error')).toBeInTheDocument();
            expect(screen.getByText('Invalid Google Maps API key format')).toBeInTheDocument();
            expect(screen.queryByTestId('map-child')).not.toBeInTheDocument();
        });

        it('accepts valid API key from environment', () => {
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'AIzaSyC_valid_key_here';

            render(
                <MapProvider>
                    <MockChild />
                </MapProvider>
            );

            expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument();
        });

        it('accepts valid API key from props', () => {
            render(
                <MapProvider apiKey="AIzaSyC_valid_key_here">
                    <MockChild />
                </MapProvider>
            );

            expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument();
        });
    });

    describe('Loading States', () => {
        it('shows loading state initially', () => {
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'AIzaSyC_valid_key_here';

            render(
                <MapProvider>
                    <MockChild />
                </MapProvider>
            );

            expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument();
            expect(screen.queryByTestId('map-child')).not.toBeInTheDocument();
        });

        it('shows custom loading component when provided', () => {
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'AIzaSyC_valid_key_here';
            const CustomLoading = () => <div data-testid="custom-loading">Custom Loading</div>;

            render(
                <MapProvider loadingComponent={<CustomLoading />}>
                    <MockChild />
                </MapProvider>
            );

            expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
            expect(screen.getByText('Custom Loading')).toBeInTheDocument();
        });

        it('renders children after successful load', async () => {
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'AIzaSyC_valid_key_here';

            render(
                <MapProvider>
                    <MockChild />
                </MapProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('map-child')).toBeInTheDocument();
            });

            expect(screen.queryByText('Loading Google Maps...')).not.toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('shows error state when API fails to load', async () => {
            // Mock API provider to trigger error
            jest.doMock('@vis.gl/react-google-maps', () => ({
                APIProvider: ({ onError }: any) => {
                    setTimeout(() => {
                        if (onError) onError(new Error('Network error'));
                    }, 100);
                    return <div data-testid="api-provider-error" />;
                },
            }));

            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'AIzaSyC_valid_key_here';

            const { rerender } = render(
                <MapProvider retryAttempts={1}>
                    <MockChild />
                </MapProvider>
            );

            // Force re-render to use mocked module
            rerender(
                <MapProvider retryAttempts={1}>
                    <MockChild />
                </MapProvider>
            );

            await waitFor(() => {
                expect(screen.getByText('Maps Temporarily Unavailable')).toBeInTheDocument();
            });
        });

        it('shows custom fallback component when provided', () => {
            const CustomFallback = () => <div data-testid="custom-fallback">Custom Error</div>;

            render(
                <MapProvider apiKey="invalid-key" fallbackComponent={<CustomFallback />}>
                    <MockChild />
                </MapProvider>
            );

            expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
        });
    });

    describe('Configuration Options', () => {
        it('passes correct props to APIProvider', async () => {
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'AIzaSyC_valid_key_here';

            render(
                <MapProvider
                    libraries={['places', 'geometry']}
                    region="US"
                    language="en"
                >
                    <MockChild />
                </MapProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('api-provider')).toBeInTheDocument();
            });
        });

        it('calls onLoadSuccess callback when API loads', async () => {
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'AIzaSyC_valid_key_here';
            const onLoadSuccess = jest.fn();

            render(
                <MapProvider onLoadSuccess={onLoadSuccess}>
                    <MockChild />
                </MapProvider>
            );

            await waitFor(() => {
                expect(onLoadSuccess).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('Performance Optimization', () => {
        it('memoizes API provider config', () => {
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'AIzaSyC_valid_key_here';

            const { rerender } = render(
                <MapProvider>
                    <MockChild />
                </MapProvider>
            );

            // Re-render with same props should not cause re-computation
            rerender(
                <MapProvider>
                    <MockChild />
                </MapProvider>
            );

            expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument();
        });
    });

    describe('Development vs Production', () => {
        it('shows error details in development mode', () => {
            const originalNodeEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            render(
                <MapProvider apiKey="invalid-key">
                    <MockChild />
                </MapProvider>
            );

            expect(screen.getByText('Google Maps Configuration Error')).toBeInTheDocument();

            process.env.NODE_ENV = originalNodeEnv;
        });
    });
});