// GeoJSON feature property types for TTC and GO static baseline data.
// Field names reflect the actual City of Toronto ArcGIS REST API output.

import type { Feature, FeatureCollection, LineString, MultiLineString, Point } from "geojson";

/** Properties on a TTC rapid transit route feature (from ArcGIS Layer 11). */
export type TtcRouteProperties = {
  OBJECTID: number;
  ROUTE_ID: number;
  AGENCY_ID: number;
  ROUTE_SHORT_NAME: string;
  ROUTE_LONG_NAME: string;
  ROUTE_DESC: string | null;
  ROUTE_TYPE: string;
  ROUTE_URL: string | null;
  ROUTE_COLOR: string;
  ROUTE_TEXT_COLOR: string;
  Shape__Length: number;
};

/** A single TTC route line feature. */
export type TtcRouteFeature = Feature<LineString | MultiLineString, TtcRouteProperties>;

/** FeatureCollection of TTC route lines. */
export type TtcRouteCollection = FeatureCollection<LineString | MultiLineString, TtcRouteProperties>;

/** Properties on a TTC subway station point feature (from ArcGIS Layer 8, filtered to Subway Stations). */
export type TtcStationProperties = {
  ADDRESS_POINT_ID: number;
  ADDRESS_NUMBER: string;
  LINEAR_NAME_FULL: string;
  ADDRESS_FULL: string;
  POSTAL_CODE: string | null;
  MUNICIPALITY: string;
  CITY: string;
  PLACE_NAME: string | null;
  GENERAL_USE_CODE: number;
  CENTRELINE_ID: number;
  LO_NUM: number;
  LO_NUM_SUF: string | null;
  HI_NUM: number | null;
  HI_NUM_SUF: string | null;
  LINEAR_NAME_ID: number;
  X: number;
  Y: number;
  LONGITUDE: number;
  LATITUDE: number;
  MAINT_STAGE: string;
  OBJECTID: number;
  PT_ID: number;
  PT_TYPE: string;
  PT_NAME: string;
  PT_CONN_ROUTE: string | null;
  PT_PUB_PARK: string;
  PT_KISS_RIDE: string;
  PT_ESCALATOR: string | null;
  PT_ELEVATOR: string;
  PT_TRANSF_REQ: string | null;
  PT_PUB_WASH: string;
  PT_PHONE: string | null;
  PT_OTHER_TRAN: string | null;
  PT_WEBSITE: string | null;
  PT_EXTRA1: string | null;
  PT_EXTRA2: string | null;
};

/** A single TTC station point feature. */
export type TtcStationFeature = Feature<Point, TtcStationProperties>;

/** FeatureCollection of TTC station points. */
export type TtcStationCollection = FeatureCollection<Point, TtcStationProperties>;

/** Properties on a GO Train stop feature (from ArcGIS Layer 7). */
export type GoStationProperties = {
  OBJECTID: number;
  STATION: string;
  ADDRESS_POINT_ID: number;
  ADDRESS_ID: number;
  CENTRELINE_ID: number;
  MAINT_STAGE: string;
  ADDRESS_NUMBER: string;
  LINEAR_NAME_FULL: string;
  POSTAL_CODE: string | null;
  GENERAL_USE: string;
  CLASS_FAMILY_DESC: string;
  ADDRESS_ID_LINK: number | null;
  PLACE_NAME: string;
  X: number;
  Y: number;
  LATITUDE: number;
  LONGITUDE: number;
  WARD_NAME: string;
  MUNICIPALITY_NAME: string;
};

/** A single GO station point feature. */
export type GoStationFeature = Feature<Point, GoStationProperties>;

/** FeatureCollection of GO station points. */
export type GoStationCollection = FeatureCollection<Point, GoStationProperties>;

/** Properties on a hand-authored GO rail corridor line feature. */
export type GoRouteProperties = {
  CORRIDOR: string;
  CORRIDOR_ID: string;
};

/** A single GO rail corridor line feature. */
export type GoRouteFeature = Feature<LineString, GoRouteProperties>;

/** FeatureCollection of GO rail corridor lines. */
export type GoRouteCollection = FeatureCollection<LineString, GoRouteProperties>;
