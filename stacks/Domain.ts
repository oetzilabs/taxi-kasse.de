export const domain =
  {
    production: "taxi-kasse.de",
    dev: "dev.taxi-kasse.de",
  }[$app.stage] || $app.stage + ".dev.taxi-kasse.de";

export const zone = cloudflare.getZoneOutput({
  name: "taxi-kasse.de",
});

export const cf = sst.cloudflare.dns({
  zone: zone.zoneId,
});
