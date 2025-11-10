
export interface DialogProps {
    show?: boolean;
    showBackButton?: boolean;
    walletType?: string;
    title?: HTMLElement | string;
    subtitle?: HTMLElement | string | null;
    showFootnote?: boolean;
    countDown?: string | null;
    qrData?: {code: string; link: string} | null;
    action?: {text: string; callback: () => void} | null;
    back?: () => void;
    close?: () => void;
}

export const DIALOG_STATE = $state<DialogProps>({
    show: false,
    showBackButton: false,
    walletType: 'proton',
    title: '',
    subtitle: null,
    showFootnote: false,
    countDown: null,
    qrData: null,
    action: null,
    close: () => {}, 
    back: () => {}
})