import { cache } from "@solidjs/router";
import { ensureAuthenticated } from "../auth/context";

type WeatherType =
  | "rain"
  | "snow"
  | "clear"
  | "clouds"
  | "fog"
  | "haze"
  | "thunderstorm"
  | "tornado"
  | "windy"
  | "unknown";

type Weather = {
  current: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    type: WeatherType;
  };
};

export const getWeather = cache(async () => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();

  return undefined;

  const city = "Basel";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric`;
  const response = await fetch(url).catch((e) => {
    console.error(e);
    return null;
  });

  if (!response) {
    return undefined;
  }
  if (response.status !== 200) {
    return undefined;
  }

  const json = await response.json();
  console.log(json);

  // get weather information based on the current ip/gps location
  return {
    current: {
      temperature: 20,
      humidity: 50,
      wind_speed: 10,
      wind_direction: 20,
      type: "rain",
    },
  } satisfies Weather;
}, "weather");
