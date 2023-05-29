import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, Home } from "lucide-react";

import { StatusButton } from "@app/components/general/buttons/Status";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta: Meta<typeof StatusButton> = {
  title: "Components/Button/Status",
  component: StatusButton,
  tags: ["autodocs"],
  argTypes: {},
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <StatusButton {...args}>Label</StatusButton>
      {[Home, ArrowRight].map((Icon, i) => (
        <StatusButton
          key={Icon.name}
          LeftIcon={i % 2 === 0 ? Icon : undefined}
          RightIcon={i % 2 === 1 ? Icon : undefined}
          {...args}
        >
          Label
        </StatusButton>
      ))}
    </div>
  )
};

export default meta;
type Story = StoryObj<typeof StatusButton>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Canceled: Story = {
  args: {
    status: "canceled"
  }
};

export const Error: Story = {
  args: {
    status: "error"
  }
};

export const Finished: Story = {
  args: {
    status: "finished"
  }
};

export const Queued: Story = {
  args: {
    status: "queued"
  }
};

export const Running: Story = {
  args: {
    status: "running"
  }
};
