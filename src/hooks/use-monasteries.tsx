import { useQuery } from "@tanstack/react-query";

export interface Monastery {
  id: string;
  name: string;
  location: string;
  established: string;
  description: string;
  wikipediaUrl: string;
  tourUrl?: string;
  coordinates: { lat: number; lng: number };
  images: string[];
  significance: string;
  architecture: string;
  festivals: string[];
  travelInfo: {
    byCar: string;
    byBus: string;
    nearestAirport: string;
    distanceFromGangtok: string;
    bestTimeToVisit: string;
    entryFee: string;
    photography: string;
    visitingHours: string;
    altitude: string;
  };
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  facilities: string[];
  nearbyAttractions: string[];
}

async function fetchMonasteries(): Promise<Monastery[]> {
  const res = await fetch(`/api/monasteries`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Failed to load monasteries');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function useMonasteries() {
  return useQuery({ queryKey: ['monasteries'], queryFn: fetchMonasteries });
}



