import axios from 'axios';

const WEATHER_API_KEY = '36c609489872486cb0383134250711';
const BASE_URL = 'https://api.weatherapi.com/v1';

export const getWeatherData = async (city: string) => {
  const response = await axios.get(`${BASE_URL}/forecast.json`, {
    params: {
      key: WEATHER_API_KEY,
      q: city,
      days: 4,
    },
  });
  return response.data;
};
