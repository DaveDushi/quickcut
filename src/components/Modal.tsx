import { FullscreenOverlay } from "./FullscreenOverlay";

type ModalSize = "sm" | "md" | "lg";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  size?: ModalSize;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({
  isOpen,
  onClose,
  children,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  size = "sm",
  ariaLabel,
  ariaLabelledBy,
}: ModalProps) {
  return (
    <FullscreenOverlay
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdropClick={closeOnBackdropClick}
      closeOnEscape={closeOnEscape}
      ariaLabel={ariaLabel}
      ariaLabelledBy={ariaLabelledBy}
      className="bg-[#1a1a1a]/40 backdrop-blur-md"
      contentClassName={`relative m-4 w-full ${SIZE_CLASS[size]} rounded-[20px] border-[1.5px] border-border-default bg-white p-6 shadow-[0_2px_40px_-12px_rgba(180,145,143,0.25)]`}
    >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-cream hover:text-text-primary"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        {children}
    </FullscreenOverlay>
  );
}
