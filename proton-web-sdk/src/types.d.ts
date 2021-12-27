type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

interface CustomStyleOptions {
  modalBackgroundColor?: string,
  logoBackgroundColor?: string,
  isLogoRound?: boolean,
  optionBackgroundColor?: string,
  optionFontColor?: string,
  primaryFontColor?: string,
  secondaryFontColor?: string,
  linkColor?: string,
}

interface SelectorOptions {
    appName?: string,
    appLogo?: string,
    walletType?: string,
    enabledWalletTypes?: string[],
    customStyleOptions?: CustomStyleOptions
}

type LocalLinkOptions = PartialBy<LinkOptions, 'transport'|'chains'|'scheme'> & {
  endpoints: string[],
  storage?: LinkStorage,
  storagePrefix?: string,
  restoreSession?: boolean,
  testUrl?: string
}

interface ConnectWalletArgs {
  linkOptions: LocalLinkOptions,
  transportOptions?: BrowserTransportOptions;
  selectorOptions?: SelectorOptions
}

interface ConnectWalletRet {
  session?: LinkSession;
  link?: ProtonWebLink | Link;
  loginResult?: LoginResult;
  error?: any
}
