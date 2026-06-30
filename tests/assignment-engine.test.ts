import { describe, expect, it } from "vitest";
import { rankAgentsForOrder } from "@/lib/assignment/assignment-engine";

describe("rankAgentsForOrder", () => {
  it("prioritizes available agents in the drop zone, then distance, then workload", () => {
    const ranked = rankAgentsForOrder({
      pickupLatitude: 28.6139,
      pickupLongitude: 77.209,
      dropZoneId: "central-delhi",
      agents: [
        {
          id: "agent-far-zone-match",
          availability: "AVAILABLE",
          currentLatitude: 28.7,
          currentLongitude: 77.1,
          zoneIds: ["central-delhi"],
          activeOrderCount: 1,
        },
        {
          id: "agent-near-zone-match",
          availability: "AVAILABLE",
          currentLatitude: 28.614,
          currentLongitude: 77.21,
          zoneIds: ["central-delhi"],
          activeOrderCount: 4,
        },
        {
          id: "agent-near-wrong-zone",
          availability: "AVAILABLE",
          currentLatitude: 28.614,
          currentLongitude: 77.209,
          zoneIds: ["south-delhi"],
          activeOrderCount: 0,
        },
        {
          id: "agent-unavailable",
          availability: "OFFLINE",
          currentLatitude: 28.61,
          currentLongitude: 77.2,
          zoneIds: ["central-delhi"],
          activeOrderCount: 0,
        },
      ],
    });

    expect(ranked.map((agent) => agent.id)).toEqual([
      "agent-near-zone-match",
      "agent-far-zone-match",
      "agent-near-wrong-zone",
    ]);
    expect(ranked[0].score.zoneMatch).toBe(true);
  });

  it("uses workload as a tie-breaker when zone and distance are effectively equal", () => {
    const ranked = rankAgentsForOrder({
      pickupLatitude: 19.076,
      pickupLongitude: 72.8777,
      dropZoneId: "mumbai-west",
      agents: [
        {
          id: "busy",
          availability: "AVAILABLE",
          currentLatitude: 19.076,
          currentLongitude: 72.8777,
          zoneIds: ["mumbai-west"],
          activeOrderCount: 6,
        },
        {
          id: "lighter-load",
          availability: "AVAILABLE",
          currentLatitude: 19.076,
          currentLongitude: 72.8777,
          zoneIds: ["mumbai-west"],
          activeOrderCount: 2,
        },
      ],
    });

    expect(ranked[0].id).toBe("lighter-load");
  });
});
