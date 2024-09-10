export module Configurator {
  // https://www.estv.admin.ch/estv/en/home/value-added-tax/vat-rates-switzerland.html
  export const BASE_VAT_RATE = 0.081 as const;
  export const REDUCED_VAT_RATE = 0.026 as const;
  export const SPECIAL_VAT_RATE = 0.038 as const;

  export const calculateEarning = (data: {
    base_charge: number;
    time_offering: number;
    distanceCharge: number;
    special_discount: number;
  }) => {
    return data.base_charge + data.time_offering + data.distanceCharge - data.special_discount;
  };
}
