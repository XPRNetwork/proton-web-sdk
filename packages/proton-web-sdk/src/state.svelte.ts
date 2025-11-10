import type { WalletItem } from './types';

export interface DialogProps {
    title?: string;
    subtitle?: string;
    show?: boolean;
    appLogo?: string | null;
    hasRoundedLogo?: boolean;
    wallets?: WalletItem[];
    close: () => void;
    select_wallet: (walletName: string) => void;
}

export const DIALOG_STATE = $state<DialogProps>({
    title: '',
    subtitle: '',
    show: false,
    appLogo: '',
    hasRoundedLogo: false,
    wallets: [],
    close: () => {},
    select_wallet: (_) => {},
})