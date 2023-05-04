import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, Home } from "lucide-react";

import { Button } from "@app/components/Button";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta: Meta<typeof Button> = {
  title: "Components/Button/Base",
  component: Button,
  tags: ["autodocs"],
  argTypes: {},
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Button {...args}>Label</Button>
      {[Home, ArrowRight].map((Icon, i) => (
        <Button
          key={Icon.name}
          LeftIcon={i % 2 === 0 ? Icon : undefined}
          RightIcon={i % 2 === 1 ? Icon : undefined}
          {...args}
        >
          Label
        </Button>
      ))}
    </div>
  )
};

export default meta;
type Story = StoryObj<typeof Button>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Base: Story = {
  args: {}
};

export const CustomColor: Story = {
  args: {
    className: "bg-violet-600 enabled:hover:bg-violet-700 focus:ring-violet-400"
  }
};
