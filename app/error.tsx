"use client";
import Link from "next/link";
import { Mark } from "./components/primitives";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main className="fallback-page"><Mark/><span className="eyebrow">WORKSPACE INTERRUPTED</span><h1>Let’s restore your view.</h1><p>Something interrupted the interface. Try loading the workspace again.</p><button className="button button-silver" onClick={() => retry()}>Try again</button><Link className="text-button" href="/">Return to overview</Link></main>;
}
