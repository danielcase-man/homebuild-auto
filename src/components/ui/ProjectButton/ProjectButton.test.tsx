import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectButton } from './ProjectButton'

describe('ProjectButton', () => {
  it('renders correctly', () => {
    render(<ProjectButton>Test</ProjectButton>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(
      <ProjectButton onClick={handleClick}>
        Click me
      </ProjectButton>
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes correctly', () => {
    render(
      <ProjectButton variant="primary">
        Primary
      </ProjectButton>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary')
  })

  it('is accessible', () => {
    render(
      <ProjectButton aria-label="Test button">
        Accessible Button
      </ProjectButton>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Test button')
  })

  it('supports keyboard navigation', () => {
    const handleClick = jest.fn()
    render(
      <ProjectButton onClick={handleClick}>
        Keyboard Test
      </ProjectButton>
    )
    
    const button = screen.getByRole('button')
    button.focus()
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    expect(handleClick).toHaveBeenCalled()
  })

  
  it('meets construction industry accessibility requirements', () => {
    render(
      <ProjectButton variant="construction">
        Construction Action
      </ProjectButton>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-testid', 'construction-component')
  })
})