
export type Lane = "lane1" | "lane2";

export interface EmergencyStatus {
  lane1: boolean;
  lane2: boolean;
}

export interface VehicleData {
  count: number;
  boxes: Array<[number, number, number, number]>; // [x1, y1, x2, y2]
}

export interface ModelResult {
  vehicleData: VehicleData;
  hasEmergency: boolean;
}

export interface ModelStatus {
  yolo: "idle" | "loading" | "running" | "error";
  audio: "idle" | "loading" | "running" | "error";
  error?: string;
}
