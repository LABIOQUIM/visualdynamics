import { createDirectus, rest } from "@directus/sdk";

interface Schema {
  Documentation: DocumentationType[];
  Knowledge: KnowledgeType[];
}

// Client with REST support
export const directusClient = createDirectus<Schema>(
  "http://directus:8055"
).with(rest());
