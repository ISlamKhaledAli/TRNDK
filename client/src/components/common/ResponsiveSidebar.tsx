/**
 * client/src/components/common/ResponsiveSidebar.tsx
 *
 * Wrapper component for responsive sidebar behavior.
 * Handles mobile overlay, backdrop, keyboard accessibility, and RTL support.
 * Works with both AdminSidebar and ClientSidebar.
 */

import React, { useEffect, useRef } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { X } from "lucide-react";

interface ResponsiveSidebarProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

const ResponsiveSidebar = ({
  children,
  isAdmin = false,
}: ResponsiveSidebarProps) => {
  const { isOpen, closeSidebar, isMobile } = useSidebar();
  const { language } = useLanguage();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isRTL = language === "ar";

  // Handle clicks outside sidebar to close it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        if (isOpen && isMobile) {
          closeSidebar();
        }
      }
    };

    if (isOpen && isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, isMobile, closeSidebar]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && isMobile && sidebarRef.current) {
      // Store previously focused element
      const previousActiveElement = document.activeElement as HTMLElement;

      // Focus first focusable element in sidebar
      const focusableElements = sidebarRef.current.querySelectorAll(
        "a, button, [tabindex]:not([tabindex='-1'])"
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }

      // Restore focus when closed
      return () => {
        if (previousActiveElement && previousActiveElement.focus) {
          previousActiveElement.focus();
        }
      };
    }
  }, [isOpen, isMobile]);

  // On desktop, always show sidebar and don't apply mobile styles
  if (!isMobile) {
    return (
      <div ref={sidebarRef} className="sidebar-desktop">
        {children}
      </div>
    );
  }

  // On mobile, apply responsive behavior with overlay and backdrop
  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeSidebar}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        ref={sidebarRef}
        className={`sidebar-mobile ${
          isOpen ? "sidebar-open" : "sidebar-closed"
        } ${isRTL ? "sidebar-rtl" : "sidebar-ltr"}`}
        role="navigation"
        aria-label={isAdmin ? "Admin Navigation" : "Client Navigation"}
        aria-hidden={!isOpen && isMobile}
      >
        {/* Close button for mobile */}
        <button
          onClick={closeSidebar}
          className="sidebar-close-btn"
          aria-label="Close navigation menu"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        {children}
      </div>
    </>
  );
};

export default ResponsiveSidebar;
