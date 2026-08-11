import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { hasRevisitFlag, setRevisitFlag } from "../infra/synchronousFlags";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-060
 *
 * Gimmick: A synchronous flag and persisted observation make a later visit input.
 * Uses: A local synchronous revisit flag and the progress observation API.
 * Success: Re-enter after the first visit has recorded its observation.
 * Privacy/Permission: No permission; only an entered/returned fact is retained.
 * Cleanup: No external resource.
 * Human verification: H-001, H-018, H-025
 */
export default function S060Stage(props: StageComponentProps) {
  const observationId = "S-060:entered";
  const problem = props.problem("S-060-B01");
  const beaconProblem = props.problem("S-060-B02");
  const [status, setStatus] = useState("");
  const seenBefore = useRef(
    props.observations[observationId] !== undefined || hasRevisitFlag(),
  );

  useLayoutEffect(() => {
    if (!seenBefore.current) {
      setRevisitFlag();
      props.observe(observationId, ["entered"]);
    }
  }, [props.observe]);

  useEffect(() => {
    // Returning is itself the replay action, but solve after the first paint so
    // the shared box visibly transitions from closed to open on every visit.
    if (seenBefore.current) problem.solve(["returned"]);
  }, [problem.solve]);

  useEffect(() => {
    const nonce = new URL(window.location.href).searchParams.get(
      "offline-beacon",
    );
    if (!nonce || !("indexedDB" in window)) return;
    const request = indexedDB.open("busybox-offline-beacon", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("receipts", { keyPath: "nonce" });
    };
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction("receipts", "readwrite");
      const lookup = transaction.objectStore("receipts").get(nonce);
      lookup.onsuccess = () => {
        if (!lookup.result) {
          setStatus("no receipt yet");
          database.close();
          return;
        }
        transaction.objectStore("receipts").delete(nonce);
        beaconProblem.solve(["offline-beacon:receipt-consumed"]);
        setStatus("receipt consumed");
      };
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => database.close();
    };
    request.onerror = () => setStatus("receipt store unavailable");
  }, [beaconProblem.solve]);

  const sendBeacon = () => {
    const nonce = crypto.randomUUID();
    const payload = new Blob([JSON.stringify({ nonce })], {
      type: "application/json",
    });
    const accepted = navigator.sendBeacon(
      new URL("./offline-beacon/receipt", window.location.href),
      payload,
    );
    if (!accepted) {
      setStatus("sendBeacon() rejected; no navigation");
      return;
    }
    setStatus("sendBeacon() accepted; receiver navigation");
    const receiver = new URL("./index.html", window.location.href);
    receiver.searchParams.set("stage", "S-060");
    receiver.searchParams.set("offline-beacon", nonce);
    window.location.assign(receiver);
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="return-clue" aria-hidden="true">
        ↪
      </div>
      <p>{props.locale === "ja" ? "また、ここで。" : "See you here again."}</p>
      <div className="stage-actions">
        <button type="button" className="stage-action" onClick={sendBeacon}>
          {props.locale === "ja"
            ? "オフライン郵便を投函"
            : "Post offline beacon"}
        </button>
      </div>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
        <ProblemGiftBox problem={beaconProblem} locale={props.locale} />
      </div>
    </div>
  );
}
