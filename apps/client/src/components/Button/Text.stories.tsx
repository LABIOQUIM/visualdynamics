import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, Home } from "lucide-react";

import { TextButton } from "@app/components/Button/Text";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta: Meta<typeof TextButton> = {
  title: "Components/Button/Text",
  component: TextButton,
  tags: ["autodocs"],
  argTypes: {},
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <TextButton {...args}>Label</TextButton>
      {[Home, ArrowRight].map((Icon, i) => (
        <TextButton
          key={Icon.name}
          LeftIcon={i % 2 === 0 ? Icon : undefined}
          RightIcon={i % 2 === 1 ? Icon : undefined}
          {...args}
        >
          Label
        </TextButton>
      ))}
    </div>
  )
};

export default meta;
type Story = StoryObj<typeof TextButton>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Base: Story = {
  args: {}
};

export const CustomColor: Story = {
  args: {
    className:
      "text-violet-600 enabled:hover:text-violet-700 focus:ring-violet-400"
  }
};
