# Testing Documentation

This document describes how to run tests for the Horse Racing application.

## Overview

The application includes comprehensive testing with:
- **Unit Tests**: Using Vitest and Vue Test Utils
- **E2E Tests**: Using Playwright
- **Component Tests**: Testing individual Vue components
- **Store Tests**: Testing Vuex store logic

## Prerequisites

Make sure you have Node.js installed and all dependencies installed:

```bash
npm install
```

## Unit Tests

### Running Unit Tests

```bash
# Run tests in watch mode (recommended for development)
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Unit Test Structure

```
src/
├── components/__tests__/
│   ├── Controls.test.js      # Tests for Controls component
│   ├── HorseList.test.js     # Tests for HorseList component
│   ├── RaceTrack.test.js     # Tests for RaceTrack component
│   └── Results.test.js       # Tests for Results component
├── store/__tests__/
│   └── index.test.js         # Tests for Vuex store
└── test/
    └── setup.js              # Test setup and mocks
```

### What Unit Tests Cover

#### Store Tests (`src/store/__tests__/index.test.js`)
- State management
- Getters and computed properties
- Mutations and actions
- Helper functions
- Edge cases and error handling

#### Component Tests
- **Controls.test.js**: Button states, user interactions, computed properties
- **RaceTrack.test.js**: Track rendering, horse positioning, progress display
- **HorseList.test.js**: Horse grid display, data mapping
- **Results.test.js**: Results rendering, podium display, placements

### Unit Test Features

- **Mocked Store**: Each test creates isolated store instances
- **Component Isolation**: Components are tested independently
- **Comprehensive Coverage**: Tests cover all major functionality
- **Edge Case Testing**: Handles error conditions gracefully

## E2E Tests

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug
```

### E2E Test Structure

```
tests/
└── e2e/
    └── horse-race.spec.js    # Main E2E test suite
```

### What E2E Tests Cover

#### Application Workflow
1. **Initial State**: Page loading, component visibility
2. **Horse Initialization**: Creating and displaying horses
3. **Schedule Generation**: Creating race schedules
4. **Race Execution**: Starting and running races
5. **Results Display**: Showing race results and podium
6. **Reset Functionality**: Resetting application state

#### User Interactions
- Button clicks and state changes
- Form interactions
- Navigation and routing
- Responsive design testing

#### Edge Cases
- Rapid button clicks
- Race interruption
- Error handling
- Mobile responsiveness

### E2E Test Features

- **Cross-browser Testing**: Tests run on Chromium, Firefox, and WebKit
- **Responsive Testing**: Tests mobile and desktop viewports
- **Real Browser Environment**: Tests actual DOM manipulation
- **Visual Testing**: Verifies UI elements and layouts

## Test Configuration

### Vitest Configuration (`vitest.config.js`)
- Vue plugin support
- JSDOM environment for DOM testing
- Global test setup

### Playwright Configuration (`playwright.config.js`)
- Multiple browser support
- Parallel test execution
- Automatic dev server startup
- HTML reporting

### Test Setup (`src/test/setup.js`)
- Performance API mocking
- Browser API mocking
- Consistent test environment

## Writing New Tests

### Adding Unit Tests

1. Create test file in appropriate `__tests__` directory
2. Import component and test utilities
3. Create mock store if needed
4. Write test cases covering functionality
5. Run tests to ensure they pass

Example:
```javascript
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import MyComponent from '../MyComponent.vue'

describe('MyComponent', () => {
  let store
  let wrapper

  beforeEach(() => {
    store = createStore({
      state: { /* mock state */ },
      getters: { /* mock getters */ }
    })
    wrapper = mount(MyComponent, {
      global: { plugins: [store] }
    })
  })

  it('should render correctly', () => {
    expect(wrapper.find('.my-class').exists()).toBe(true)
  })
})
```

### Adding E2E Tests

1. Add test to existing spec file or create new one
2. Use Playwright's page object model
3. Write descriptive test names
4. Include proper assertions and waits

Example:
```javascript
test('should display user profile', async ({ page }) => {
  await page.goto('/profile')
  await expect(page.locator('.profile-name')).toBeVisible()
  await expect(page.locator('.profile-email')).toContainText('user@example.com')
})
```

## Test Best Practices

### Unit Tests
- Test one thing at a time
- Use descriptive test names
- Mock external dependencies
- Test edge cases and error conditions
- Keep tests fast and isolated

### E2E Tests
- Test complete user workflows
- Use data-testid attributes for reliable selectors
- Include proper waits and assertions
- Test across different viewport sizes
- Keep tests independent and repeatable

### General
- Write tests before or alongside code (TDD)
- Maintain high test coverage
- Keep tests readable and maintainable
- Use consistent naming conventions
- Document complex test scenarios

## Troubleshooting

### Common Issues

#### Unit Tests
- **Import errors**: Check file paths and module resolution
- **Mock issues**: Ensure proper mocking of browser APIs
- **Store errors**: Verify store configuration and state

#### E2E Tests
- **Selector failures**: Use reliable selectors like data-testid
- **Timing issues**: Add proper waits and assertions
- **Browser issues**: Check Playwright installation and configuration

### Debugging

#### Unit Tests
```bash
# Run specific test file
npm run test:run src/components/__tests__/MyComponent.test.js

# Run tests with verbose output
npm run test:run -- --reporter=verbose
```

#### E2E Tests
```bash
# Run tests in debug mode
npm run test:e2e:debug

# Run specific test
npm run test:e2e -- --grep "test name"
```

## Continuous Integration

The test suite is designed to work in CI environments:

- Unit tests run quickly and provide immediate feedback
- E2E tests verify complete application functionality
- Tests are isolated and can run in parallel
- Coverage reports help maintain code quality

## Performance

- **Unit Tests**: Run in milliseconds, suitable for pre-commit hooks
- **E2E Tests**: Run in seconds, suitable for CI/CD pipelines
- **Parallel Execution**: E2E tests run in parallel for faster feedback

## Coverage Goals

- **Unit Tests**: Aim for >90% code coverage
- **E2E Tests**: Cover all major user workflows
- **Component Tests**: Test all Vue components thoroughly
- **Store Tests**: Test all mutations, actions, and getters
