import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, Home } from "lucide-react";

import { TextButton } from "@app/components/Button/Text";

const variants = [
  "text-primary-600 enabled:hover:text-primary-700",
  "text-zinc-600 enabled:hover:text-zinc-700",
  "text-red-600 enabled:hover:text-red-700",
  "text-amber-600 enabled:hover:text-amber-700",
  "text-emerald-600 enabled:hover:text-emerald-700",
  "text-sky-600 enabled:hover:text-sky-700",
  "text-blue-600 enabled:hover:text-blue-700",
  "text-purple-600 enabled:hover:text-purple-700",
  "text-pink-600 enabled:hover:text-pink-700",
  "text-rose-600 enabled:hover:text-rose-700"
];

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta: Meta<typeof TextButton> = {
  title: "Components/Button/Text",
  component: TextButton,
  tags: ["autodocs"],
  argTypes: {},
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => (
        <TextButton
          {...args}
          key={variant}
          className={variant}
        />
      ))}
    </div>
  )
};

export default meta;
type Story = StoryObj<typeof TextButton>;

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
