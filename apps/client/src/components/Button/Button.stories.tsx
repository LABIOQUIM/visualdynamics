import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, Home } from "lucide-react";

import { Button } from "@app/components/Button";

const variants = [
  "bg-primary-500 enabled:hover:bg-primary-600",
  "bg-zinc-500 enabled:hover:bg-zinc-600",
  "bg-red-500 enabled:hover:bg-red-600",
  "bg-amber-500 enabled:hover:bg-amber-600",
  "bg-emerald-500 enabled:hover:bg-emerald-600",
  "bg-sky-500 enabled:hover:bg-sky-600",
  "bg-blue-500 enabled:hover:bg-blue-600",
  "bg-purple-500 enabled:hover:bg-purple-600",
  "bg-pink-500 enabled:hover:bg-pink-600",
  "bg-rose-500 enabled:hover:bg-rose-600"
];

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta: Meta<typeof Button> = {
  title: "Components/Button/Base",
  component: Button,
  tags: ["autodocs"],
  argTypes: {},
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => (
        <Button
          {...args}
          key={variant}
          className={`${variant}`}
        />
      ))}
    </div>
  )
};

export default meta;
type Story = StoryObj<typeof Button>;

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
