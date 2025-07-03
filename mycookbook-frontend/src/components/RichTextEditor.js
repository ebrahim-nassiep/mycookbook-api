import React, { useState, useRef } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = "Enter text...", height = "200px" }) => {
  const [editorValue, setEditorValue] = useState(value || '');
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const content = e.target.value;
    setEditorValue(content);
    if (onChange) {
      onChange(content);
    }
  };

  const insertText = (before, after = '') => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorValue.substring(start, end);
    const newText = editorValue.substring(0, start) + before + selectedText + after + editorValue.substring(end);
    
    setEditorValue(newText);
    if (onChange) {
      onChange(newText);
    }
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const formatButtons = [
    { label: 'B', action: () => insertText('**', '**'), title: 'Bold' },
    { label: 'I', action: () => insertText('*', '*'), title: 'Italic' },
    { label: 'H1', action: () => insertText('# '), title: 'Heading 1' },
    { label: 'H2', action: () => insertText('## '), title: 'Heading 2' },
    { label: '•', action: () => insertText('- '), title: 'Bullet List' },
    { label: '1.', action: () => insertText('1. '), title: 'Numbered List' },
  ];

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        {formatButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            className="format-btn"
            onClick={button.action}
            title={button.title}
          >
            {button.label}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={editorValue}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ height, minHeight: height }}
        className="rich-textarea"
      />
      <div className="format-help">
        <small>
          Use **bold**, *italic*, # Heading 1, ## Heading 2, - bullet lists, 1. numbered lists
        </small>
      </div>
    </div>
  );
};

export default RichTextEditor;