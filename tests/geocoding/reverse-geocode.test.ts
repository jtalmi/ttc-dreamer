import { describe, it, expect, vi, beforeEach } from "vitest";
import { reverseGeocode, clearGeocodeCache } from "@/lib/geocoding/reverse-geocode";

function mockFetch(response: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
  });
}

function mockFetchError(message: string) {
  return vi.fn().mockRejectedValue(new Error(message));
}

beforeEach(() => {
  clearGeocodeCache();
  vi.restoreAllMocks();
});

describe("reverseGeocode", () => {
  it("returns abbreviated road name for successful geocode with only road", async () => {
    global.fetch = mockFetch({
      address: {
        road: "King Street West",
      },
    });

    const result = await reverseGeocode([-79.3958, 43.6445]);
    expect(result).toBe("King St W");
  });

  it("returns intersection format when cross-street available", async () => {
    global.fetch = mockFetch({
      address: {
        road: "King Street West",
        pedestrian: "Spadina Avenue",
      },
    });

    const result = await reverseGeocode([-79.3958, 43.6445]);
    expect(result).toBe("King St W & Spadina Ave");
  });

  it("falls back to suburb when no road is present", async () => {
    global.fetch = mockFetch({
      address: {
        suburb: "Rosedale-Moore Park",
      },
    });

    const result = await reverseGeocode([-79.3832, 43.6810]);
    expect(result).toBe("Rosedale-Moore Park");
  });

  it("falls back to neighbourhood when no road or suburb", async () => {
    global.fetch = mockFetch({
      address: {
        neighbourhood: "Wychwood",
      },
    });

    const result = await reverseGeocode([-79.4367, 43.6776]);
    expect(result).toBe("Wychwood");
  });

  it("returns null on network error", async () => {
    global.fetch = mockFetchError("Network failure");

    const result = await reverseGeocode([-79.3832, 43.6532]);
    expect(result).toBeNull();
  });

  it("returns null on non-200 status", async () => {
    global.fetch = mockFetch({}, 429);

    const result = await reverseGeocode([-79.3832, 43.6532]);
    expect(result).toBeNull();
  });

  it("returns cached result without second fetch for nearby coordinates", async () => {
    const fetchMock = mockFetch({
      address: { road: "Queen Street West" },
    });
    global.fetch = fetchMock;

    // These two coordinates round to the same 4-decimal key:
    // -79.38321 -> -79.3832, 43.65324 -> 43.6532
    // -79.38324 -> -79.3832, 43.65321 -> 43.6532
    const result1 = await reverseGeocode([-79.38321, 43.65324]);
    const result2 = await reverseGeocode([-79.38324, 43.65321]);

    expect(result1).toBe("Queen St W");
    expect(result2).toBe("Queen St W");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("abbreviates King Street West to King St W", async () => {
    global.fetch = mockFetch({
      address: { road: "King Street West" },
    });

    const result = await reverseGeocode([-79.3958, 43.6445]);
    expect(result).toBe("King St W");
  });

  it("does not abbreviate non-suffix words like Western", async () => {
    global.fetch = mockFetch({
      address: { road: "Western Avenue" },
    });

    const result = await reverseGeocode([-79.3958, 43.6445]);
    expect(result).toBe("Western Ave");
  });

  it("returns null when address has no usable fields", async () => {
    global.fetch = mockFetch({
      address: {},
    });

    const result = await reverseGeocode([-79.3832, 43.6532]);
    expect(result).toBeNull();
  });
});
