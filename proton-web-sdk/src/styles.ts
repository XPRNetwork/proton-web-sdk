/* I do not see any ttf files for fonts, so assuming they need to be added (marking as TODO for later) */
import { CustomStyleOptions } from './index';

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

    .wallet-selector-proton-wallet, .wallet-selector-anchor-wallet {
        display: flex;
        align-items: center;
        padding: 20px 20px 20px 16px;
        border: 1px solid rgba(161, 165, 176, 0.23);
    }

    .wallet-selector-anchor-wallet {
        margin-top: 8px;
    }

    .wallet-selector-proton-wallet:hover, .wallet-selector-anchor-wallet:hover {
        cursor: pointer;
    }

    .wallet-selector-proton-logo {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cdefs%3E%3ClinearGradient id='8h6tugcn1a' x1='4.068%25' x2='97.224%25' y1='97.082%25' y2='127.413%25'%3E%3Cstop offset='0%25' stop-color='%237543E3'/%3E%3Cstop offset='100%25' stop-color='%23582ACB'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg%3E%3Cg%3E%3Cg%3E%3Cg transform='translate(-365 -412) translate(332 136) translate(16 256) translate(17 20)'%3E%3Ccircle cx='20' cy='20' r='20' fill='url(%238h6tugcn1a)' fill-rule='nonzero'/%3E%3Cpath fill='%23FFF' d='M20.501 6c1.798 0 3.35 1.864 4.37 4.892-.412.115-.833.243-1.259.385-.849-2.505-2.013-3.979-3.11-3.979-1.238 0-2.558 1.87-3.417 4.977.335.108.675.223 1.02.35.78.287 1.584.624 2.404 1.007l.14-.066c.526-.241 1.048-.464 1.565-.668l.185-.072c1.548-.597 3.043-1.026 4.411-1.252 2.948-.49 5.02.017 5.834 1.426.815 1.41.22 3.455-1.679 5.758-.11.131-.22.265-.338.396-.282-.313-.583-.626-.904-.94 1.675-1.94 2.334-3.634 1.796-4.565-.51-.88-2.188-1.177-4.495-.795-.493.081-1.005.192-1.531.329.075.345.145.697.207 1.061.142.816.252 1.68.33 2.578.406.285.802.574 1.182.868 1.49 1.151 2.769 2.358 3.753 3.552 1.898 2.303 2.494 4.349 1.68 5.758-.612 1.059-1.934 1.608-3.804 1.608-.619 0-1.297-.06-2.03-.182-.19-.032-.383-.067-.578-.106.117-.402.225-.823.323-1.259.158.032.314.06.468.085 2.305.382 3.986.086 4.495-.795.618-1.07-.348-3.151-2.62-5.453-.226.207-.46.413-.701.617l-.108.089c-.643.538-1.333 1.065-2.062 1.578-.036.407-.076.81-.124 1.2-.71 5.704-2.797 9.618-5.403 9.618-1.794 0-3.343-1.858-4.364-4.879.41-.11.83-.24 1.26-.385.848 2.497 2.008 3.966 3.104 3.966 1.238 0 2.56-1.876 3.421-4.992-.337-.107-.678-.221-1.021-.348-.785-.286-1.586-.62-2.392-.992l-.052.024c-.455.211-.903.408-1.345.59-.069.027-.136.055-.202.079-2.545 1.024-4.868 1.554-6.716 1.554-1.84 0-3.206-.527-3.837-1.617-.903-1.561-.049-3.848 2.089-6.258l.908.957c-1.729 1.976-2.416 3.708-1.87 4.652.618 1.069 2.9 1.275 6.024.465-.073-.344-.143-.695-.205-1.058-.141-.815-.251-1.676-.33-2.573-.407-.284-.803-.572-1.178-.86C10.173 19.544 8 16.59 8 14.391c0-.508.117-.976.357-1.391.899-1.552 3.285-1.962 6.418-1.335-.118.408-.228.834-.327 1.276-2.576-.508-4.42-.236-4.964.708-.618 1.069.344 3.145 2.609 5.443.29-.263.592-.524.909-.783.61-.504 1.27-1.004 1.973-1.496.036-.408.076-.811.125-1.202C15.81 9.913 17.897 6 20.501 6zm4.114 18.122c-.313.198-.63.393-.953.584l-.328.191c-.385.22-.77.434-1.15.634l-.169.088c.395.167.788.323 1.176.467.35.13.696.25 1.039.361.076-.355.147-.722.21-1.101.067-.394.123-.805.175-1.224zm-8.232-.002c.055.44.118.867.188 1.28.062.36.13.708.204 1.046.21-.068.422-.14.638-.216.065-.022.132-.046.197-.07.443-.16.898-.336 1.363-.534l.013-.005c-.44-.23-.88-.472-1.317-.724l-.069-.04c-.418-.242-.821-.488-1.217-.737zm4.119-9.05c-.445.216-.89.442-1.336.684-.282.152-.565.31-.847.472-.74.427-1.437.865-2.094 1.308-.026.378-.05.761-.064 1.155-.017.428-.024.866-.024 1.311 0 .854.031 1.675.087 2.465.38.256.77.51 1.177.76.3.185.604.369.918.549.727.418 1.457.804 2.184 1.156l.14-.066c.482-.238.97-.493 1.467-.768.191-.104.382-.211.574-.322.74-.427 1.436-.864 2.093-1.307.027-.379.05-.763.065-1.156.016-.428.024-.866.024-1.311 0-.853-.032-1.675-.087-2.465-.379-.255-.768-.509-1.176-.76-.3-.185-.606-.367-.92-.549-.74-.426-1.468-.81-2.181-1.157zm0 3.261c.923 0 1.67.747 1.67 1.669s-.747 1.669-1.67 1.669c-.924 0-1.672-.747-1.672-1.669s.748-1.669 1.671-1.669zm5.635.174c.019.49.029.988.029 1.495 0 .122 0 .245-.002.367-.004.383-.015.76-.03 1.134.335-.253.656-.506.962-.76.04-.03.077-.06.114-.092.26-.217.508-.433.747-.65-.219-.196-.446-.394-.682-.592-.359-.303-.74-.603-1.138-.902zM14.869 18.5c-.301.227-.592.454-.87.681-.335.272-.653.545-.955.819.22.197.447.396.684.594.358.3.74.601 1.138.9-.02-.49-.03-.988-.03-1.495 0-.122 0-.245.004-.365.003-.383.014-.76.029-1.134zm9.359-4.948c-.173.057-.347.115-.523.176-.516.178-1.04.38-1.571.602l-.113.049c.435.229.873.47 1.313.723l.068.04c.416.24.82.487 1.217.738-.054-.44-.117-.868-.188-1.28-.062-.361-.13-.709-.203-1.048zm-7.454 0c-.076.355-.146.72-.21 1.1-.068.393-.125.804-.177 1.222.397-.25.804-.496 1.223-.739l.059-.033c.438-.253.879-.493 1.319-.723-.399-.168-.79-.324-1.174-.466-.355-.133-.7-.251-1.04-.36z'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
    }

    .wallet-selector-anchor-logo {
        background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgc3R5bGU9IiIgdHJhbnNmb3JtPSJtYXRyaXgoMC45LCAwLCAwLCAwLjksIDEyLjc5OTk5NSwgMTIuNzk5OTk1KSI+CiAgICA8Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyOCIgZmlsbD0iIzM2NTBBMiIgc3R5bGU9IiIvPgogICAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0gMTI4LjAxIDQ4IEMgMTMxLjY4OSA0OCAxMzUuMDQ0IDUwLjEwMiAxMzYuNjQ3IDUzLjQxMiBMIDE3NS4wNTcgMTMyLjYxMyBMIDE3NS45MjQgMTM0LjQgTCAxNTQuNTg3IDEzNC40IEwgMTQ4LjM3OCAxMjEuNiBMIDEwNy42NCAxMjEuNiBMIDEwMS40MzMgMTM0LjQgTCA4MC4wOTQgMTM0LjQgTCA4MC45NjMgMTMyLjYxMSBMIDExOS4zNzIgNTMuNDEyIEMgMTIwLjk3OCA1MC4xMDIgMTI0LjMzMSA0OCAxMjguMDEgNDggWiBNIDExNS40IDEwNS42MDEgTCAxNDAuNjE5IDEwNS42MDEgTCAxMjguMDEgNzkuNjAxIEwgMTE1LjQgMTA1LjYwMSBaIE0gMTU2Ljc5OCAxNjEuNiBMIDE3Ni4wMDggMTYxLjYgQyAxNzUuNDMgMTg3LjQ0MyAxNTQuMDM5IDIwOCAxMjguMDEgMjA4IEMgMTAxLjk4MyAyMDggODAuNTg5IDE4Ny40NDMgODAuMDEyIDE2MS42IEwgOTkuMjIgMTYxLjYgQyA5OS42NzEgMTczLjM2NyAxMDcuNDg5IDE4My40MDkgMTE4LjM5OSAxODcuMTk1IEwgMTE4LjM5OSAxNDguODAxIEMgMTE4LjM5OSAxNDMuNDk5IDEyMi42OTggMTM5LjIgMTI4IDEzOS4yIEMgMTMzLjMwMiAxMzkuMiAxMzcuNjAxIDE0My40OTkgMTM3LjYwMSAxNDguODAxIEwgMTM3LjYwMSAxODcuMjAxIEMgMTQ4LjUyMiAxODMuNDIxIDE1Ni4zNDkgMTczLjM3NiAxNTYuNzk4IDE2MS42IFoiIGZpbGw9IndoaXRlIiBzdHlsZT0iIi8+CiAgPC9nPgo8L3N2Zz4=");
    }

    .wallet-selector-proton-logo,
    .wallet-selector-anchor-logo {
        width: 40px;
        height: 40px;
        background-size: 40px;
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
