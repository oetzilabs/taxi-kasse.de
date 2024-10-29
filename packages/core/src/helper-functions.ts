export module Helper {
  export const toRadians = (degrees: number) => degrees * (Math.PI / 180);

  export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = Helper.toRadians(lat2 - lat1); // deg2rad below
    const dLng = Helper.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(Helper.toRadians(lat1)) * Math.cos(Helper.toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  export const findPointsWithinRadius = (
    points: { lat: number; lng: number; address: string }[],
    centerLat: number,
    centerLng: number,
    radius: number,
  ) => {
    const pointsWithinRadius = []; // Array to store points within the radius

    // Loop through each point
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const distance = calculateDistance(centerLat, centerLng, point.lat, point.lng);

      // Check if the point is within the radius
      if (distance <= radius) {
        pointsWithinRadius.push({ ...point, distance });
      }
    }

    // Sort the points by distance (closest first)
    pointsWithinRadius.sort((a, b) => a.distance - b.distance);

    return pointsWithinRadius;
  };

  // Function to calculate the centroid of a list of points
  export const calculateCentroid = (
    points: { lat: number; lng: number; address: string }[],
  ): { lat: number; lng: number } => {
    let sumLat = 0;
    let sumLng = 0;

    points.forEach((point) => {
      sumLat += point.lat;
      sumLng += point.lng;
    });

    return {
      lat: sumLat / points.length,
      lng: sumLng / points.length,
    };
  };

  // Function to find subsets of points whose centroid is within a 5 km radius of a reference point
  export const findValidSubsets = (
    points: { lat: number; lng: number; address: string; id: string }[],
    refLat: number,
    refLng: number,
    radius: number = 5,
  ) => {
    const validSubsets: {
      id: string;
      points: { lat: number; lng: number; address: string }[];
      centroid: { lat: number; lng: number };
    }[] = [];

    // Loop through all possible subsets of points (for simplicity, we're considering all possible pairs, triplets, etc.)
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        for (let k = j + 1; k < points.length; k++) {
          const subset = [points[i], points[j], points[k]];
          const centroid = calculateCentroid(subset);
          const distanceFromRef = calculateDistance(refLat, refLng, centroid.lat, centroid.lng);

          if (distanceFromRef <= radius) {
            validSubsets.push({ points: subset, centroid, id: subset[0].id });
          }
        }
      }
    }

    return validSubsets;
  };
}
