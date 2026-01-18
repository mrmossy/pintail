# Chat Widget

A lightweight, embeddable chat widget created by Next Rhythm that integrates with the chat backend. The widget provides a floating chat interface that can be embedded on any website for any client.

## Overview

The chat widget consists of two files:

- **chat_widget_embed.js** - The main widget implementation with UI styling and functionality
- **chat_widget_loader.js** - Example HTML snippet showing how to embed the widget

## Installation

### Basic Usage

Add a single `<script>` tag to your HTML file where you want the chat widget to appear:

```html
<script
  data-nr-chat
  data-api-base="https://your-chat-api.com"
  data-title="Your Chat Title"
  data-subtitle="Your Chat Subtitle"
  data-welcome="Your Welcome Message"
  data-launcher-text="Button Text"
  src="/path/to/chat-widget.js"
></script>
```

## Configuration

The widget can be configured using data attributes on the script tag or via the `window.NRChatWidget` global object.

### Configuration Options

| Option | Data Attribute | Description | Default |
|--------|-----------------|-------------|---------|
| `apiBase` | `data-api-base` | Base URL for the chat API | `https://chat.nextrhythm.ai` |
| `title` | `data-title` | Chat panel title | `Chat Assistant` |
| `subtitle` | `data-subtitle` | Chat panel subtitle | `Ask a property question or start a request.` |
| `welcome` | `data-welcome` | Initial welcome message | `Hi there. How can we help today?` |
| `launcherText` | `data-launcher-text` | Text on the launcher button | `Chat with Assistant` |

### Configuration Methods

#### Method 1: Data Attributes (Recommended)

```html
<script
  data-nr-chat
  data-api-base="https://your-chat-api.com"
  data-title="Customer Support Chat"
  data-subtitle="What can we help you with?"
  data-welcome="Hi there. How can we help today?"
  data-launcher-text="Chat with Us"
  src="https://your-cdn.com/chat-widget.js"
></script>
```

#### Method 2: JavaScript Object

```html
<script>
  window.NRChatWidget = {
    apiBase: "https://your-chat-api.com",
    title: "Customer Support Chat",
    subtitle: "What can we help you with?",
    welcome: "Hi there. How can we help today?",
    launcherText: "Chat with Us"
  };
</script>
<script data-nr-chat src="https://your-cdn.com/chat-widget.js"></script>
```

## Features

- **Floating Chat Interface** - Fixed position chat bubble that appears on the bottom-right
- **Customizable Styling** - Green theme (forest, mint, and gold colors) with responsive design
- **Mobile Responsive** - Adapts to different screen sizes
- **Smooth Animations** - Elegant opening/closing animations
- **Persistent Configuration** - Load configuration once on page init

## Design

The widget uses a modern design system with:

- **Color Palette**:
  - Forest Green (`#0c3b2e`) - Primary color
  - Mint (`#cfe9d9`) - Accent
  - Gold (`#c8a45b`) - Highlights
  - Sand (`#f5f0e6`) - Background
  
- **Typography**: Space Grotesk font family
- **Layout**: Fixed position on bottom-right with 520px height, responsive width
- **Z-index**: 9999 to ensure visibility above other elements

## Browser Support

The widget supports all modern browsers that support:
- ES6+ JavaScript
- CSS Grid/Flexbox
- CSS Custom Properties (variables)
- Server-Sent Events (SSE) for chat streaming

## Integration Examples

### WordPress

```html
<script>
  window.NRChatWidget = {
    apiBase: "https://your-chat-api.com",
    title: "Support Chat",
    launcherText: "Need Help?"
  };
</script>
<script data-nr-chat src="/wp-content/uploads/js/chat-widget.js"></script>
```

### Static Website

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome</h1>
  
  <!-- Chat widget -->
  <script
    data-nr-chat
    data-api-base="https://api.example.com/chat"
    data-title="Customer Support"
    src="https://cdn.example.com/chat-widget.js"
  ></script>
</body>
</html>
```

## Deployment

1. Build or minify `chat_widget_embed.js` as needed
2. Deploy to a CDN or static hosting
3. Update the `src` URL in the embed script tag
4. Ensure the API base URL points to your chat backend service

## API Integration

The widget communicates with a chat backend API at the specified `apiBase` URL. The API should handle:

- Chat message submission
- Server-Sent Events (SSE) for streaming responses
- Conversation history management

For API documentation, see the [Chat Backend README](../README.md).

## Troubleshooting

### Widget Not Appearing

- Check that the script `src` URL is correct and accessible
- Verify the `data-nr-chat` attribute is present on the script tag
- Check browser console for JavaScript errors
- Ensure there are no CSS z-index conflicts on your page

### API Connection Issues

- Verify the `data-api-base` URL is correct
- Check browser console network tab for failed requests
- Ensure the chat backend service is running and accessible
- Check CORS settings if API is on a different domain

### Styling Issues

- Ensure fonts can load from Google Fonts CDN
- Check for CSS conflicts with your page's stylesheets
- Verify the widget's z-index isn't being overridden

## Development

To modify the widget:

1. Edit `chat_widget_embed.js` to make changes
2. Test locally by creating an HTML file with the embed code
3. Update `chat_widget_loader.js` with example configuration if needed
4. Rebuild/redeploy as part of your deployment process
