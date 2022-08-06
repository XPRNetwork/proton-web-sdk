import type { CustomStyleOptions } from "./types";

export const CustomStyleOptionsToVarsMap: Map<keyof CustomStyleOptions, string> = new Map([
  ['modalBackgroundColor', 'proton-wallet-modal-bgcolor'],
  ['logoBackgroundColor', 'proton-wallet-color-bglogo'],
  ['optionBackgroundColor', 'proton-wallet-option-bg'],
  ['optionFontColor', 'proton-wallet-option-font'],
  ['primaryFontColor', 'proton-wallet-color-font-primary'],
  ['secondaryFontColor', 'proton-wallet-color-font-secondary'],
  ['linkColor', 'proton-wallet-color-link'],
])

