import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WeatherSnapshot {
  provider: string;
  location: { lat: number; lon: number; name?: string };
  current: {
    temp_c: number;
    humidity_pct: number;
    precip_mm: number;
    wind_kph: number;
    condition: string;
  };
  forecast: Array<{
    date: string;
    temp_min_c: number;
    temp_max_c: number;
    precip_mm: number;
    condition: string;
  }>;
  fetched_at: string;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private readonly config: ConfigService) {}

  async getWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
    const apiKey = this.config.get<string>('WEATHERAPI_KEY');
    if (apiKey) {
      try {
        return await this.fetchWeatherApi(lat, lon, apiKey);
      } catch (err) {
        this.logger.warn(
          `WeatherAPI failed, using mock: ${(err as Error)?.message || err}`,
        );
      }
    }
    return this.mockWeather(lat, lon);
  }

  private async fetchWeatherApi(
    lat: number,
    lon: number,
    apiKey: string,
  ): Promise<WeatherSnapshot> {
    const q = `${lat},${lon}`;
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(q)}&days=3&aqi=no&alerts=no`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`WeatherAPI HTTP ${res.status}`);
    }
    const body = (await res.json()) as any;
    return {
      provider: 'weatherapi',
      location: {
        lat,
        lon,
        name: body?.location?.name,
      },
      current: {
        temp_c: body?.current?.temp_c ?? 0,
        humidity_pct: body?.current?.humidity ?? 0,
        precip_mm: body?.current?.precip_mm ?? 0,
        wind_kph: body?.current?.wind_kph ?? 0,
        condition: body?.current?.condition?.text || 'Unknown',
      },
      forecast: (body?.forecast?.forecastday || []).map((d: any) => ({
        date: d.date,
        temp_min_c: d?.day?.mintemp_c ?? 0,
        temp_max_c: d?.day?.maxtemp_c ?? 0,
        precip_mm: d?.day?.totalprecip_mm ?? 0,
        condition: d?.day?.condition?.text || 'Unknown',
      })),
      fetched_at: new Date().toISOString(),
    };
  }

  private mockWeather(lat: number, lon: number): WeatherSnapshot {
    const today = new Date();
    const forecast = [0, 1, 2].map((offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return {
        date: d.toISOString().slice(0, 10),
        temp_min_c: 22 + offset,
        temp_max_c: 31 + offset,
        precip_mm: offset === 1 ? 4.2 : 0.1,
        condition: offset === 1 ? 'Light rain' : 'Partly cloudy',
      };
    });
    return {
      provider: 'mock',
      location: { lat, lon, name: 'Mock location' },
      current: {
        temp_c: 28.5,
        humidity_pct: 62,
        precip_mm: 0,
        wind_kph: 9.4,
        condition: 'Partly cloudy',
      },
      forecast,
      fetched_at: new Date().toISOString(),
    };
  }
}
