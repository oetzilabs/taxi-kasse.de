export module Configurator {
  // https://www.estv.admin.ch/estv/en/home/value-added-tax/vat-rates-switzerland.html
  export const BASE_VAT_RATE = 0.081 as const;
  export const REDUCED_VAT_RATE = 0.026 as const;
  export const SPECIAL_VAT_RATE = 0.038 as const;
}
