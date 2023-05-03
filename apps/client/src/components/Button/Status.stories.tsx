import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, Home } from "lucide-react";

import { StatusButton } from "@app/components/Button/Status";

const variants: ("queued" | "canceled" | "finished" | "running" | "error")[] = [
  "queued",
  "canceled",
  "finished",
  "running",
  "error"
];

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta: Meta<typeof StatusButton> = {
  title: "Components/Button/Status",
  component: StatusButton,
  tags: ["autodocs"],
  argTypes: {},
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => (
        <StatusButton
          {...args}
          key={variant}
          status={variant}
        />
      ))}
    </div>
  )
};

export default meta;
type Story = StoryObj<typeof StatusButton>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const NoIcon: Story = {
  args: {
    children: "Button"
  }
};

export const WithLeftIcon: Story = {
  args: {
    children: "Home",
    LeftIcon: Home
  }
};

export const WithRightIcon: Story = {
  args: {
    children: "Continue",
    RightIcon: ArrowRight
  }
};
