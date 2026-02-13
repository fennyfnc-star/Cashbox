import Modal from "./Modal";
import { BiPencil } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import Button from "./Button";
import type { ModalProps } from "../types/modal";
import itemImage from "@/assets/images/plane.jpg";
import MediaUploader from "./MediaUploader";

const AddItemModal = ({ open, setOpen }: ModalProps) => {
  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="flex items-center justify-between p-8">
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
      <hr className="w-full border-b border-slate-100 mb-6" />
      <div className="flex px-8 pb-8 gap-8">
        <div className="flex flex-col gap-4">
          <img
            src={itemImage}
            className="h-[300px] w-[350px] object-cover object-center"
            alt=""
          />
        </div>
        <div className="flex flex-col w-[400px] gap-8">
          <div className="flex gap flex-col gap-1">
            <span className="uppercase text-xs text-neutral-400 font-semibold">
              Product Heading
            </span>

            <input
              type="text"
              name=""
              id=""
              placeholder="Enter Item name"
              className="border-blue-400 border rounded-lg py-2 outline-blue-500 px-4"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="uppercase text-xs text-neutral-400 font-semibold">
              Description
            </span>
            <textarea
              placeholder="Tell us something about this item."
              cols={8}
              rows={5}
              className="border-blue-400 border rounded-lg outline-blue-500 p-2 text-sm"
            ></textarea>
            
          <MediaUploader />
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-1 ">
              <span className="uppercase text-xs text-neutral-400 font-semibold">
                Listed Price
              </span>
              <div className="flex gap-2">
                <span className="text-orange-400 font-bold text-2xl">$</span>{" "}
                <input
                  type="number"
                  placeholder="ex. 8000"
                  className="border rounded-lg outline-blue-500 py-1 px-2 w-40 border-blue-400"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="uppercase text-xs text-neutral-400 font-semibold">
                Tickets Required
              </span>
              <input
                type="number"
                placeholder="ex.1000"
                className="border rounded-lg outline-blue-500 py-1 px-2 w-40 border-blue-400"
              />
            </div>
          </div>
        </div>
      </div>
      <hr className="w-full border-b border-slate-100" />
      <div className="px-8 py-5 flex gap-4 justify-end">
        <Button className="bg-green-100 border border-green-300 text-green-700">
          <BiPencil />
          <span>Create</span>
        </Button>
        <Button className="bg-neutral-100" onClick={() => setOpen(false)}>
          <span>Close</span>
        </Button>
      </div>
    </Modal>
  );
};

export default AddItemModal;
