import classes from "./MolViewer.module.css";

import { useEffect, useRef } from "react";
import { IconCircleOff } from "@tabler/icons-react";
import * as NGL from "ngl";

import type { LatestMacromolecules } from "@/queries/latestMacromolecules";

interface Props {
  macromolecules?: LatestMacromolecules;
}

export function MolViewer({ macromolecules }: Props) {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewerRef.current || !macromolecules) {
      return;
    }

    let mounted = true;

    const stage = new NGL.Stage(viewerRef.current, {
      backgroundColor: "#f8f9fa",
    });

    const macromolecule = macromolecules.macromolecule;
    const ligandPdbs = macromolecules.ligandPdbs;

    const loadPromises: Promise<void | NGL.Component>[] = [];

    if (macromolecule) {
      const blob = new Blob([macromolecule], { type: "text/plain" });
      loadPromises.push(
        stage.loadFile(blob, { ext: "pdb" }).then((comp) => {
          if (!mounted || !comp) return;
          comp.addRepresentation("cartoon", { colorScheme: "chainindex" });
        }),
      );
    }

    if (ligandPdbs) {
      for (const ligandPdb of ligandPdbs) {
        const blob = new Blob([ligandPdb], { type: "text/plain" });
        loadPromises.push(
          stage.loadFile(blob, { ext: "pdb" }).then((comp) => {
            if (!mounted || !comp) return;
            comp.addRepresentation("ball+stick", {});
          }),
        );
      }
    }

    void Promise.all(loadPromises).then(() => {
      if (!mounted) return;
      stage.autoView();
    });

    return () => {
      mounted = false;
      stage.dispose();
      // NGL.dispose() releases WebGL resources but does NOT remove its DOM
      // elements (wrapper div + canvas). Without manual cleanup, each remount
      // accumulates stale canvases inside the container: they appear side-by-side
      // in the flex row and the stale canvas height poisons getBoundingClientRect
      // for the next Stage constructor call.
      if (viewerRef.current) {
        viewerRef.current.replaceChildren();
      }
    };
  }, [macromolecules]);

  if (
    !macromolecules ||
    macromolecules.macromolecule === null ||
    macromolecules.macromolecule === ""
  ) {
    return (
      <div className={classes.viewerContainer}>
        <div className={classes.emptyContainer}>
          <IconCircleOff size={64} />
          <p>No macromolecule data available.</p>
        </div>
      </div>
    );
  }

  return <div className={classes.viewerContainer} ref={viewerRef} />;
}

export default MolViewer;
