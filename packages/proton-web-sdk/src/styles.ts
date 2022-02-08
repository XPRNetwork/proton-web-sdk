import { CustomStyleOptions } from ".";

export default (customStyleOptions: CustomStyleOptions | undefined): string => {
    const defaultOptions = {
        modalBackgroundColor: '#ffffff',
        logoBackgroundColor: 'transparent',
        isLogoRound: false,
        optionBackgroundColor: 'transparent',
        optionFontColor: '#000531',
        primaryFontColor: 'black',
        secondaryFontColor: '#a1a5b0',
        linkColor: '#00AAEF',
    };

    const {
        modalBackgroundColor,
        logoBackgroundColor,
        isLogoRound,
        optionBackgroundColor,
        optionFontColor,
        primaryFontColor,
        secondaryFontColor,
        linkColor,
    } = Object.assign(defaultOptions, customStyleOptions);

    return `
    .wallet-selector * {
        box-sizing: border-box;
        line-height: 1;
    }

    .wallet-selector {
        font-family: 'Circular Std Book', -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
            Arial, sans-serif;
        font-size: 13px;
        background: rgba(0, 0, 0, 0.65);
        position: fixed;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        z-index: 2147483647;
        display: none;
        align-items: center;
        justify-content: center;
    }

    .wallet-selector-active {
        display: flex;
        flex-direction: column;
    }

    .wallet-selector-inner {
        background: ${modalBackgroundColor};
        color: white;
        margin: 20px 20px 13px 20px;
        padding-top: 50px;
        border-radius: 10px;
        box-shadow: 0px -10px 50px rgba(0, 0, 0, .5) !important;
        width: 360px;
        transition-property: all;
        transition-duration: .5s;
        transition-timing-function: ease-in-out;
        position: relative;
    }

    .wallet-selector-close {
        display: block;
        position: absolute;
        top: 16px;
        right: 16px;
        width: 28px;
        height: 28px;
        background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.66 10.987L6 7.327l-3.66 3.66A1.035 1.035 0 11.876 9.523l3.66-3.66-3.66-3.66A1.035 1.035 0 012.34.737L6 4.398 9.66.739a1.035 1.035 0 111.464 1.464l-3.66 3.66 3.66 3.661a1.035 1.035 0 11-1.464 1.464z' fill='rgba(161, 165, 176, 0.7)' fill-rule='nonzero'/%3E%3C/svg%3E");
        background-size: 14px;
        background-repeat: no-repeat;
        background-position: 50%;
        cursor: pointer;
        transition: background-image 0.2s ease;
    }

    .wallet-selector-close:hover {
        background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.66 10.987L6 7.327l-3.66 3.66A1.035 1.035 0 11.876 9.523l3.66-3.66-3.66-3.66A1.035 1.035 0 012.34.737L6 4.398 9.66.739a1.035 1.035 0 111.464 1.464l-3.66 3.66 3.66 3.661a1.035 1.035 0 11-1.464 1.464z' fill='rgba(161, 165, 176, 1)' fill-rule='nonzero'/%3E%3C/svg%3E");
        transition: background-image 0.2s ease;
    }

    .wallet-selector-connect {
        padding: 0px 20px;
        border-radius: 10px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        background: ${modalBackgroundColor};
    }

    .wallet-selector-connect-header {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .wallet-selector-logo {
        width: 100px;
        height: 100px;
        background: ${logoBackgroundColor};
        ${isLogoRound && `
        width: 120px;
        height: 120px;
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid rgba(161, 165, 176, 0.23);
        border-radius: 50%;
        `}
    }

    .wallet-selector-title {
        font-size: 16px;
        font-family: 'Circular Std Book', sans-serif;
        line-height: 24px;
        color: ${primaryFontColor};
        text-align: center;
    }

    .wallet-selector-subtitle {
        font-size: 16px;
        font-family: 'Circular Std Book', sans-serif;
        line-height: 24px;
        color: ${secondaryFontColor};
        text-align: center;
    }

    .wallet-selector-connect-body {
        margin-top: 55px;
    }

    .wallet-selector-wallet-list {
        margin: 0px;
        padding: 0px;
        list-style: none;
    }

    .wallet-selector-wallet-list li {
        background: ${optionBackgroundColor};
    }

    .wallet-selector-proton-wallet, .wallet-selector-webauth-wallet, .wallet-selector-anchor-wallet {
        display: flex;
        align-items: center;
        padding: 20px 20px 20px 16px;
        border: 1px solid rgba(161, 165, 176, 0.23);
    }

    .wallet-selector-webauth-wallet, .wallet-selector-anchor-wallet {
        margin-top: 8px;
    }

    .wallet-selector-proton-wallet:hover, .wallet-selector-webauth-wallet:hover, .wallet-selector-anchor-wallet:hover {
        cursor: pointer;
    }

    .wallet-selector-proton-logo {
        background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='mobile-android-alt' style='color: %23752EEB;' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512'%3E%3Cpath fill='currentColor' d='M272 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zm-64 452c0 6.6-5.4 12-12 12h-72c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h72c6.6 0 12 5.4 12 12v8zm64-80c0 6.6-5.4 12-12 12H60c-6.6 0-12-5.4-12-12V60c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v312z'%3E%3C/path%3E%3C/svg%3E");    }

    .wallet-selector-webauth-logo {
        background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='far' data-icon='browser' style='color: %23752EEB;' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='currentColor' d='M464 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM48 92c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v24c0 6.6-5.4 12-12 12H60c-6.6 0-12-5.4-12-12V92zm416 334c0 3.3-2.7 6-6 6H54c-3.3 0-6-2.7-6-6V168h416v258zm0-310c0 6.6-5.4 12-12 12H172c-6.6 0-12-5.4-12-12V92c0-6.6 5.4-12 12-12h280c6.6 0 12 5.4 12 12v24z'%3E%3C/path%3E%3C/svg%3E");    }

    .wallet-selector-anchor-logo {
        background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='desktop' style='color: %23752EEB;' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'%3E%3Cpath fill='currentColor' d='M528 0H48C21.5 0 0 21.5 0 48v320c0 26.5 21.5 48 48 48h192l-16 48h-72c-13.3 0-24 10.7-24 24s10.7 24 24 24h272c13.3 0 24-10.7 24-24s-10.7-24-24-24h-72l-16-48h192c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zm-16 352H64V64h448v288z'%3E%3C/path%3E%3C/svg%3E");
    }

    .wallet-selector-anchor-logo {
        width: 40px;
        height: 40px;
        background-size: 30px;
        background-repeat: no-repeat;
        background-position: 50%;
    }

    .wallet-selector-proton-logo {
        width: 40px;
        height: 40px;
        background-size: 20px;
        background-repeat: no-repeat;
        background-position: 50%;
    }

    .wallet-selector-webauth-logo {
        width: 40px;
        height: 40px;
        background-size: 30px;
        background-repeat: no-repeat;
        background-position: 50%;
    }

    .wallet-selector-wallet-name {
        font-family: 'Circular Std Book', sans-serif;
        font-size: 16px;
        line-height: 24px;
        color: ${optionFontColor};
        margin-left: 20px;
    }

    .wallet-selector-right-arrow {
        background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='chevron-right' class='svg-inline--fa fa-chevron-right fa-w-10' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512'%3E%3Cpath fill='rgba(161, 165, 176, 0.7)' d='M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z'%3E%3C/path%3E%3C/svg%3E");
        width: 10px;
        height: 20px;
        background-size: 10px;
        background-repeat: no-repeat;
        background-position: 50%;
        margin-left: auto;
    }

    .wallet-selector-proton-wallet:hover .wallet-selector-right-arrow {
        background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='chevron-right' class='svg-inline--fa fa-chevron-right fa-w-10' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512'%3E%3Cpath fill='rgba(161, 165, 176, 1)' d='M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z'%3E%3C/path%3E%3C/svg%3E");
    }

    .wallet-selector-webauth-wallet:hover .wallet-selector-right-arrow {
        background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='chevron-right' class='svg-inline--fa fa-chevron-right fa-w-10' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512'%3E%3Cpath fill='rgba(161, 165, 176, 1)' d='M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z'%3E%3C/path%3E%3C/svg%3E");
    }

    .wallet-selector-anchor-wallet:hover .wallet-selector-right-arrow {
        background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='chevron-right' class='svg-inline--fa fa-chevron-right fa-w-10' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512'%3E%3Cpath fill='rgba(161, 165, 176, 1)' d='M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z'%3E%3C/path%3E%3C/svg%3E");
    }

    .wallet-selector-tos-agreement {
        font-family: 'Circular Std Book', sans-serif;
        font-size: 12px;
        line-height: 16px;
        text-align: center;
        margin-top: 55px;
        margin-bottom: 30px;
        color: ${secondaryFontColor};
    }

    .wallet-selector-tos-link {
        color: ${linkColor};
        text-decoration: none;
    }

    .wallet-selector-footnote {
        font-family: 'Circular Std Book', sans-serif;
        font-size: 16px;
        text-align: center;
        width: 100%;
        bottom: -30px;
        left: 0;
        color: white !important;
    }
    
    .wallet-selector-footnote a {
        color: #ffffff !important;
    }
    `
}
