import { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { File, Folder, Minus, Plus } from "lucide-react";
import Link from "next/link";

import { Paragraph } from "@app/components/general/typography/paragraphs";

interface TreeItemProps {
  item: PureTree;
  fullPath?: string;
}

export function TreeItem({ item, fullPath }: TreeItemProps) {
  const [isDirectoryExpanded, setIsDirectoryExpanded] = useState(false);

  if (item.type !== "directory" && item.type !== "file") {
    return null;
  }

  if (item.type === "directory") {
    item.children = item?.children?.sort((a) =>
      a.type === "directory" ? -1 : 1
    );

    return (
      <Collapsible.Root
        className="my-2"
        open={isDirectoryExpanded}
        onOpenChange={setIsDirectoryExpanded}
      >
        <Collapsible.Trigger className="flex gap-2 leading-relaxed">
          <Folder />
          <Paragraph>{item.name}</Paragraph>
          {isDirectoryExpanded ? (
            <Minus className="my-auto h-4 w-4" />
          ) : (
            <Plus className="my-auto h-4 w-4" />
          )}
        </Collapsible.Trigger>
        <Collapsible.Content className="ml-8">
          {item.children?.map((subitem) => (
            <TreeItem
              key={subitem.name}
              item={subitem}
              fullPath={
                fullPath
                  ? fullPath + "/" + subitem.name
                  : item.name + "/" + subitem.name
              }
            />
          ))}
        </Collapsible.Content>
      </Collapsible.Root>
    );
  }

  if (item.name.startsWith("#")) {
    return (
      <div className="my-2 flex cursor-not-allowed gap-2 leading-relaxed">
        <File />
        <Paragraph>{item.name}</Paragraph>
      </div>
    );
  }

  return (
    <Link
      className="my-2 flex gap-2 leading-relaxed"
      href={`/api/downloads/file?fullPath=${fullPath}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <File />
      <Paragraph>{item.name}</Paragraph>
    </Link>
  );
}
