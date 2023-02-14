<script lang="ts">
    import {isBrave, isFirefox} from '../utils'

    export let code: string = ''
    export let link: string = ''

    let iframeUrl: string = 'about:blank'

    function protonLinkClick() {
        if (link) {
            if (isFirefox() || isBrave()) {
                iframeUrl = link
            } else {
                window.location.href = link
            }
        }
    }
</script>

<div class="proton-link-actions">
    <div class="proton-link-background">
        <img class="proton-link-qr" src={code} alt="auth link" />
    </div>
    <div class="proton-link-separator">OR</div>
    <div class="proton-link-uri">
        <a class="proton-link-button" href={link} on:click|preventDefault={protonLinkClick}>
            Open Wallet
        </a>
    </div>
    <iframe class="proton-link-wskeepalive" src={iframeUrl} title="keepalive" />
</div>

<style lang="scss" global>
    .proton-link {
        &-actions {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
        }

        &-background {
            width: 250px;
            height: 250px;
            border-radius: 10px;
            box-shadow: 0 4px 8px -2px rgba(141, 141, 148, 0.28),
                0 0 2px 0 rgba(141, 141, 148, 0.16);
            background-color: #ffffff;
            position: relative;
            z-index: 10;
        }

        &-qr {
            width: 100%;
            height: 100%;
            padding: 10px;
        }

        &-separator {
            margin-top: 20px;
            width: 100%;
            font-size: 12px;
            display: flex;
            align-items: center;
            text-align: center;
            color: white;

            &::before,
            &::after {
                content: '';
                flex: 1;
                opacity: 0.2;
                border-bottom: 1px solid #d8d8d8;
            }

            &::before {
                margin-right: 0.5em;
            }

            &::after {
                margin-left: 0.5em;
            }
        }

        &-uri {
            width: 100%;
            padding: 20px 0px 0px 0px;

            a {
                width: 100%;
                background-color: rgba(255, 255, 255, 0.3);
                font-family: 'Circular Std Book', sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-align: center;
                color: #ffffff;
                text-decoration: none;
                flex-grow: 1;
                flex: 1;
                padding: 18px 0px 16px 0px;
                display: block;
                border-radius: 10px;

                &:hover {
                    background-color: rgba(255, 255, 255, 0.25);
                    transition: 0.2s ease;
                }
            }
        }

        &-wskeepalive {
            display: none;
        }
    }
</style>
