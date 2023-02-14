<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    import {getFootnoteLink} from '../utils'
    import CountDown from './CountDown.svelte'
    import QrCode from './QRCode.svelte'

    const dispatch = createEventDispatcher()

    export let show: boolean = false
    export let showBackButton: boolean = false
    export let walletType: string = 'proton'
    export let title: string = ''
    export let subtitle: string | null = null
    export let showFootnote: boolean = false
    export let countDown: string | null = null
    export let qrData: {code: string; link: string} | null = null
    export let action: {text: string; callback: () => void} | null = null

    $: walletTypeClass = ` proton-link--${walletType}`
    $: footnoteLink = showFootnote ? getFootnoteLink(walletType) : ''

    function back() {
        dispatch('back')
        close()
    }

    function close() {
        show = false
        dispatch('close')
    }

    function doAction() {
        if (action && action.callback) {
            action.callback()
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
    class="proton-link{walletTypeClass}"
    class:is-active={show}
    on:click|self|stopPropagation={close}
>
    <div class="proton-link-inner">
        <div class="proton-link-nav">
            {#if showBackButton}
                <div class="proton-link-back" on:click={back} />
            {/if}
            <span class="proton-link-header">{title}</span>
            <div class="proton-link-close" on:click={close} />
        </div>
        <div class="proton-link-request">
            {#if subtitle}
                <span class="proton-link-subtitle">{subtitle}</span>
            {/if}

            {#if qrData}
                <QrCode {...qrData} />
            {/if}

            {#if countDown}
                <div class="proton-link-info">
                    <CountDown {countDown} />
                </div>
            {/if}

            {#if action}
                <hr class="proton-link-hr" />
                <button class="proton-link-button" on:click={doAction}>{action.text}</button>
            {/if}

            {#if footnoteLink}
                <div class="proton-link-footnote">
                    Don't have a wallet? <a href={footnoteLink} target="_blank" rel="noreferrer"
                        >Download it here</a
                    >
                </div>
            {/if}
        </div>
    </div>
</div>

<style lang="scss" global>
    /* Proton Link Modal */
    .proton-link {
        $module: &;

        font-family: 'Circular Std Book', -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI',
            Roboto, 'Helvetica Neue', Arial, sans-serif;
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

        * {
            box-sizing: border-box;
            line-height: 1;
        }

        &-button {
            color: white;
            cursor: pointer;
            text-align: center;
            background-color: transparent;
            background-image: none;
            outline: none;
        }

        &-subtitle {
            font-size: 16px;
            line-height: 24px;
            display: block;
            margin-top: 10px;
            text-align: center;
            word-break: break-word;
        }

        &--anchor {
            #{$module}-inner {
                background: #3650a2;
                color: white;
            }

            #{$module}-logo {
                background-image: url('data:image/png;base64,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');
            }

            #{$module}-countdown {
                color: #3650a2;
            }
        }

        &--proton {
            #{$module}-inner {
                background: #752eeb;
                color: white;
            }

            #{$module}-logo {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='49' viewBox='0 0 160 49'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFF'%3E%3Cg%3E%3Cpath fill-rule='nonzero' d='M58.895 32.064V27.53h3.547c1.361 0 2.547-.224 3.557-.673 1.01-.449 1.785-1.096 2.323-1.942.539-.845.808-1.836.808-2.974 0-1.152-.269-2.147-.808-2.985-.538-.838-1.313-1.481-2.323-1.93-1.01-.449-2.196-.673-3.557-.673h-6.464v15.711h2.917zm3.412-7.003h-3.412v-6.24h3.412c1.272 0 2.237.27 2.895.809.659.538.988 1.309.988 2.311 0 1.003-.33 1.774-.988 2.312-.658.539-1.623.808-2.895.808zm13.942 7.003v-4.579h3.633c.226-.001.4-.009.519-.022l3.21 4.601h3.142l-3.614-5.162c1.077-.42 1.904-1.055 2.48-1.908.576-.853.864-1.87.864-3.053 0-1.152-.269-2.147-.808-2.985-.538-.838-1.313-1.481-2.323-1.93-1.01-.449-2.195-.673-3.557-.673H73.33v15.711h2.918zm3.411-6.98H76.25v-6.262h3.411c1.272 0 2.237.269 2.896.808.658.538.987 1.309.987 2.311 0 1.003-.329 1.777-.987 2.324-.659.546-1.624.819-2.896.819zm18.7 7.205c1.601 0 3.045-.348 4.332-1.044 1.287-.696 2.297-1.657 3.03-2.884.733-1.227 1.1-2.611 1.1-4.153 0-1.54-.367-2.925-1.1-4.152-.733-1.227-1.743-2.188-3.03-2.884-1.287-.696-2.73-1.044-4.332-1.044-1.601 0-3.045.348-4.332 1.044-1.287.696-2.297 1.66-3.03 2.895-.733 1.235-1.1 2.615-1.1 4.141 0 1.527.367 2.907 1.1 4.141.733 1.235 1.743 2.2 3.03 2.896 1.287.696 2.73 1.044 4.332 1.044zm0-2.56c-1.047 0-1.99-.235-2.828-.706-.838-.471-1.496-1.13-1.975-1.975-.479-.846-.718-1.792-.718-2.84 0-1.047.239-1.993.718-2.839.479-.845 1.137-1.504 1.975-1.975.838-.471 1.78-.707 2.828-.707 1.047 0 1.99.236 2.828.707.838.471 1.496 1.13 1.975 1.975.479.846.718 1.792.718 2.84 0 1.047-.239 1.993-.718 2.839-.479.845-1.137 1.504-1.975 1.975-.838.471-1.78.707-2.828.707zm18.722 2.335V18.822h5.207v-2.47h-13.332v2.47h5.207v13.242h2.918zm15.805.225c1.6 0 3.045-.348 4.332-1.044 1.286-.696 2.296-1.657 3.03-2.884.733-1.227 1.1-2.611 1.1-4.153 0-1.54-.367-2.925-1.1-4.152-.734-1.227-1.744-2.188-3.03-2.884-1.287-.696-2.731-1.044-4.332-1.044s-3.045.348-4.332 1.044c-1.287.696-2.297 1.66-3.03 2.895-.733 1.235-1.1 2.615-1.1 4.141 0 1.527.367 2.907 1.1 4.141.733 1.235 1.743 2.2 3.03 2.896 1.287.696 2.73 1.044 4.332 1.044zm0-2.56c-1.048 0-1.99-.235-2.828-.706-.838-.471-1.497-1.13-1.976-1.975-.478-.846-.718-1.792-.718-2.84 0-1.047.24-1.993.718-2.839.48-.845 1.138-1.504 1.976-1.975.838-.471 1.78-.707 2.828-.707 1.047 0 1.99.236 2.828.707.838.471 1.496 1.13 1.975 1.975.479.846.718 1.792.718 2.84 0 1.047-.24 1.993-.718 2.839-.479.845-1.137 1.504-1.975 1.975-.838.471-1.78.707-2.828.707zm15.737 2.335V21.425l8.663 10.64h2.402V16.352h-2.895v10.639l-8.664-10.64h-2.402v15.712h2.896z' transform='translate(-432 -207) translate(432 207)'/%3E%3Cg%3E%3Cpath d='M21.582 0c3.104 0 5.782 3.222 7.545 8.459-.712.198-1.44.42-2.174.666-1.465-4.331-3.476-6.88-5.37-6.88-2.136 0-4.415 3.232-5.899 8.606.58.187 1.165.386 1.762.606 1.346.495 2.735 1.078 4.15 1.74.081-.038.162-.078.243-.115.907-.417 1.808-.801 2.7-1.154l.32-.125c2.671-1.033 5.252-1.773 7.616-2.165 5.088-.846 8.666.03 10.07 2.466 1.409 2.437.38 5.974-2.898 9.956-.189.228-.38.459-.583.686-.488-.542-1.007-1.083-1.561-1.625 2.891-3.354 4.03-6.285 3.1-7.895-.879-1.523-3.777-2.036-7.76-1.375-.85.142-1.735.333-2.643.57.13.596.25 1.205.357 1.835.246 1.41.436 2.903.57 4.458.7.492 1.384.991 2.04 1.5 2.572 1.99 4.78 4.078 6.48 6.143 3.277 3.982 4.307 7.519 2.899 9.956-1.055 1.83-3.338 2.78-6.567 2.78-1.067 0-2.238-.103-3.504-.315-.328-.054-.661-.115-.997-.182.201-.696.388-1.424.557-2.178.273.055.542.103.808.148 3.98.66 6.881.147 7.76-1.376 1.068-1.85-.6-5.449-4.522-9.428-.391.357-.794.713-1.21 1.066-.062.051-.126.106-.187.154-1.11.93-2.302 1.842-3.561 2.728-.06.704-.13 1.4-.213 2.075-1.225 9.863-4.829 16.632-9.328 16.632-3.097 0-5.771-3.213-7.535-8.436.709-.193 1.434-.417 2.175-.667 1.465 4.319 3.469 6.858 5.36 6.858 2.136 0 4.42-3.243 5.907-8.631-.583-.186-1.17-.383-1.764-.603-1.355-.494-2.738-1.07-4.13-1.716l-.09.042c-.785.366-1.558.706-2.321 1.02-.119.048-.234.096-.35.138-4.392 1.77-8.404 2.687-11.594 2.687-3.177 0-5.534-.911-6.624-2.796-1.559-2.7-.084-6.654 3.607-10.822l1.568 1.654c-2.985 3.419-4.172 6.413-3.23 8.045 1.067 1.849 5.006 2.206 10.402.805-.127-.595-.248-1.202-.355-1.83-.244-1.41-.433-2.898-.569-4.45-.703-.491-1.387-.988-2.035-1.486C3.752 23.42 0 18.312 0 14.51c0-.879.202-1.687.616-2.405C2.168 9.42 6.288 8.712 11.697 9.796c-.205.705-.394 1.442-.564 2.206-4.448-.879-7.632-.408-8.571 1.224-1.067 1.848.594 5.44 4.504 9.413.502-.455 1.022-.907 1.569-1.355 1.053-.871 2.194-1.736 3.407-2.586.061-.706.13-1.403.216-2.08C13.483 6.767 17.087 0 21.582 0zm7.103 31.336c-.54.342-1.087.68-1.645 1.01-.19.113-.379.222-.568.33-.664.382-1.327.75-1.985 1.097-.097.052-.194.1-.29.152.681.288 1.358.558 2.028.807.605.225 1.202.431 1.794.625.132-.615.254-1.248.364-1.904.115-.681.212-1.393.302-2.117zm-14.212-.003c.094.76.203 1.5.325 2.212.105.624.224 1.224.35 1.81.363-.118.73-.24 1.102-.373.112-.039.228-.08.34-.122.766-.276 1.552-.58 2.353-.923l.023-.01c-.759-.397-1.518-.814-2.273-1.25-.039-.023-.08-.045-.12-.071-.72-.418-1.418-.844-2.1-1.273zm7.11-15.65c-.767.373-1.537.765-2.306 1.183-.487.263-.975.535-1.462.817-1.277.738-2.48 1.495-3.615 2.261-.046.654-.086 1.316-.111 1.997-.029.741-.042 1.498-.042 2.267 0 1.476.054 2.897.151 4.263.655.443 1.329.882 2.033 1.313.516.321 1.042.638 1.584.95 1.254.724 2.515 1.39 3.77 2 .08-.04.16-.075.241-.115.834-.41 1.677-.853 2.533-1.328.33-.18.66-.365.99-.558 1.278-.736 2.481-1.493 3.615-2.26.047-.654.087-1.317.112-1.998.029-.74.041-1.497.041-2.267 0-1.475-.054-2.895-.15-4.262-.653-.44-1.326-.88-2.03-1.314-.516-.32-1.045-.634-1.587-.949-1.277-.737-2.535-1.4-3.767-2zm0 5.64c1.593 0 2.885 1.292 2.885 2.885 0 1.594-1.292 2.886-2.886 2.886-1.593 0-2.885-1.292-2.885-2.886 0-1.593 1.292-2.885 2.885-2.885zm9.729.3c.033.847.05 1.71.05 2.585 0 .212 0 .424-.003.635-.007.663-.027 1.315-.052 1.96.578-.436 1.132-.874 1.661-1.312.068-.055.132-.106.196-.16.449-.376.878-.75 1.29-1.123-.378-.34-.77-.683-1.178-1.026-.619-.522-1.278-1.042-1.964-1.56zm-19.454-.006c-.52.392-1.021.785-1.501 1.177-.579.47-1.127.943-1.649 1.416.379.341.771.684 1.18 1.028.62.52 1.279 1.039 1.966 1.557-.034-.847-.051-1.71-.051-2.587 0-.211 0-.423.006-.631.005-.662.024-1.314.049-1.96zm16.158-8.556c-.3.097-.6.198-.903.303-.891.308-1.795.658-2.712 1.042l-.195.084c.75.396 1.507.812 2.266 1.25.039.023.08.045.119.07.717.414 1.414.842 2.1 1.277-.093-.762-.202-1.502-.324-2.216-.107-.623-.226-1.224-.351-1.81zm-12.87 0c-.13.613-.251 1.246-.361 1.9-.117.682-.215 1.391-.305 2.115.684-.432 1.387-.859 2.11-1.278l.103-.058c.757-.437 1.517-.853 2.276-1.25-.688-.29-1.364-.56-2.026-.805-.613-.23-1.21-.435-1.796-.624z' transform='translate(-432 -207) translate(432 207)'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
            }

            #{$module}-countdown {
                color: #752eeb;
            }
        }

        &--webauth {
            #{$module}-inner {
                background: #752eeb;
                color: white;
            }

            #{$module}-logo {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='49' viewBox='0 0 160 49'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFF'%3E%3Cg%3E%3Cpath fill-rule='nonzero' d='M58.895 32.064V27.53h3.547c1.361 0 2.547-.224 3.557-.673 1.01-.449 1.785-1.096 2.323-1.942.539-.845.808-1.836.808-2.974 0-1.152-.269-2.147-.808-2.985-.538-.838-1.313-1.481-2.323-1.93-1.01-.449-2.196-.673-3.557-.673h-6.464v15.711h2.917zm3.412-7.003h-3.412v-6.24h3.412c1.272 0 2.237.27 2.895.809.659.538.988 1.309.988 2.311 0 1.003-.33 1.774-.988 2.312-.658.539-1.623.808-2.895.808zm13.942 7.003v-4.579h3.633c.226-.001.4-.009.519-.022l3.21 4.601h3.142l-3.614-5.162c1.077-.42 1.904-1.055 2.48-1.908.576-.853.864-1.87.864-3.053 0-1.152-.269-2.147-.808-2.985-.538-.838-1.313-1.481-2.323-1.93-1.01-.449-2.195-.673-3.557-.673H73.33v15.711h2.918zm3.411-6.98H76.25v-6.262h3.411c1.272 0 2.237.269 2.896.808.658.538.987 1.309.987 2.311 0 1.003-.329 1.777-.987 2.324-.659.546-1.624.819-2.896.819zm18.7 7.205c1.601 0 3.045-.348 4.332-1.044 1.287-.696 2.297-1.657 3.03-2.884.733-1.227 1.1-2.611 1.1-4.153 0-1.54-.367-2.925-1.1-4.152-.733-1.227-1.743-2.188-3.03-2.884-1.287-.696-2.73-1.044-4.332-1.044-1.601 0-3.045.348-4.332 1.044-1.287.696-2.297 1.66-3.03 2.895-.733 1.235-1.1 2.615-1.1 4.141 0 1.527.367 2.907 1.1 4.141.733 1.235 1.743 2.2 3.03 2.896 1.287.696 2.73 1.044 4.332 1.044zm0-2.56c-1.047 0-1.99-.235-2.828-.706-.838-.471-1.496-1.13-1.975-1.975-.479-.846-.718-1.792-.718-2.84 0-1.047.239-1.993.718-2.839.479-.845 1.137-1.504 1.975-1.975.838-.471 1.78-.707 2.828-.707 1.047 0 1.99.236 2.828.707.838.471 1.496 1.13 1.975 1.975.479.846.718 1.792.718 2.84 0 1.047-.239 1.993-.718 2.839-.479.845-1.137 1.504-1.975 1.975-.838.471-1.78.707-2.828.707zm18.722 2.335V18.822h5.207v-2.47h-13.332v2.47h5.207v13.242h2.918zm15.805.225c1.6 0 3.045-.348 4.332-1.044 1.286-.696 2.296-1.657 3.03-2.884.733-1.227 1.1-2.611 1.1-4.153 0-1.54-.367-2.925-1.1-4.152-.734-1.227-1.744-2.188-3.03-2.884-1.287-.696-2.731-1.044-4.332-1.044s-3.045.348-4.332 1.044c-1.287.696-2.297 1.66-3.03 2.895-.733 1.235-1.1 2.615-1.1 4.141 0 1.527.367 2.907 1.1 4.141.733 1.235 1.743 2.2 3.03 2.896 1.287.696 2.73 1.044 4.332 1.044zm0-2.56c-1.048 0-1.99-.235-2.828-.706-.838-.471-1.497-1.13-1.976-1.975-.478-.846-.718-1.792-.718-2.84 0-1.047.24-1.993.718-2.839.48-.845 1.138-1.504 1.976-1.975.838-.471 1.78-.707 2.828-.707 1.047 0 1.99.236 2.828.707.838.471 1.496 1.13 1.975 1.975.479.846.718 1.792.718 2.84 0 1.047-.24 1.993-.718 2.839-.479.845-1.137 1.504-1.975 1.975-.838.471-1.78.707-2.828.707zm15.737 2.335V21.425l8.663 10.64h2.402V16.352h-2.895v10.639l-8.664-10.64h-2.402v15.712h2.896z' transform='translate(-432 -207) translate(432 207)'/%3E%3Cg%3E%3Cpath d='M21.582 0c3.104 0 5.782 3.222 7.545 8.459-.712.198-1.44.42-2.174.666-1.465-4.331-3.476-6.88-5.37-6.88-2.136 0-4.415 3.232-5.899 8.606.58.187 1.165.386 1.762.606 1.346.495 2.735 1.078 4.15 1.74.081-.038.162-.078.243-.115.907-.417 1.808-.801 2.7-1.154l.32-.125c2.671-1.033 5.252-1.773 7.616-2.165 5.088-.846 8.666.03 10.07 2.466 1.409 2.437.38 5.974-2.898 9.956-.189.228-.38.459-.583.686-.488-.542-1.007-1.083-1.561-1.625 2.891-3.354 4.03-6.285 3.1-7.895-.879-1.523-3.777-2.036-7.76-1.375-.85.142-1.735.333-2.643.57.13.596.25 1.205.357 1.835.246 1.41.436 2.903.57 4.458.7.492 1.384.991 2.04 1.5 2.572 1.99 4.78 4.078 6.48 6.143 3.277 3.982 4.307 7.519 2.899 9.956-1.055 1.83-3.338 2.78-6.567 2.78-1.067 0-2.238-.103-3.504-.315-.328-.054-.661-.115-.997-.182.201-.696.388-1.424.557-2.178.273.055.542.103.808.148 3.98.66 6.881.147 7.76-1.376 1.068-1.85-.6-5.449-4.522-9.428-.391.357-.794.713-1.21 1.066-.062.051-.126.106-.187.154-1.11.93-2.302 1.842-3.561 2.728-.06.704-.13 1.4-.213 2.075-1.225 9.863-4.829 16.632-9.328 16.632-3.097 0-5.771-3.213-7.535-8.436.709-.193 1.434-.417 2.175-.667 1.465 4.319 3.469 6.858 5.36 6.858 2.136 0 4.42-3.243 5.907-8.631-.583-.186-1.17-.383-1.764-.603-1.355-.494-2.738-1.07-4.13-1.716l-.09.042c-.785.366-1.558.706-2.321 1.02-.119.048-.234.096-.35.138-4.392 1.77-8.404 2.687-11.594 2.687-3.177 0-5.534-.911-6.624-2.796-1.559-2.7-.084-6.654 3.607-10.822l1.568 1.654c-2.985 3.419-4.172 6.413-3.23 8.045 1.067 1.849 5.006 2.206 10.402.805-.127-.595-.248-1.202-.355-1.83-.244-1.41-.433-2.898-.569-4.45-.703-.491-1.387-.988-2.035-1.486C3.752 23.42 0 18.312 0 14.51c0-.879.202-1.687.616-2.405C2.168 9.42 6.288 8.712 11.697 9.796c-.205.705-.394 1.442-.564 2.206-4.448-.879-7.632-.408-8.571 1.224-1.067 1.848.594 5.44 4.504 9.413.502-.455 1.022-.907 1.569-1.355 1.053-.871 2.194-1.736 3.407-2.586.061-.706.13-1.403.216-2.08C13.483 6.767 17.087 0 21.582 0zm7.103 31.336c-.54.342-1.087.68-1.645 1.01-.19.113-.379.222-.568.33-.664.382-1.327.75-1.985 1.097-.097.052-.194.1-.29.152.681.288 1.358.558 2.028.807.605.225 1.202.431 1.794.625.132-.615.254-1.248.364-1.904.115-.681.212-1.393.302-2.117zm-14.212-.003c.094.76.203 1.5.325 2.212.105.624.224 1.224.35 1.81.363-.118.73-.24 1.102-.373.112-.039.228-.08.34-.122.766-.276 1.552-.58 2.353-.923l.023-.01c-.759-.397-1.518-.814-2.273-1.25-.039-.023-.08-.045-.12-.071-.72-.418-1.418-.844-2.1-1.273zm7.11-15.65c-.767.373-1.537.765-2.306 1.183-.487.263-.975.535-1.462.817-1.277.738-2.48 1.495-3.615 2.261-.046.654-.086 1.316-.111 1.997-.029.741-.042 1.498-.042 2.267 0 1.476.054 2.897.151 4.263.655.443 1.329.882 2.033 1.313.516.321 1.042.638 1.584.95 1.254.724 2.515 1.39 3.77 2 .08-.04.16-.075.241-.115.834-.41 1.677-.853 2.533-1.328.33-.18.66-.365.99-.558 1.278-.736 2.481-1.493 3.615-2.26.047-.654.087-1.317.112-1.998.029-.74.041-1.497.041-2.267 0-1.475-.054-2.895-.15-4.262-.653-.44-1.326-.88-2.03-1.314-.516-.32-1.045-.634-1.587-.949-1.277-.737-2.535-1.4-3.767-2zm0 5.64c1.593 0 2.885 1.292 2.885 2.885 0 1.594-1.292 2.886-2.886 2.886-1.593 0-2.885-1.292-2.885-2.886 0-1.593 1.292-2.885 2.885-2.885zm9.729.3c.033.847.05 1.71.05 2.585 0 .212 0 .424-.003.635-.007.663-.027 1.315-.052 1.96.578-.436 1.132-.874 1.661-1.312.068-.055.132-.106.196-.16.449-.376.878-.75 1.29-1.123-.378-.34-.77-.683-1.178-1.026-.619-.522-1.278-1.042-1.964-1.56zm-19.454-.006c-.52.392-1.021.785-1.501 1.177-.579.47-1.127.943-1.649 1.416.379.341.771.684 1.18 1.028.62.52 1.279 1.039 1.966 1.557-.034-.847-.051-1.71-.051-2.587 0-.211 0-.423.006-.631.005-.662.024-1.314.049-1.96zm16.158-8.556c-.3.097-.6.198-.903.303-.891.308-1.795.658-2.712 1.042l-.195.084c.75.396 1.507.812 2.266 1.25.039.023.08.045.119.07.717.414 1.414.842 2.1 1.277-.093-.762-.202-1.502-.324-2.216-.107-.623-.226-1.224-.351-1.81zm-12.87 0c-.13.613-.251 1.246-.361 1.9-.117.682-.215 1.391-.305 2.115.684-.432 1.387-.859 2.11-1.278l.103-.058c.757-.437 1.517-.853 2.276-1.25-.688-.29-1.364-.56-2.026-.805-.613-.23-1.21-.435-1.796-.624z' transform='translate(-432 -207) translate(432 207)'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
            }
            #{$module}-countdown {
                color: #752eeb;
            }
        }

        &.is-active {
            display: flex;
        }

        &-inner {
            background-color: white;
            color: black;
            margin: 20px;
            position: relative;
            border-radius: 20px;
            position: relative;
            box-shadow: 0px 4px 100px rgba(0, 0, 0, 0.5);
            width: 360px;
            transition-property: all;
            transition-duration: 0.5s;
            transition-timing-function: ease-in-out;
        }

        &-nav {
            height: 55px;
            display: flex;
            position: relative;
            border-radius: 20px 20px 0px 0px;
            justify-content: center;
            align-items: center;
            padding: 0px 16px;
            background-color: rgba(0, 0, 0, 0.2);
        }

        &-back {
            width: 16px;
            height: 16px;
            position: absolute;
            left: 16px;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg%3E%3Cg%3E%3Cg%3E%3Cpath d='M0 0L24 0 24 24 0 24z' transform='translate(-348 -152) translate(332 136) translate(16 16)'/%3E%3Cpath fill='rgba(255,255,255, 0.8)' fill-rule='nonzero' d='M16.41 5.791L14.619 4 7 11.619 14.619 19.239 16.41 17.448 10.594 11.619z' transform='translate(-348 -152) translate(332 136) translate(16 16)'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
            background-size: 20px;
            background-repeat: no-repeat;
            background-position: 50%;
            border-radius: 100%;
            cursor: pointer;

            &:hover {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg%3E%3Cg%3E%3Cg%3E%3Cpath d='M0 0L24 0 24 24 0 24z' transform='translate(-348 -152) translate(332 136) translate(16 16)'/%3E%3Cpath fill='rgba(255,255,255, 1)' fill-rule='nonzero' d='M16.41 5.791L14.619 4 7 11.619 14.619 19.239 16.41 17.448 10.594 11.619z' transform='translate(-348 -152) translate(332 136) translate(16 16)'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
            }
        }

        &-header {
            font-family: 'Circular Std Book', sans-serif;
            font-size: 16px;
            line-height: 24px;
        }

        &-close {
            width: 16px;
            height: 16px;
            position: absolute;
            right: 16px;
            background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.66 10.987L6 7.327l-3.66 3.66A1.035 1.035 0 11.876 9.523l3.66-3.66-3.66-3.66A1.035 1.035 0 012.34.737L6 4.398 9.66.739a1.035 1.035 0 111.464 1.464l-3.66 3.66 3.66 3.661a1.035 1.035 0 11-1.464 1.464z' fill='rgba(255,255,255, 0.8)' fill-rule='nonzero'/%3E%3C/svg%3E");
            background-size: 14px;
            background-repeat: no-repeat;
            background-position: 50%;
            border-radius: 100%;
            cursor: pointer;

            &:hover {
                background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.66 10.987L6 7.327l-3.66 3.66A1.035 1.035 0 11.876 9.523l3.66-3.66-3.66-3.66A1.035 1.035 0 012.34.737L6 4.398 9.66.739a1.035 1.035 0 111.464 1.464l-3.66 3.66 3.66 3.661a1.035 1.035 0 11-1.464 1.464z' fill='rgba(255,255,255,1)' fill-rule='nonzero'/%3E%3C/svg%3E");
            }
        }

        &-logo {
            width: 100%;
            height: 50px;
            background-size: 165px;
            background-repeat: no-repeat;
            background-position: 50%;
            margin-bottom: 20px;

            &.loading {
                border-radius: 100%;
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0.5 0.5 45 45' xmlns='http://www.w3.org/2000/svg' stroke='%23fff'%3E%3Cg fill='none' fill-rule='evenodd' transform='translate(1 1)' stroke-width='2'%3E%3Ccircle cx='22' cy='22' r='6' stroke-opacity='0'%3E%3Canimate attributeName='r' begin='1.5s' dur='3s' values='6;22' calcMode='linear' repeatCount='indefinite' /%3E%3Canimate attributeName='stroke-opacity' begin='1.5s' dur='3s' values='1;0' calcMode='linear' repeatCount='indefinite' /%3E%3Canimate attributeName='stroke-width' begin='1.5s' dur='3s' values='2;0' calcMode='linear' repeatCount='indefinite' /%3E%3C/circle%3E%3Ccircle cx='22' cy='22' r='6' stroke-opacity='0'%3E%3Canimate attributeName='r' begin='3s' dur='3s' values='6;22' calcMode='linear' repeatCount='indefinite' /%3E%3Canimate attributeName='stroke-opacity' begin='3s' dur='3s' values='1;0' calcMode='linear' repeatCount='indefinite' /%3E%3Canimate attributeName='stroke-width' begin='3s' dur='3s' values='2;0' calcMode='linear' repeatCount='indefinite' /%3E%3C/circle%3E%3Ccircle cx='22' cy='22' r='8'%3E%3Canimate attributeName='r' begin='0s' dur='1.5s' values='6;1;2;3;4;5;6' calcMode='linear' repeatCount='indefinite' /%3E%3C/circle%3E%3C/g%3E%3C/svg%3E");
                width: 104px;
                height: 104px;
                margin: 35px auto 35px;
                background-size: initial;
            }

            &.error {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='38' viewBox='0 0 12 38'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F94E6C' fill-rule='nonzero'%3E%3Cg%3E%3Cpath d='M11.227 35.73c0 .385-.131.708-.392.97-.26.261-.57.391-.929.391H1.981c-.358 0-.667-.13-.929-.392-.261-.261-.392-.584-.392-.97v-7.842c0-.385.131-.708.392-.97.262-.261.57-.391.929-.391h7.925c.358 0 .668.13.929.392.26.26.392.584.392.969v7.843zM11.145 20.293c-.028.275-.173.501-.434.68-.261.18-.585.268-.97.268H2.104c-.385 0-.715-.09-.99-.268-.276-.18-.413-.405-.413-.681L0 1.428C0 1.043.137.754.412.562.77.259 1.1.108 1.403.108h9.081c.303 0 .633.15.991.454.275.192.412.454.412.784l-.742 18.947z' transform='translate(-506 -305) translate(506 305)'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
                width: 104px;
                height: 104px;
                margin: 60px auto 35px;
                border-radius: 100%;
                background-color: white;
                background-size: initial;
            }

            &.success {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='35' height='26' viewBox='0 0 35 26'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2312C9A0' fill-rule='nonzero'%3E%3Cpath d='M528.59 316.077c0 .548-.22 1.095-.614 1.489l-18.821 18.821c-.394.394-.941.613-1.488.613s-1.095-.219-1.489-.613l-10.899-10.899c-.393-.394-.612-.94-.612-1.488 0-.547.219-1.094.612-1.488l2.977-2.977c.394-.394.941-.612 1.488-.612s1.094.218 1.488.612l6.435 6.457 14.357-14.38c.394-.393.94-.612 1.488-.612.547 0 1.094.219 1.488.613l2.976 2.976c.394.394.613.941.613 1.488z' transform='translate(-494 -311)'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
                width: 104px;
                height: 104px;
                margin: 60px auto 35px;
                border-radius: 100%;
                background-color: white;
                background-size: initial;
            }
        }

        &-info {
            text-align: center;
        }

        &-title {
            font-size: 28px;
            line-height: 40px;
            display: block;
        }

        &-request {
            display: flex;
            flex-direction: column;
            padding: 20px 55px 40px 55px;
            border-radius: 20px;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
        }

        &-hr {
            margin-top: 30px;
            margin-bottom: 10px;
        }

        &-footnote {
            font-family: 'Circular Std Book', sans-serif;
            font-size: 16px;
            text-align: center;
            width: 100%;
            position: absolute;
            bottom: -30px;
            left: 0;
            color: white;

            a {
                color: white;
                text-decoration: underline;
            }
        }
    }
</style>
