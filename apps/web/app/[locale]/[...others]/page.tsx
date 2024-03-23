import { Box, Button, Group, Text, Title } from "@mantine/core";
import Link from "next/link";

import { PageLayout } from "@/components/Layout/PageLayout";

import { Illustration } from "./Illustration";

import classes from "./NotFound.module.css";

export default function Page() {
  return (
    <PageLayout>
      <Box className={classes.container}>
        <Illustration className={classes.image} />
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>Nothing to see here</Title>
            <Text
              c="dimmed"
              size="lg"
              ta="center"
              className={classes.description}
            >
              Page you are trying to open does not exist. You may have mistyped
              the address, or the page has been moved to another URL. If you
              think this is an error contact support.
            </Text>
            <Group justify="center">
              <Button component={Link} href="/" size="md">
                Take me back to home page
              </Button>
            </Group>
          </div>
        </div>
      </Box>
    </PageLayout>
  );
}
