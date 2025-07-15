# ProjectButton Component

A professional button component designed specifically for construction industry applications.

## Features

- ✨ Multiple variants for different use cases
- 📱 Fully responsive design
- ♿ WCAG 2.1 AA compliant
- 🎨 Customizable with CSS variables
- 🔧 Built with TypeScript for type safety
- 🧪 Comprehensive test coverage

## Installation

```bash
import { ProjectButton } from '@/components/ui/ProjectButton'
```

## Usage

### Basic Usage

```tsx
<ProjectButton>
  Default ProjectButton
</ProjectButton>
```

### Variants

```tsx
<ProjectButton variant="primary">Primary</ProjectButton>
<ProjectButton variant="secondary">Secondary</ProjectButton>
<ProjectButton variant="outline">Outline</ProjectButton>
<ProjectButton variant="construction">Construction</ProjectButton>
```

### Sizes

```tsx
<ProjectButton size="sm">Small</ProjectButton>
<ProjectButton size="md">Medium</ProjectButton>
<ProjectButton size="lg">Large</ProjectButton>
<ProjectButton size="xl">Extra Large</ProjectButton>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `"primary" | "secondary" | "outline" | "ghost"` | `"primary"` | The visual variant of the component |
| size | `"sm" | "md" | "lg" | "xl"` | `"md"` | The size of the component |
| className | `string` | - | Additional CSS classes |
| children | `React.ReactNode` | - | The content of the component |

## Accessibility

This component follows WCAG 2.1 AA guidelines:

- ✅ Keyboard navigation support
- ✅ Screen reader compatible
- ✅ High contrast ratios
- ✅ Focus indicators
- ✅ ARIA attributes



## Design Research

Generated with industry best practices and accessibility guidelines.

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Contributing

Please refer to our [contribution guidelines](../../../CONTRIBUTING.md) for information on how to contribute to this component.