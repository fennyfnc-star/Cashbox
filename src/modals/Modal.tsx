import type { PropsWithChildren } from "react";
import type { ModalProps } from "../types/modal.types";

const Modal = ({
  children,
  open,
  setOpen,
  loading = false,
  loadingMsg = "Updating",
}: PropsWithChildren & ModalProps) => {
  const closeModal = () => {
    setOpen(false);
  };

  if (!open) return;

  return (
    <div className="absolute z-999 top-0 left-0 w-screen h-screen flex items-center justify-center">
      <div
        id="background"
        onClick={closeModal}
        className="absolute w-full h-full bg-black/60"
      ></div>
      <div
        className="relative flex flex-col rounded-2xl overflow-hidden min-w-[700px] bg-white z-10 "
        id="modal"
      >
        {loading && (
          <div className="absolute w-full h-full z-20 bg-neutral-500/50 backdrop-blur-xs gap-4 flex-col top-0 left-0 flex items-center justify-center">
            <span className="spinloader"></span>
            <span className="text-white font-bold">{loadingMsg}..</span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
