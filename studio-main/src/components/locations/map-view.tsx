
'use client';

import { useState, useCallback, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Loader } from 'lucide-react';

type Place = {
    name: string;
    vicinity: string;
    rating?: number;
    geometry: {
        location: {
            lat: number;
            lng: number;
        }
    };
    place_id: string;
};

type MapViewProps = {
    category: 'pharmacy' | 'hospital' | 'blood_bank'; // Mapped to Google Places types
    apiKey: string;
};

// Helper to get marker styles based on category
function getMarkerConfig(category: string) {
    switch (category) {
        case 'pharmacy': // Medical Shops
            return { background: '#4285F4', glyph: '💊', borderColor: '#1558D6' }; // Blue
        case 'hospital': // Hospitals
            return { background: '#0F9D58', glyph: '🏥', borderColor: '#006425' }; // Green
        case 'blood_bank': // Blood Banks
            return { background: '#EA4335', glyph: '🩸', borderColor: '#B31412' }; // Red
        default:
            return { background: '#EA4335', glyph: '', borderColor: '#B31412' };
    }
}

// Internal component to handle Places Service which requires the map instance AND the places library
function PlacesUpdater({ category, onPlacesFound }: { category: string, onPlacesFound: (places: Place[]) => void }) {
    const map = useMap();
    const placesLib = useMapsLibrary('places'); // Automatically creates a script tag for the library

    useEffect(() => {
        if (!map || !placesLib) return;

        const placesService = new placesLib.PlacesService(map);

        // Convert our category to Google Places type
        let type = 'pharmacy';
        if (category === 'hospital') type = 'hospital';
        if (category === 'blood_bank') type = 'health';

        console.log(`[Map] Searching for ${category} near`, map.getCenter()?.toJSON());

        const request: google.maps.places.PlaceSearchRequest = {
            location: map.getCenter(),
            radius: 5000,
            type: type !== 'health' ? type : undefined,
            keyword: category === 'blood_bank' ? 'blood bank' : undefined
        };

        placesService.nearbySearch(request, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
            console.log(`[Map] Search status for ${category}:`, status);

            if (status === placesLib.PlacesServiceStatus.OK && results) {
                console.log(`[Map] Found ${results.length} places`);
                // Cast to simplified Place type
                const mappedPlaces: Place[] = results.map(r => ({
                    name: r.name || 'Unknown',
                    vicinity: r.vicinity || '',
                    rating: r.rating,
                    geometry: {
                        location: {
                            lat: r.geometry?.location?.lat() || 0,
                            lng: r.geometry?.location?.lng() || 0
                        }
                    },
                    place_id: r.place_id || Math.random().toString()
                }));
                onPlacesFound(mappedPlaces);
            } else {
                console.warn(`[Map] No places found or error: ${status}`);
                onPlacesFound([]);
            }
        });

    }, [map, placesLib, category, onPlacesFound]);

    return null;
}

export default function MapView({ category, apiKey }: MapViewProps) {
    // Default to a central location (e.g., New Delhi) or browser geo-location
    const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 });
    const [places, setPlaces] = useState<Place[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

    const markerConfig = getMarkerConfig(category);

    // Get user location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCenter({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => {
                    console.log("Geolocation permission denied or error.");
                }
            );
        }
    }, []);

    if (!apiKey) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">
                <p>Google Maps API Key is missing.</p>
                <p className="text-sm">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.</p>
            </div>
        );
    }

    return (
        <div className="h-[500px] w-full overflow-hidden rounded-lg border shadow-sm relative">
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={center}
                    center={center}
                    defaultZoom={13}
                    mapId="DEMO_MAP_ID" // Required for AdvancedMarker
                    onCameraChanged={(ev) => setCenter(ev.detail.center)}
                    className="w-full h-full"
                >
                    {/* User Location Marker (Green) */}
                    <AdvancedMarker position={center}>
                        <Pin background={'#0F9D58'} glyphColor={'#FFF'} borderColor={'#006425'} />
                    </AdvancedMarker>

                    {/* Places Markers (Dynamic Color) */}
                    {places.map(place => (
                        <AdvancedMarker
                            key={place.place_id}
                            position={place.geometry.location}
                            onClick={() => setSelectedPlace(place)}
                        >
                            <Pin
                                background={markerConfig.background}
                                glyph={markerConfig.glyph}
                                borderColor={markerConfig.borderColor}
                                glyphColor={'#FFF'}
                            />
                        </AdvancedMarker>
                    ))}

                    {selectedPlace && (
                        <InfoWindow
                            position={selectedPlace.geometry.location}
                            onCloseClick={() => setSelectedPlace(null)}
                        >
                            <div className="text-black p-2 min-w-[200px]">
                                <h3 className="font-bold text-lg">{selectedPlace.name}</h3>
                                <p className="text-sm">{selectedPlace.vicinity}</p>
                                {selectedPlace.rating && (
                                    <div className="flex items-center mt-1">
                                        <span className="text-yellow-600 font-bold mr-1">{selectedPlace.rating}</span>
                                        <span className="text-xs text-gray-500">Stars</span>
                                    </div>
                                )}
                            </div>
                        </InfoWindow>
                    )}

                    <PlacesUpdater category={category} onPlacesFound={setPlaces} />
                </Map>
            </APIProvider>
        </div>
    );
}
