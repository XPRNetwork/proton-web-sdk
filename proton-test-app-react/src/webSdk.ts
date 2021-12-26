import { ConnectWallet, ProtonWebLink } from '@proton/web-sdk';
import { LinkSession, TransactResult, Link } from '@proton/link';
import { Serialize } from '@proton/js';

export let link: ProtonWebLink | Link | null | undefined;
export let session: LinkSession | null | undefined;

const REQUEST_ACCOUNT = 'taskly'
const CHAIN_ID = '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0'
const ENDPOINTS = 'https://proton.greymass.com'

export const createLink = async ({
  restoreSession = false,
}: {
  restoreSession?: boolean;
}): Promise<void> => {
  const { link: localLink, session: localSession } = await ConnectWallet({
    linkOptions: {
      endpoints: [ENDPOINTS],
      chainId: CHAIN_ID,
      restoreSession,
    },
    transportOptions: {
      requestAccount: REQUEST_ACCOUNT,
      requestStatus: false,
      backButton: true,
    },
    selectorOptions: {
      appName: 'Proton Swap',
    },
  });
  link = localLink;
  session = localSession;
};

export const login = async (): Promise<LinkSession> => {
  await createLink({ restoreSession: false });
  if (session) {
    return session;
  } else {
    throw new Error('No Session');
  }
};

export const transact = async (
  actions: Serialize.Action[],
  broadcast: boolean
): Promise<TransactResult> => {
  if (session) {
    return session.transact(
      {
        transaction: {
          actions,
        } as never,
      },
      { broadcast }
    );
  } else {
    throw new Error('No Session');
  }
};

export const logout = async (): Promise<void> => {
  if (link && session) {
    await link.removeSession(REQUEST_ACCOUNT, session.auth, CHAIN_ID);
  }
  session = undefined;
  link = undefined;
};

export const reconnect = async (): Promise<LinkSession> => {
  if (!session) {
    await createLink({ restoreSession: true });
  }

  if (session) {
    return session;
  } else {
    throw new Error('No Session');
  }
};

export default {
  link,
  login,
  transact,
  logout,
  reconnect,
};
