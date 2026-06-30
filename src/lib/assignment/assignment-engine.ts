export type AgentAvailability = "AVAILABLE" | "BUSY" | "OFFLINE";

export type AssignmentAgentInput = {
  id: string;
  availability: AgentAvailability;
  currentLatitude: number;
  currentLongitude: number;
  zoneIds: readonly string[];
  activeOrderCount: number;
};

export type RankedAgent = AssignmentAgentInput & {
  score: {
    zoneMatch: boolean;
    distanceKm: number;
    activeOrderCount: number;
  };
};

export type RankAgentsInput = {
  pickupLatitude: number;
  pickupLongitude: number;
  dropZoneId: string;
  agents: readonly AssignmentAgentInput[];
};

const toRadians = (value: number) => (value * Math.PI) / 180;

function distanceKm(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number,
) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);
  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(toRadians(fromLatitude)) *
      Math.cos(toRadians(toLatitude)) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function rankAgentsForOrder(input: RankAgentsInput): RankedAgent[] {
  return input.agents
    .filter((agent) => agent.availability === "AVAILABLE")
    .map((agent) => ({
      ...agent,
      score: {
        zoneMatch: agent.zoneIds.includes(input.dropZoneId),
        distanceKm: distanceKm(
          input.pickupLatitude,
          input.pickupLongitude,
          agent.currentLatitude,
          agent.currentLongitude,
        ),
        activeOrderCount: agent.activeOrderCount,
      },
    }))
    .sort((left, right) => {
      if (left.score.zoneMatch !== right.score.zoneMatch) {
        return left.score.zoneMatch ? -1 : 1;
      }

      const distanceDifference =
        left.score.distanceKm - right.score.distanceKm;
      if (Math.abs(distanceDifference) > 0.05) {
        return distanceDifference;
      }

      return left.score.activeOrderCount - right.score.activeOrderCount;
    });
}
