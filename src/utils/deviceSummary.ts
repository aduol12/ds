import { DeviceSummary, Kit, LatestSensorData } from '@/types/api';
import { toNumber } from '@/utils/number';

/**
 * Normalizes a raw Kit (from /assets/kit) plus its latest sensor reading
 * (from /data/live/:kitId) into the DeviceSummary shape expected by
 * DeviceCard and SensorReading components.
 */
export function normalizeDeviceSummary(
  kit: Kit,
  latestReading: LatestSensorData | null,
): DeviceSummary {
  return {
    battery: toNumber(latestReading?.battery),
    config_active_mode: '',
    config_id: '',
    config_kit_id: kit.kit_id,
    config_low_moisture_threshold_pct: '',
    config_manual_settings_json: {},
    config_notifications_enabled: {},
    config_reading_interval_active_min: 5,
    config_reading_interval_idle_min: 30,
    config_sensor_settings_json: {},
    config_smart_weather_settings_json: {},
    data_id: null,
    ec: toNumber(latestReading?.ec),
    firmware: toNumber(latestReading?.firmware),
    kit_crop_type: kit.crop_type,
    kit_farmer_id: '',
    kit_id: kit.kit_id,
    kit_is_active: kit.is_active,
    kit_is_irrigating: latestReading?.is_irrigating ?? false,
    kit_kit_id: kit.kit_id,
    kit_latitude: String(kit.latitude),
    kit_location_name: kit.location_name,
    kit_longitude: String(kit.longitude),
    moisture: toNumber(latestReading?.moisture),
    nitrogen: toNumber(latestReading?.nitrogen),
    ph: toNumber(latestReading?.ph),
    phosphorus: toNumber(latestReading?.phosphorus),
    potassium: toNumber(latestReading?.potassium),
    signal: toNumber(latestReading?.signal),
    temperature: toNumber(latestReading?.temperature),
    timestamp: latestReading?.timestamp ?? null,
  };
}
