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
    const ligandPdb = macromolecules.ligandPdb;

    if (macromolecule) {
      viewer.addModel(macromolecule, "pdb", {
        style: { cartoon: { color: "spectrum" } },
      });
    }

    if (ligandPdb) {
      viewer.addModel(ligandPdb, "pdb", {
        style: { stick: {} },
      });
    }

    viewer.zoomTo();
    viewer.render();

    return () => {
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
