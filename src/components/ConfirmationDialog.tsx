import { Dialog } from "@headlessui/react";
import React from "react";
import { Button } from "./Button";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText: string;
  confirmButtonColor?: string;
  cancelButtonText?: string;
  icon?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText,
  confirmButtonColor = "bg-lime hover:bg-lime/90",
  cancelButtonText = "Cancel",
  icon,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-darkgray border border-lime/30 p-6">
          <div className="flex flex-col items-center text-center">
            {icon && <div className="mb-4">{icon}</div>}
            <Dialog.Title className="text-xl font-semibold text-white mb-2">
              {title}
            </Dialog.Title>
            <Dialog.Description className="text-gray-300 mb-6">
              {message}
            </Dialog.Description>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
            >
              {cancelButtonText}
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 ${confirmButtonColor} text-black`}
            >
              {confirmButtonText}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ConfirmationDialog;
