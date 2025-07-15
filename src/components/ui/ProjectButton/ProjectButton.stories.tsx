import type { Meta, StoryObj } from '@storybook/react'
import { ProjectButton } from './ProjectButton'

const meta: Meta<typeof ProjectButton> = {
  title: 'UI/ProjectButton',
  component: ProjectButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A button component designed for construction industry applications.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost']
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl']
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'ProjectButton',
  }
}

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Action',
  }
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Action',
  }
}

export const Construction: Story = {
  args: {
    variant: 'construction',
    children: 'Start Project',
  }
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ProjectButton size="sm">Small</ProjectButton>
      <ProjectButton size="md">Medium</ProjectButton>
      <ProjectButton size="lg">Large</ProjectButton>
      <ProjectButton size="xl">Extra Large</ProjectButton>
    </div>
  )
}