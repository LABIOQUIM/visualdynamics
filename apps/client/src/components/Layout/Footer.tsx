import Link from "next/link";

import app from "../../../package.json";

export function Footer() {
  return (
    <footer className="mx-auto max-w-4xl py-3 text-zinc-400/70">
      <div className="flex items-center justify-center">
        <p className="group flex items-center text-xs">v{app.version}</p>
        <span className="mx-2 inline-block h-1 w-1 rounded-full bg-zinc-400/70" />
        <p className="group flex items-center text-xs">
          <Link
            href="https://github.com/LABIOQUIM"
            rel="noreferrer"
            target="_blank"
            className="inline-block font-bold text-zinc-400/70 transition-colors duration-100 ease-linear group-hover:text-white"
          >
            Visual Dynamics Dev Team
          </Link>
        </p>
        <span className="mx-2 inline-block h-1 w-1 rounded-full bg-zinc-400/70" />
        <p className="group flex items-center text-xs">
          <Link
            href="https://github.com/LABIOQUIM/visualdynamics"
            rel="noreferrer"
            target="_blank"
            className="inline-block font-bold text-zinc-400/70 transition-colors duration-100 ease-linear group-hover:text-white"
          >
            Código Fonte
          </Link>
        </p>
      </div>
    </footer>
  );
}
