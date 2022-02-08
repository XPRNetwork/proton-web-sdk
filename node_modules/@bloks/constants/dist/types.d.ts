export interface Token {
    key: string;
    symbol: string;
    account: string;
    chain: string;
    supply: Supply;
    metadata: Metadata;
    pairs: Pair[];
    price: Price;
    rank: number;
}
export interface Metadata {
    name: string;
    website: string;
    logo: string;
    created_at: Date;
    desc: string;
}
export interface Pair {
    id: string;
    pair_base: string;
    pair_quote: string;
    exchange: string;
    quote: Quote;
    percentage_daily_volume: number;
}
export interface Quote {
    price: number;
    volume_base_24h: number;
    volume_quote_24h: number;
    price_usd: number;
    volume_usd_24h: number;
}
export interface Price {
    eos: number;
    usd: number;
    volume_base_24h: number;
    volume_usd_24h: number;
    marketcap_usd: number;
    change_24hr: number;
}
export interface Supply {
    circulating: number;
    max: number;
    last_update: Date;
}
export interface Provider {
    chainId: string;
    port: number;
    protocol: string;
    host: string;
    httpEndpoint: string;
    blockchain: string;
}
export interface IConstants {
    CORE_PRECISION: number;
    MAX_VOTES?: number;
    CHAIN_START_DATE: Date | undefined;
    DEFAULT_ENDPOINTS: string[];
    ACTIONS_ENDPOINTS: string[];
    TRANSACTIONS_ENDPOINTS: string[];
    PROVIDER_ENDPOINTS: Provider[];
    HISTORY_TYPES: string[];
    API_URL: string;
    CORE_SYMBOL: string;
    CHAIN: string;
    DISPLAY_CHAIN: string;
    CHAIN_ID: string;
    DOMAIN_TITLE: string;
    KEY_PREFIX: string;
    LIGHT_API?: string;
    HYPERION_URL?: string;
    BLOKS_PROXY?: string;
    ALOHA_PROXY_URL?: string;
    ATOMICASSETS_API?: string;
    SIMPLEASSETS_API?: string;
    FIO_FEES_ACCOUNT?: string;
    SYSTEM_DOMAIN?: string;
    REX_ENABLED?: boolean;
    SUPPORTS_FREE_CPU?: boolean;
    VOTING_ENABLED?: boolean;
    NFTS_ENABLED?: boolean;
    SUPPORTS_RENTBW?: boolean;
    DISABLE_MEMO?: boolean;
}
export interface HistoryTypeFeature {
    name: string;
    actionFilter: boolean;
    tokenFilter: boolean;
    dateFilter: boolean;
    contractActionFilter: boolean;
    total: number;
}
export interface HistoryTypeFeatures {
    native: HistoryTypeFeature;
    dfuse: HistoryTypeFeature;
    hyperion: HistoryTypeFeature;
}
