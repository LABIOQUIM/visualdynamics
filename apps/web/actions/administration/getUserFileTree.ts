"use server";

import { api } from "@/lib/apis";

import { validateAuth } from "../auth/validateAuth";

function transformFileObject(node: FileProps) {
  // Create the new object with the renamed keys
  const newNode: FileProps = {
    path: node.path,
    name: node.name,
  };

  // Check if the node has children and if it's an array
  if (
    node.children &&
    Array.isArray(node.children) &&
    node.children.length > 0
  ) {
    // 1. Recursively transform each child first
    const transformedChildren = node.children.map((child) =>
      transformFileObject(child)
    );

    // 2. Sort the transformed children array
    transformedChildren.sort((a, b) => {
      // Check if each transformed node has a 'children' property (and it's not empty)
      const aHasChildren = a.children && a.children.length > 0;
      const bHasChildren = b.children && b.children.length > 0;

      if (aHasChildren && !bHasChildren) {
        return -1; // a comes first (it has children, b doesn't)
      } else if (!aHasChildren && bHasChildren) {
        return 1; // b comes first (it has children, a doesn't)
      } else {
        // Both have children OR neither has children: sort alphabetically by label
        return a.name.localeCompare(b.name);
      }
    });

    // 3. Assign the sorted array to the new 'children' property
    newNode.children = transformedChildren;
  }
  // If original node.children was empty or didn't exist, newNode won't have children property

  // Return the newly transformed node
  return newNode;
}

export async function getUserFileTree(userName: string) {
  const { user } = await validateAuth();

  if (!user) {
    return "unauthenticated";
  }

  if (user.role !== "ADMINISTRATOR") {
    return "unauthorized";
  }

  const tree = await api.get("/simulation/files", {
    headers: {
      "x-username": userName,
    },
  });

  const data = transformFileObject(tree.data);

  return [data];
}
