import classes from "./ComposePanel.module.css";

import { useState } from "react";
import { Button, Group, Paper, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Link, RichTextEditor } from "@mantine/tiptap";
import { IconCheck, IconMailForward, IconX } from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { getAPIClient } from "@/lib/api";

interface ComposePanelProps {
  onSuccess: () => void;
  selected: Set<string>;
}

export function ComposePanel({ onSuccess, selected }: ComposePanelProps) {
  const [subject, setSubject] = useState("");
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: "",
  });

  async function handleSend() {
    let valid = true;

    if (!subject.trim()) {
      setSubjectError("Subject is required");
      valid = false;
    } else {
      setSubjectError(null);
    }

    const html = editor?.getHTML() ?? "";
    const bodyEmpty = !editor?.getText().trim();

    if (selected.size === 0) {
      notifications.show({
        color: "orange",
        message: "Select at least one recipient.",
        withBorder: true,
      });
      valid = false;
    }

    if (bodyEmpty) {
      notifications.show({
        color: "orange",
        message: "Email body cannot be empty.",
        withBorder: true,
      });
      valid = false;
    }

    if (!valid) return;

    setIsSending(true);
    try {
      const api = await getAPIClient();
      await api.post("/mailer/batch", {
        html,
        subject,
        to: Array.from(selected),
      });

      notifications.show({
        color: "green",
        icon: <IconCheck size={16} />,
        message: `${selected.size} email${selected.size !== 1 ? "s" : ""} queued successfully.`,
        withBorder: true,
      });

      setSubject("");
      editor?.commands.clearContent();
      onSuccess();
    } catch (e) {
      notifications.show({
        color: "red",
        icon: <IconX size={16} />,
        message: e instanceof Error ? e.message : "Failed to send emails.",
        withBorder: true,
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Paper className={classes.root} p="md" withBorder>
      <Stack className={classes.stack}>
        <TextInput
          error={subjectError}
          label="Subject"
          onChange={(e) => setSubject(e.currentTarget.value)}
          placeholder="Important update"
          value={subject}
        />

        <div className={classes.editorWrapper}>
          <Text fw={500} size="sm">
            Body
          </Text>
          <RichTextEditor
            classNames={{
              root: classes.editor,
              content: classes.content,
            }}
            editor={editor}
          >
            <RichTextEditor.Toolbar sticky>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Strikethrough />
              </RichTextEditor.ControlsGroup>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
              </RichTextEditor.ControlsGroup>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
              </RichTextEditor.ControlsGroup>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Blockquote />
                <RichTextEditor.Code />
                <RichTextEditor.Hr />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>

            <RichTextEditor.Content />
          </RichTextEditor>
        </div>

        <Group>
          <Button
            disabled={selected.size === 0}
            leftSection={<IconMailForward size={16} />}
            loading={isSending}
            onClick={handleSend}
          >
            Send to {selected.size} recipient{selected.size !== 1 ? "s" : ""}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
