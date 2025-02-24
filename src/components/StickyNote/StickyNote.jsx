import React, { useState, useRef, useEffect } from 'react';

const StickyNote = () => {
  // Calculate initial position based on window size
  const calculateInitialPosition = () => ({
    x: window.innerWidth - 620, // Account for note width + padding
    y: window.innerHeight - 550 // Account for note height + padding
  });

  const [position, setPosition] = useState(calculateInitialPosition());
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [text, setText] = useState('Write your note here...');
  const [isEditing, setIsEditing] = useState(false);
  const noteRef = useRef(null);
  const textareaRef = useRef(null);

  // Update position when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (!isDragging) {
        setPosition(calculateInitialPosition());
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDragging]);

  const handleMouseDown = (e) => {
    if (e.target === textareaRef.current) return;
    setIsDragging(true);
    const rect = noteRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = Math.min(Math.max(0, e.clientX - dragOffset.x), window.innerWidth - 500);
      const newY = Math.min(Math.max(0, e.clientY - dragOffset.y), window.innerHeight - 500);
      
      setPosition({
        x: newX,
        y: newY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const stickyNoteStyle = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: '500px',
    minHeight: '500px',
    padding: '20px',
    background: 'linear-gradient(135deg, #ffd86b, #ffc53d)',
    boxShadow: isDragging 
      ? '0 10px 20px rgba(0,0,0,0.3)'
      : '2px 5px 15px rgba(0,0,0,0.2)',
    borderRadius: '2px',
    cursor: isDragging ? 'grabbing' : 'grab',
    transform: `rotate(-2deg)`,
    transition: isDragging ? 'none' : 'all 0.3s ease',
    zIndex: 1000,
    fontFamily: 'Poppins, sans-serif',
    fontSize: '24px',
    lineHeight: '1.5',
    color: '#2c2c2c'
  };

  const headerStyle = {
    width: '100%',
    height: '20px',
    marginBottom: '10px',
    cursor: isDragging ? 'grabbing' : 'grab',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: '2px'
  };

  const textareaStyle = {
    width: '100%',
    minHeight: '450px', // Increased to match note size
    background: 'transparent',
    border: 'none',
    resize: 'none',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '24px',
    lineHeight: '1.5',
    color: '#2c2c2c',
    cursor: 'text',
    outline: 'none',
    padding: '0',
    margin: '0'
  };

  const handleDoubleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <div
      ref={noteRef}
      style={stickyNoteStyle}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div style={headerStyle}></div>
      {isEditing ? (
        <textarea
          ref={textareaRef}
          style={textareaStyle}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div style={{ 
          whiteSpace: 'pre-wrap', 
          cursor: 'text',
          minHeight: '450px' // Match textarea height
        }}>
          {text}
        </div>
      )}
    </div>
  );
};

export default StickyNote;