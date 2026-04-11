import classes from "./ComposePanel.module.css";

import { useState } from "react";
import { Button, Group, Paper, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Link, RichTextEditor } from "@mantine/tiptap";
import { IconCheck, IconMailForward, IconX } from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { getAPIClient } from "@/lib/api";

export function ComposePanel() {
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
      const { data } = await api.post<{ queued: number }>("/mailer/batch", {
        html,
        subject,
      });

      notifications.show({
        color: "green",
        icon: <IconCheck size={16} />,
        message: `${data.queued} email${data.queued !== 1 ? "s" : ""} queued successfully.`,
        withBorder: true,
      });

      setSubject("");
      editor?.commands.clearContent();
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
            <RichTextEditor.Toolbar variant="subtle">
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.ClearFormatting />
                <RichTextEditor.Highlight />
                <RichTextEditor.Code />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
                <RichTextEditor.H4 />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Blockquote />
                <RichTextEditor.Hr />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
                <RichTextEditor.Subscript />
                <RichTextEditor.Superscript />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.AlignLeft />
                <RichTextEditor.AlignCenter />
                <RichTextEditor.AlignJustify />
                <RichTextEditor.AlignRight />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Undo />
                <RichTextEditor.Redo />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>

            <RichTextEditor.Content />
          </RichTextEditor>
        </div>

        <Group>
          <Button
            leftSection={<IconMailForward size={16} />}
            loading={isSending}
            onClick={handleSend}
          >
            Send to all users
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
