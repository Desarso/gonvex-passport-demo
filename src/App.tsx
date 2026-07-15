import { useMemo, useState } from "react";
import { api } from "../gonvex/_generated/api";
import { useMutation, useQuery } from "../gonvex/_generated/react";
import { GoogleSignInButton, useGonvexAuth } from "../gonvex/auth";

type Message = {
  id: string;
  body: string;
  author: string;
  created_at: string;
};

function PassportMark() {
  return (
    <div className="passportMark" aria-hidden="true">
      <span className="orbit orbitOne" />
      <span className="orbit orbitTwo" />
      <span className="globe">G</span>
    </div>
  );
}

export default function App(props: { runtimeURL: string }) {
  const auth = useGonvexAuth();

  if (!auth.isAuthenticated) {
    return (
      <main className="page pageSignedOut">
        <div className="airmail airmailTop" />
        <div className="airmail airmailBottom" />

        <section className="passport" aria-labelledby="passport-title">
          <div className="passportSpine" />
          <div className="passportCover">
            <div className="coverMeta"><span>Gonvex Authority</span><span>No. 001</span></div>
            <PassportMark />
            <p className="coverKicker">Experimental access document</p>
            <h1 id="passport-title">A tiny passport to Gonvex.</h1>
            <p className="coverCopy">One Google identity. One project-scoped session. No Firebase detour.</p>
            <GoogleSignInButton className="googleButton">Request entry with Google</GoogleSignInButton>
            {auth.error ? <p className="authError" role="alert">{auth.error}</p> : null}
            <div className="machineLine">P&lt;GVX&lt;PASSPORT&lt;DEMO&lt;&lt;&lt;GOOGLE&lt;OAUTH&lt;&lt;&lt;&lt;</div>
          </div>
        </section>

        <aside className="fieldNote">
          <span className="notePin" />
          <strong>What this proves</strong>
          <p>The login is brokered by the Gonvex Maker server and scoped only to this toy project.</p>
        </aside>
      </main>
    );
  }

  return <AuthenticatedPassport runtimeURL={props.runtimeURL} />;
}

function AuthenticatedPassport(props: { runtimeURL: string }) {
  const auth = useGonvexAuth();
  const messages = useQuery<Message[]>(api.messages.list, {}) ?? [];
  const sendMessage = useMutation(api.messages.send);
  const [body, setBody] = useState("");
  const issued = useMemo(() => new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date()).toUpperCase(), []);

  async function submit() {
    const nextBody = body.trim();
    if (!nextBody) return;
    setBody("");
    await sendMessage({ body: nextBody });
  }

  return (
    <main className="page pageVerified">
      <div className="verifiedHeader">
        <div className="brandLockup"><PassportMark /><span>Gonvex Passport Office</span></div>
        <GoogleSignInButton className="signOutButton" signOutLabel="Close passport" />
      </div>

      <section className="openPassport" aria-label="Verified Gonvex passport">
        <div className="passportPage identityPage">
          <div className="pageNumber">01</div>
          <span className="eyebrow">Holder identification</span>
          <div className="portraitFrame">
            {auth.user?.picture ? <img src={auth.user.picture} alt="Google account portrait" /> : <span>{auth.user?.name?.slice(0, 1) ?? "G"}</span>}
          </div>
          <dl className="identityGrid">
            <div><dt>Name</dt><dd>{auth.user?.name || "Verified traveler"}</dd></div>
            <div><dt>Email</dt><dd>{auth.user?.email}</dd></div>
            <div><dt>Issued</dt><dd>{issued}</dd></div>
            <div><dt>Authority</dt><dd>Gonvex Maker</dd></div>
          </dl>
          <div className="verifiedStamp"><span>Identity</span><strong>Verified</strong><small>GOOGLE / PKCE</small></div>
          <div className="machineLine dark">GVX&lt;VERIFIED&lt;{auth.user?.id?.slice(0, 12).toUpperCase()}&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
        </div>

        <div className="passportPage entryPage">
          <div className="pageNumber">02</div>
          <span className="eyebrow">Live entry ledger</span>
          <div className="ledgerIntro">
            <div><span className="liveDot" /> Realtime function connected</div>
            <p>Leave a short arrival note. Seeing it appear proves the authenticated app can reach its own Gonvex backend.</p>
          </div>

          <div className="entries">
            {messages.length === 0 ? (
              <div className="emptyEntry">No arrivals stamped yet.</div>
            ) : messages.slice(-4).reverse().map((message) => (
              <article className="entry" key={message.id}>
                <span>{message.author.slice(0, 1).toUpperCase()}</span>
                <div><strong>{message.author}</strong><p>{message.body}</p></div>
              </article>
            ))}
          </div>

          <form className="entryForm" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
            <label htmlFor="arrival-note">Arrival note</label>
            <div>
              <input id="arrival-note" value={body} onChange={(event) => setBody(event.target.value)} maxLength={120} placeholder="The border crossing was delightfully uneventful." />
              <button type="submit">Stamp it</button>
            </div>
          </form>
          <p className="runtimeLine">Runtime · {props.runtimeURL.replace(/^wss?:\/\//, "").replace(/\/ws$/, "")}</p>
        </div>
      </section>
    </main>
  );
}
