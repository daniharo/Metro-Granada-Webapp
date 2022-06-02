// From https://github.com/bence-toth/react-hook-geolocation

export interface EnrichedGeolocationCoordinates extends GeolocationCoordinates {
  timestamp: GeolocationPosition["timestamp"] | null;
  error: GeolocationPositionError | null;
}

export default function useGeolocation(
  positionOptions?: PositionOptions,
  callback?: (geolocation: EnrichedGeolocationCoordinates) => void
): EnrichedGeolocationCoordinates;
