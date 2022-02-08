/* eslint-disable no-console */

import Link, {AnyAction, ChainId, Checksum256} from '@proton/link'
import BrowserTransport from './transport'

const appId = 'trans.test'

const transport = new BrowserTransport()

const link = new Link({
    transport,
    chains: [
        {
            chainId: '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0',
            nodeUrl: 'https://proton.greymass.com',
        },
    ],
    scheme: 'proton',
})

async function main() {
    let session = await link.restoreSession(appId)
    if (!session) {
        const result = await link.login(appId)
        console.log('logged in', result)
        session = result.session
    }
    console.log('session', session)

    const app = document.getElementById('app')
    app.innerHTML = `
        Logged in as <b>${session.auth.actor}@${session.auth.permission}</b><br>
        <hr>
        <div id="actions"></div>
        <div style="padding-top: 1em"><code id="log"></code><div>
    `
    const log = app.querySelector('#log')!

    const logoutButton = document.createElement('button')
    logoutButton.textContent = '🦞 log out'
    logoutButton.onclick = () => {
        app.innerHTML = 'Logging out...'
        session.remove().then(() => {
            app.innerHTML = 'Logged out, refresh page to login again'
        })
    }

    const actionButton = document.createElement('button')
    actionButton.textContent = '💰 teamgreymass'
    actionButton.onclick = () => {
        const actions: AnyAction[] = [
            {
                account: 'eosio.token',
                name: 'transfer',
                authorization: [session.auth],
                data: {
                    from: session.auth.actor,
                    to: 'teamgreymass',
                    quantity: '0.0001 XPR',
                    memo: 'grey money',
                },
            },
        ]
        session
            .transact({actions}, {broadcast: true})
            .then((result) => {
                console.log('trace', result.processed)
                log.innerHTML += `
                    Transaction sent!
                    <a href="${explorerUrl(
                        result.chain.chainId,
                        result.transaction.id
                    )}" target="_blank">${result.transaction.id}</a>
                    <br>
                `
            })
            .catch((error) => {
                console.log('transact error', error)
                log.innerHTML += `
                    Error: ${error.message || String(error)}
                    <br>
                `
            })
    }

    const transactButton = document.createElement('button')
    transactButton.textContent = '💰 teamgreymass (no session)'
    transactButton.onclick = () => {
        link.transact(
            {
                action: {
                    account: 'eosio.token',
                    name: 'transfer',
                    authorization: [session.auth],
                    data: {
                        from: session.auth.actor,
                        to: 'teamgreymass',
                        quantity: '0.0001 EOS',
                        memo: 'grey money',
                    },
                },
            },
            {chain: session.chainId, broadcast: true}
        ).then((result) => {
            console.log(result)
        })
    }

    const actions = app.querySelector('#actions')
    actions.appendChild(actionButton)
    actions.appendChild(transactButton)
    actions.appendChild(logoutButton)
    actions.appendChild(document.createElement('br'))
    actions.appendChild(document.createElement('br'))
}

window.addEventListener('DOMContentLoaded', () => {
    main().catch((error) => {
        console.error(error)
        document.querySelector('#app')!.innerHTML = error.message || String(error)
    })
})

function explorerUrl(chainId: ChainId, id: Checksum256) {
    switch (String(chainId)) {
        case '2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840':
            return `https://jungle.bloks.io/transaction/${id}`
        case 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906':
            return `https://bloks.io/transaction/${id}`
        default:
            throw new Error('Unknown chain')
    }
}
