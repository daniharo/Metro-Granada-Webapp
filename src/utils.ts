import { STOPS_POSITION } from "./constants";
import { Coordinate } from "./types";
import { EnrichedGeolocationCoordinates } from "./hooks/useGeolocation";

function getDistanceFromLatLonInKm(
  positionA: Coordinate,
  positionB: Coordinate
) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(positionB.latitude - positionA.latitude); // deg2rad below
  const dLon = deg2rad(positionB.longitude - positionA.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(positionA.latitude)) *
      Math.cos(deg2rad(positionB.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const getNearestStopForLocation = (
  position: EnrichedGeolocationCoordinates
) => {
  if (position.error) return null;
  const distances = Object.keys(STOPS_POSITION).map((key) => ({
    key,
    distance: getDistanceFromLatLonInKm(position, STOPS_POSITION[key]),
  }));
  return +distances.reduce((previousValue, currentValue) =>
    previousValue.distance < currentValue.distance
      ? previousValue
      : currentValue
  ).key;
};
