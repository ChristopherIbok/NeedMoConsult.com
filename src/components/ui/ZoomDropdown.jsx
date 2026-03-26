import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronUp, ChevronDown, Check } from "lucide-react";

const POSITION_BUFFER = 8;

function getDropDirection(buttonRect, dropdownRect, viewportHeight, viewportWidth) {
  const spaceBelow = viewportHeight - buttonRect.bottom;
  const spaceAbove = buttonRect.top;
  const spaceRight = viewportWidth - buttonRect.right;
  const spaceLeft = buttonRect.left;

  let vertical = "bottom";
  let horizontal = "left";

  if (spaceBelow >= dropdownRect.height + POSITION_BUFFER) {
    vertical = "bottom";
  } else if (spaceAbove >= dropdownRect.height + POSITION_BUFFER) {
    vertical = "top";
  } else if (spaceBelow >= spaceAbove) {
    vertical = "bottom";
  } else {
    vertical = "top";
  }

  if (dropdownRect.width <= spaceRight) {
    horizontal = "left";
  } else if (dropdownRect.width <= spaceLeft) {
    horizontal = "right";
  } else if (spaceRight >= spaceLeft) {
    horizontal = "left";
  } else {
    horizontal = "right";
  }

  return { vertical, horizontal };
}

function DropdownArrow({ vertical, horizontal, color = "#1A2332" }) {
  const style = {
    position: "absolute",
    width: 0,
    height: 0,
    borderLeft: "6px solid transparent",
    borderRight: "6px solid transparent",
  };

  if (vertical === "bottom") {
    style.borderBottom = `6px solid ${color}`;
    style.top = -6;
  } else {
    style.borderTop = `6px solid ${color}`;
    style.bottom = -6;
  }

  if (horizontal === "right") {
    style.right = 16;
  } else {
    style.left = 16;
  }

  return <div style={style} />;
}

export function ZoomDropdown({
  trigger,
  children,
  isOpen,
  onOpenChange,
  align = "center",
  className = "",
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [dropDirection, setDropDirection] = useState({ vertical: "bottom", horizontal: "left" });
  const [dropdownSize, setDropdownSize] = useState({ width: 0, height: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !dropdownRef.current || !isOpen) return;

    const buttonRect = triggerRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const direction = getDropDirection(buttonRect, dropdownRect, viewportHeight, viewportWidth);
    setDropDirection(direction);

    let top, left;

    if (direction.vertical === "bottom") {
      top = buttonRect.bottom + POSITION_BUFFER;
    } else {
      top = buttonRect.top - dropdownRect.height - POSITION_BUFFER;
    }

    if (direction.horizontal === "right") {
      left = buttonRect.right - dropdownRect.width;
    } else {
      left = buttonRect.left;
    }

    if (align === "center") {
      left = buttonRect.left + (buttonRect.width - dropdownRect.width) / 2;
    } else if (align === "right") {
      left = buttonRect.right - dropdownRect.width;
    }

    setPosition({ top: Math.max(4, top), left: Math.max(4, left) });
  }, [isOpen, align]);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updatePosition);
    });

    if (dropdownRef.current) {
      resizeObserver.observe(dropdownRef.current);
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !triggerRef.current?.contains(e.target)
      ) {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDropdownSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(dropdownRef.current);

    return () => observer.disconnect();
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <div ref={triggerRef} onClick={() => onOpenChange(!isOpen)}>
        {trigger}
      </div>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className={`fixed z-[100] min-w-[200px] bg-white dark:bg-[#1A2332] rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${className}`}
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <DropdownArrow 
            vertical={dropDirection.vertical} 
            horizontal={dropDirection.horizontal}
            color="rgb(26 35 50)"
          />
          {children}
        </div>,
        document.body
      )}
    </div>
  );
}

export function DropdownMenu({ children, className = "" }) {
  return <div className={`py-1 ${className}`}>{children}</div>;
}

export function DropdownItem({
  children,
  onClick,
  disabled = false,
  active = false,
  icon,
  danger = false,
  className = "",
}) {
  const handleClick = (e) => {
    if (disabled) return;
    onClick?.(e);
  };

  const IconComponent = icon;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors
        ${disabled 
          ? "opacity-50 cursor-not-allowed text-gray-400" 
          : danger
            ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
        }
        ${active ? "bg-[#D4AF7A]/10 text-[#D4AF7A]" : ""}
        ${className}
      `}
    >
      {IconComponent && <IconComponent className="w-4 h-4 shrink-0" />}
      <span className="flex-1">{children}</span>
    </button>
  );
}

export function DropdownDivider() {
  return <div className="h-px bg-gray-200 dark:bg-white/10 my-1" />;
}

export function DropdownLabel({ children, className = "" }) {
  return (
    <div className={`px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${className}`}>
      {children}
    </div>
  );
}

export function DropdownToggle({
  checked,
  onChange,
  label,
  disabled = false,
}) {
  return (
    <label className={`
      flex items-center justify-between gap-3 px-3 py-2 cursor-pointer
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    `}>
      <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`
          w-10 h-5 rounded-full transition-colors relative shrink-0
          ${checked ? "bg-[#D4AF7A]" : "bg-gray-300 dark:bg-gray-600"}
        `}
      >
        <div
          className={`
            absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
            ${checked ? "left-5 translate-x-0.5" : "left-0.5"}
          `}
        />
      </div>
    </label>
  );
}

export function useDropdownKeyboardNav(isOpen, onClose, itemsLength) {
  const activeIndex = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      activeIndex.current = 0;
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex.current = (activeIndex.current + 1) % itemsLength;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex.current = (activeIndex.current - 1 + itemsLength) % itemsLength;
      } else if (e.key === "Enter") {
        e.preventDefault();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, itemsLength]);

  return activeIndex;
}
