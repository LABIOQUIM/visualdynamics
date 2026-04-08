import classes from "./MolViewer.module.css";

import { useEffect, useRef } from "react";
import { IconCircleOff } from "@tabler/icons-react";
import Viewer from "3dmol";

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

    const viewer = Viewer.createViewer(viewerRef.current, {
      backgroundColor: "#f8f9fa",
    });

    // Load the macromolecule structure
    const macromolecule = macromolecules.macromolecule;
    const ligandPdbs = macromolecules.ligandPdbs;

    if (macromolecule) {
      viewer.addModel(macromolecule, "pdb", {
        style: { cartoon: { color: "spectrum" } },
      });
    }

    if (ligandPdbs) {
      ligandPdbs.forEach((ligandPdb) => {
        viewer.addModel(ligandPdb, "pdb", {
          style: { stick: {} },
        });
      });
    }

    viewer.zoomTo();
    viewer.render();

    const container = viewerRef.current;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      e.stopImmediatePropagation();
      // Invert 3Dmol's default: scroll up = zoom in, scroll down = zoom out
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      viewer.zoom(factor, 0);
    }

    container.addEventListener("wheel", handleWheel, {
      capture: true,
      passive: false,
    });

    return () => {
      container.removeEventListener("wheel", handleWheel, { capture: true });
      viewer.removeAllModels();
      viewer.clear();
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
