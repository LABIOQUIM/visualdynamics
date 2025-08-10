"use client";
import { Badge, Card, Group, List, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import Image from "next/image";

import VDBg from "@/assets/visualdynamics.png";

import classes from "./page.module.css";

export function AboutSummary() {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          className={classes.image}
          src={VDBg}
          alt="Visual Dynamics Interface"
        />
      </Card.Section>

      <Group mt="md" mb="xs">
        <Badge color="blue" variant="light">
          Open Source
        </Badge>
        <Text>Visual Dynamics: Simplified MD Simulations</Text>
      </Group>

      <Text size="sm" color="dimmed">
        Web-based tool simplifying and accelerating molecular dynamics (MD)
        simulations using GROMACS.
      </Text>

      <List mt="md" spacing="xs" size="sm" icon={<IconCheck size={12} />}>
        <List.Item>User-friendly graphical interface.</List.Item>
        <List.Item>Accessible from any device with a web browser.</List.Item>
        <List.Item>Ideal for learning and teaching MD simulations.</List.Item>
        <List.Item>Focus on protein-ligand simulations.</List.Item>
        <List.Item>Free and open source.</List.Item>
      </List>
    </Card>
  );
}
