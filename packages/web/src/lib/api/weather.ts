import { cache, redirect } from "@solidjs/router";
import { getContext } from "../auth/context";

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
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const city = "Berlin";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric`;
  const response = await fetch(url).catch((e) => {
    console.error(e)
    return null;
  });

  if (!response) {
    return null;
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
