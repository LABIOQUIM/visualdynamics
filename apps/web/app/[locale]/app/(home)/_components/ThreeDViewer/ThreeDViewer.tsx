"use client";
import { useEffect, useRef } from "react";
import Viewer from "3dmol";

import { Macromolecules } from "@/actions/simulation/getLatestSimulationMacromolecules";

import classes from "./ThreeDViewer.module.css";

interface Props {
  macromolecules: "unauthenticated" | undefined | Macromolecules;
}

export function ThreeDViewer({ macromolecules }: Props) {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !viewerRef.current ||
      !macromolecules ||
      macromolecules === "unauthenticated"
    ) {
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

  if (!macromolecules || macromolecules === "unauthenticated") {
    return (
      <div className={classes.viewerContainer}>
        <p>No macromolecule data available.</p>
      </div>
    );
  }

  return <div className={classes.viewerContainer} ref={viewerRef} />;
}
