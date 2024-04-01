/**
 * The `useGeolocation` custom hook in TypeScript utilizes the Geolocation API to provide real-time
 * geolocation data including position accuracy, altitude, heading, latitude, longitude, speed, and
 * timestamp, while handling loading and error states.
 * @returns The `useGeolocation` custom hook returns an object with the following properties:
 * - `loading`: a boolean indicating whether the geolocation data is still loading
 * - `accuracy`: the accuracy of the geolocation coordinates
 * - `altitude`: the altitude in meters above the WGS 84 reference ellipsoid
 * - `altitudeAccuracy`: the accuracy of the altitude in meters
 * - `heading`: the
 */

import { useEffect, useState } from "react";

export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const successHandler = (pos: GeolocationPosition) => {
      setPosition(pos);
      setLoading(false);
    };

    const errorHandler = (err: GeolocationPositionError) => {
      setError(err);
      setLoading(false);
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const geo = navigator.geolocation;
    if (geo) {
      setLoading(true);
      geo.getCurrentPosition(successHandler, errorHandler, options);
    } else {
      setError({ code: 2, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3, message: "Geolocation not supported" });
      setLoading(false)
    }

    return () => {
      geo?.clearWatch(0);
    };
  }, []);

  const accuracy = position?.coords.accuracy || null;
  const altitude = position?.coords.altitude || null;
  const altitudeAccuracy = position?.coords.altitudeAccuracy || null;
  const heading = position?.coords.heading || null;
  const latitude = position?.coords.latitude || null;
  const longitude = position?.coords.longitude || null;
  const speed = position?.coords.speed || null;
  const timestamp = position?.timestamp || null;

  return { loading, accuracy, altitude, altitudeAccuracy, heading, latitude, longitude, speed, timestamp, error };
}