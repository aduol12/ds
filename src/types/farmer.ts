export type FarmerStatus = "active" | "inactive" | "pending";

export type FarmHealthLevel = "healthy" | "warning" | "critical";

export type IrrigationStatus = "idle" | "running" | "scheduled" | "offline";

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  farmCount: number;
  farmHealth: FarmHealthLevel;
  irrigationStatus: IrrigationStatus;
  activeAlerts: number;
  status: FarmerStatus;
  registeredAt: string;
}

export interface FarmerFilters {
  search?: string;
  status?: FarmerStatus | "all";
  health?: FarmHealthLevel | "all";
  page?: number;
  pageSize?: number;
}

export interface FarmerFarmSummary {
  totalFarms: number;
  totalAreaHa: number;
  mainCrops: string[];
  irrigationMethod: string;
}

export interface FarmerDetail extends Farmer {
  county?: string;
  subCounty?: string;
  ward?: string;
  farmSummary: FarmerFarmSummary;
  farmIds: string[];
}

export interface UpdateFarmerDto {
  name?: string;
  phone?: string;
  email?: string;
  location?: string;
  status?: FarmerStatus;
}
