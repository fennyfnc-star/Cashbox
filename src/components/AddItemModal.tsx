import Modal from "./Modal";
import { BiPencil } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import Button from "./Button";
import type { ModalProps } from "../types/modal";
import "@/styles/addItem.css";
import MediaUploader from "./MediaUploader";
import { usePrizeDrawStore } from "@/stores/PrizeDrawStore";
import FileUploadPrime from "./FileUpload";
import { InputText } from "primereact/inputtext";
import RichTextEditor from "./RichTextEditor";
import { InputSwitch } from "primereact/inputswitch";
import { useState } from "react";

const AddItemModal = ({ open, setOpen }: ModalProps) => {
  const prizeStore = usePrizeDrawStore();
  const [checked, setChecked] = useState(false);

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="flex items-center w-[765px] justify-between p-8">
        <div className="flex gap-4 items-end flex-1">
          <div className="flex flex-col">
            <span className="font-bold text-xl">Add New Item</span>
            <span className="font-semibold text-neutral-400 text-sm">
              Adding a prize draw item
            </span>
          </div>
        </div>
        <IoClose
          size={24}
          className="mr-4 cursor-pointer"
          onClick={() => setOpen(false)}
        />
      </div>
      <hr className="w-full border-b border-slate-100" />

      {/* ============== INPUT FIELDS =============== */}
      <div className="flex flex-col min-h-0 max-h-[70vh] pb-12 overflow-auto">
        <div className="flex gap-2 flex-col px-12 p-4 -mb-4">
          <span className="font-medium">Category</span>
          <select name="" id="" className="input-field ">
            <option value="" className="hidden">
              -- Select Category --
            </option>
            {prizeStore.categories.map((val, idx) => (
              <option key={`${val.slug}-${idx}`} value={val.name}>
                {val.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 flex-col p-4 px-12">
          <span className="font-medium">Item Name</span>
          <input type="text" className="input-field" />
        </div>
        <div className="px-12">
          <FileUploadPrime />
        </div>

        <div className="flex gap-2 flex-col p-4 mx-10">
          <span className="font-medium">Description</span>
          <RichTextEditor />
        </div>

        <div className="flex w-full justify-between items-center px-14 gap-4">
          <div className="flex gap-2 flex-col flex-1">
            <span className="font-medium">Price</span>
            <div className="flex gap-4 input-field">
              <span className="font-bold">$</span>
              <input type="number" className="outline-none border-none" />
            </div>
          </div>
          <div className="flex gap-2 flex-col flex-1">
            <span className="font-medium">Stock Quantity</span>
            <input type="number" className="input-field " />
          </div>
        </div>

        <div className="flex gap-2 flex-col flex-1 mt-4 px-14">
          <span className="font-medium">Amounts of Tickets Required</span>
          <input type="number" className="input-field" placeholder="ex. 500" />
        </div>

        <div className="px-14 mt-4 flex place-content-center">
          <div className="flex justify-between w-full p-4 rounded-3xl items-center border border-neutral-200">
            <div className="flex flex-col">
              <span>Public Visibility</span>
              <span>Make this item visible to all users immediately</span>
            </div>
            <InputSwitch
              checked={checked}
              onChange={(e) => setChecked(e.value)}
            />
          </div>
        </div>
      </div>

      <hr className="w-full border-b border-slate-100" />
      <div className="px-8 py-5 flex gap-4 bg-orange-200 justify-end">
        <Button className="bg-white font-bold">
          <BiPencil />
          <span>Save Draft</span>
        </Button>
        <Button className="bg-orange-400 text-white font-bold rounded" onClick={() => setOpen(false)}>
          <span>Make Live</span>
        </Button>
      </div>
    </Modal>
  );
};

export default AddItemModal;
