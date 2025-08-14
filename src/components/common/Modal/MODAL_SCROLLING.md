# Modal Scrolling Behavior

The Modal component has been enhanced to properly handle content that exceeds the viewport height.

## Features

### ✅ **Fixed Header & Footer**
- Modal header (title + close button) remains fixed at the top
- Modal footer (action buttons) remains fixed at the bottom
- Only the content area scrolls

### ✅ **Responsive Design**
- **Desktop**: Modal centers with padding, max-height respects viewport
- **Mobile**: Modal takes more space with minimal padding for better usability
- **Scrollable**: Automatic scrollbars when content overflows

### ✅ **Enhanced UX**
- Custom styled scrollbars for better visual consistency
- Smooth scrolling behavior
- Keyboard navigation preserved within scrollable content
- Focus management works properly with scrolling

## Usage Examples

### Small Content (No Scrolling Needed)
```jsx
<Modal isOpen={true} onClose={onClose} title="Simple Modal">
  <p>Short content that fits in viewport</p>
</Modal>
```

### Large Content (Automatic Scrolling)
```jsx
<Modal 
  isOpen={true} 
  onClose={onClose} 
  title="Large Content Modal"
  size="xl"
  footer={<ActionButtons />}
>
  <div>
    {/* Long form or content that exceeds viewport height */}
    {/* Content area will scroll while header/footer stay fixed */}
  </div>
</Modal>
```

## Technical Details

### CSS Classes Applied
- **Overlay**: `overflow-y-auto modal-scroll` for outer scrolling
- **Modal Container**: `max-h-[calc(100vh-4rem)] flex flex-col` for height constraints
- **Content Area**: `overflow-y-auto flex-1 min-h-0 modal-scroll` for inner scrolling

### Mobile Responsiveness
- Padding reduces from `p-4` to `p-2` on mobile
- Max height adjusts from `calc(100vh-4rem)` to `calc(100vh-1rem)` on mobile
- Margin reduces from `my-8` to `my-2` on mobile

### Browser Support
- Works with all modern browsers
- Custom scrollbar styling for Webkit browsers (Chrome, Safari, Edge)
- Fallback scrollbar styling for Firefox
- Graceful degradation for older browsers

## Common Use Cases

1. **Long Forms** (Invitation Form, User Forms)
2. **Data Details** (Visitor Details, Report Views)  
3. **Settings Panels** (Configuration Modals)
4. **Content Viewers** (Document Previews, Image Galleries)

The modal automatically handles all scrolling scenarios without requiring any additional configuration from developers.
