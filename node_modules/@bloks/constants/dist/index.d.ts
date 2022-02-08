export * from './contract';
export * from './dapps';
export * from './exchanges';
export * from './providers';
export * from './historyTypeFeatures';
export * from './chainInfo';
export * from './defaults';
export * from './types';
import { IConstants } from './types';
export declare const chainToNetworkConstantsMap: {
    [name: string]: IConstants;
};
export declare class Constants {
    [key: string]: any;
    constructor();
    initialize(chain?: string): void;
    setNetwork(chain: string): void;
    setCommon(chain: string): void;
    setContract(chain: string, systemDomain?: string): void;
    setConstants(newConstants: object): void;
}
export declare const constants: Constants;
