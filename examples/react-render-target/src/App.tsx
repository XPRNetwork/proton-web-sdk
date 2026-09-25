import {useRef, useState} from "react";
import ProtonWebSDK from "@proton/web-sdk";
import type {Link, LinkSession, ProtonWebLink} from "@proton/web-sdk";

const REQUEST_ACCOUNT = "taskly";
const BURN_ACCOUNT = "eosio.null";
const CHAIN_ID =
  "71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd";
const ENDPOINTS = ["https://testnet.rockerone.io"];

type Renderer = NonNullable<
  Awaited<ReturnType<typeof ProtonWebSDK>>["renderer"]
>;

type Mode = "connect" | "sign" | "done";

const nextFrame = () =>
  new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

export const App = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const linkRef = useRef<ProtonWebLink | Link | undefined>(undefined);
  const rendererRef = useRef<Renderer | undefined>(undefined);
  const [session, setSession] = useState<LinkSession | undefined>();
  const [mode, setMode] = useState<Mode | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Not connected");
  const [burned, setBurned] = useState(false);

  const openWith = async (next: Mode) => {
    setMode(next);
    await nextFrame();
  };

  const closeModal = () => setMode(null);

  const connect = async () => {
    setBusy(true);
    await openWith("connect");
    if (!targetRef.current) {
      setBusy(false);
      return;
    }
    try {
      const result = await ProtonWebSDK({
        linkOptions: {
          endpoints: ENDPOINTS,
          chainId: CHAIN_ID,
          restoreSession: false,
        },
        transportOptions: {
          requestAccount: REQUEST_ACCOUNT,
          requestStatus: false,
        },
        uiOptions: {
          appInfo: {name: "renderTarget demo"},
          renderTarget: targetRef.current,
        },
      });
      linkRef.current = result.link;
      rendererRef.current = result.renderer;
      if (result.session) {
        setSession(result.session);
        setStatus(`Connected as ${result.session.auth.actor}`);
        setMode("done");
      } else {
        setStatus("Login cancelled");
        closeModal();
      }
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
      closeModal();
    } finally {
      setBusy(false);
    }
  };

  const transfer = async (
    to: string,
    memo: string,
    successLabel: string,
    embedded: boolean,
  ) => {
    if (!session) return;
    setBusy(true);
    if (embedded) {
      await openWith("sign");
      rendererRef.current?.setRenderTarget(targetRef.current!);
    } else {
      rendererRef.current?.setRenderTarget(null);
    }
    try {
      await session.transact(
        {
          actions: [
            {
              account: "eosio.token",
              name: "transfer",
              data: {
                from: session.auth.actor,
                to,
                quantity: "0.0001 XPR",
                memo,
              },
              authorization: [session.auth],
            },
          ],
        },
        {broadcast: true},
      );
      setStatus(successLabel);
      if (embedded) setMode("done");
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
      if (embedded) setMode("done");
    } finally {
      setBusy(false);
    }
  };

  const sendToTaskly = () =>
    transfer(
      REQUEST_ACCOUNT,
      "renderTarget example",
      "Transfer signed and broadcast",
      false,
    );

  const burn = async () => {
    await transfer(
      BURN_ACCOUNT,
      "burn",
      "Burned 0.0001 XPR to eosio.null",
      true,
    );
    setBurned(true);
  };

  const logout = async () => {
    if (linkRef.current && session) {
      await linkRef.current.removeSession(
        REQUEST_ACCOUNT,
        session.auth,
        CHAIN_ID,
      );
    }
    linkRef.current = undefined;
    rendererRef.current = undefined;
    setSession(undefined);
    setStatus("Not connected");
    setBurned(false);
  };

  return (
    <>
      <div className="page">
        <h1>Proton Web SDK — renderTarget example</h1>
        <p>
          Clicking <strong>Connect</strong> opens a two-pane modal: the left
          side is your own UI, and the SDK dialog mounts into the right pane
          using the new <code>renderTarget</code> option.
        </p>

        <div className="status">{status}</div>

        {!session ? (
          <button onClick={connect} disabled={busy}>
            {busy ? "Opening…" : "Connect wallet"}
          </button>
        ) : (
          <div className="actions">
            <button onClick={sendToTaskly} disabled={busy}>
              {busy ? "Signing…" : "Send 0.0001 XPR"}
            </button>
            <button onClick={logout} disabled={busy} className="secondary">
              Logout
            </button>
          </div>
        )}
      </div>

      {mode && (
        <div
          className="backdrop"
          onMouseDown={e => {
            if (e.target === e.currentTarget && !busy) closeModal();
          }}
        >
          <div className="modal">
            <aside className="message">
              <div className="message-body">
                <h2>Challenge render target!</h2>
                <p>
                  Let's make this fun! Added a render target to allow Web SDK
                  dialog to show in any part of your own ui.
                </p>
                <ul className="tasks">
                  <li
                    className={`task ${
                      session ? "done" : mode === "connect" ? "active" : ""
                    }`}
                  >
                    <span className="task-bullet">{session ? "✓" : "1"}</span>
                    <div className="task-body">
                      <div className="task-label">Connect your wallet</div>
                      {session && (
                        <div className="task-sub">
                          Connected as @{String(session.auth.actor)}
                        </div>
                      )}
                    </div>
                  </li>
                  <li
                    className={`task ${
                      burned
                        ? "done"
                        : session && mode === "sign"
                          ? "active"
                          : ""
                    }`}
                  >
                    <span className="task-bullet">{burned ? "✓" : "2"}</span>
                    <div className="task-body">
                      <div className="task-label">Burn 0.0001 XPR</div>
                    </div>
                  </li>
                </ul>
              </div>
              {mode === "done" && <button onClick={closeModal}>Close</button>}
            </aside>
            <div ref={targetRef} className="render-target">
              {mode === "done" && session && (
                <div className="success">
                  <div className="success-ring">
                    <svg viewBox="0 0 48 48" width="44" height="44">
                      <polyline
                        points="14,25 21,32 34,18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3>
                    {status.startsWith("Transfer")
                      ? "Transaction signed"
                      : "Wallet connected"}
                  </h3>
                  <p className="account">{String(session.auth.actor)}</p>
                  <p className="success-hint">
                    {status.startsWith("Transfer") ||
                    status.startsWith("Burned")
                      ? "Your transaction has been broadcast to the network."
                      : "You can now sign transactions from this app."}
                  </p>
                  <button className="burn" onClick={burn} disabled={busy}>
                    {busy ? "Signing…" : "Burn 0.0001 XPR"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
