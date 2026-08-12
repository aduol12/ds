import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WeatherService } from './weather.service';

@ApiTags('weather')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  @ApiQuery({ name: 'lat', required: true, example: 5.6037 })
  @ApiQuery({ name: 'lon', required: true, example: -0.187 })
  getCurrent(@Query('lat') lat: number, @Query('lon') lon: number) {
    return this.weatherService.getWeather(Number(lat), Number(lon));
  }

  @Get('forecast')
  @ApiQuery({ name: 'lat', required: true })
  @ApiQuery({ name: 'lon', required: true })
  getForecast(@Query('lat') lat: number, @Query('lon') lon: number) {
    return this.weatherService.getWeather(Number(lat), Number(lon));
  }
}
