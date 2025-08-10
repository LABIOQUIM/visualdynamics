import { Box } from "@mantine/core";

import { AdministrationNav } from "@/components/Administration/Nav";
import { Heading } from "@/components/Heading/Heading";
import { PageLayout } from "@/components/Layout/PageLayout/PageLayout";

import classes from "./page.module.css";

export default function AdministrationPage() {
  return (
    <PageLayout>
      <Heading title="Administration" />

      <Box className={classes.container}>
        <AdministrationNav />
      </Box>
    </PageLayout>
  );
}
