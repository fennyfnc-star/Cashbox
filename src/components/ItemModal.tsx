import Modal from "./Modal";
import "@/styles/loaders.css";
import { BiPauseCircle, BiPencil, BiTrash } from "react-icons/bi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import Button from "./Button";
import { RxLightningBolt } from "react-icons/rx";
import type { ModalProps } from "../types/modal";
import itemImage from "@/assets/images/plane.jpg";
import type { PrizeDrawNode } from "@/types/graphql";
import { MdWarning } from "react-icons/md";
import { useEffect, useState } from "react";
import { wpgraphql } from "@/utils/graphql";
import { usePrizeDrawStore } from "@/stores/PrizeDrawStore";
import Swal from "sweetalert2";

const ItemModal = ({
  open,
  setOpen,
  item,
}: ModalProps & { item: PrizeDrawNode }) => {
  const [drawItem, setDrawItem] = useState(item);
  const prizeStore = usePrizeDrawStore();
  const [loading, setLoading] = useState(false);

  const details = item.prizeItemsManagement;
  const imgUrl = details?.itemImage?.node.sourceUrl;

  useEffect(() => {
    setDrawItem(item)
  }, [item])

  const changeItemStatus = async (isLive: boolean) => {
    setLoading(true);
    try {
      await wpgraphql.UpdateStatus(item.id, isLive);

      prizeStore.updateDrawItems().then(() => {
        setDrawItem({
          ...drawItem,
          prizeItemsManagement: {
            ...drawItem.prizeItemsManagement,
            itemStatus: isLive, // new status
          },
        });

        setLoading(false);
      });
    } catch (e) {
      console.log("error here");
      setLoading(false);
    } finally {
    }
  };

  const confirmDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await wpgraphql.DeletePrizeDrawItem(item.id);

          console.log("delete response", response);
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
          });
          prizeStore.updateDrawItems().then(() => {
            setLoading(false);
            setOpen(false);
          });
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "Something went wrong when deleting this item.",
            icon: "error",
          });
          setLoading(false);
        }
      }
    });
  };

  return (
    <Modal open={open} setOpen={setOpen} loading={loading}>
      <div className="flex items-center justify-between p-8">
        <div className="flex gap-4 items-end  flex-1">
          <span className="font-bold text-xl">Manage Item</span>
          {/* ITEM STATUS MODAL HEADER */}
          {drawItem.prizeItemsManagement.itemStatus ? (
            <div className="flex items-center justify-center px-3 py-1 rounded-full gap-2 bg-green-200 text-green-700">
              <div className="bg-green-700 rounded-full p-1 "></div>
              <span className="uppercase font-semibold text-sm">Live</span>
            </div>
          ) : (
            <div className="flex items-center justify-center px-3 py-1 rounded-full gap-2 bg-amber-200 text-amber-700">
              <div className="bg-amber-700 rounded-full p-1 "></div>
              <span className="uppercase font-semibold text-sm">Suspended</span>
            </div>
          )}
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
            src={imgUrl || itemImage}
            className="h-[300px] w-[350px] object-contain object-center"
            alt=""
          />
          {drawItem.prizeItemsManagement.itemStatus ? (
            <div className="text-green-700! flex items-center p-2 justify-center font-medium gap-2 text-sm bg-green-100 rounded-sm border border-green-300">
              <IoMdCheckmarkCircleOutline size={18} />
              <span>
                This item is currently <span className="uppercase">live</span>
              </span>
            </div>
          ) : (
            <div className="text-amber-700! flex items-center p-2 justify-center font-medium gap-2 text-sm bg-amber-100 rounded-sm border border-amber-300">
              <MdWarning size={18} />
              <span>
                This item is currently{" "}
                <span className="uppercase">suspended</span>
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col w-[400px] gap-8">
          <div className="flex gap flex-col gap-1">
            <span className="uppercase text-xs text-neutral-400 font-semibold">
              Product Heading
            </span>
            <span className="text-xl font-semibold">{item.title}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="uppercase text-xs text-neutral-400 font-semibold">
              Description
            </span>
            <div className="text-wrap text-neutral-400 text-[15px]">
              <div
                dangerouslySetInnerHTML={{ __html: details.itemDescription }}
              />
            </div>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-1">
              <span className="uppercase text-xs text-neutral-400 font-semibold">
                Listed Price
              </span>
              <span className="text-orange-400 font-bold text-2xl">
                ${new Intl.NumberFormat().format(Number(details.price))}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="uppercase text-xs text-neutral-400 font-semibold">
                Tickets Required
              </span>
              <span className=" font-bold text-2xl">
                {new Intl.NumberFormat().format(Number(details.tickets))}
              </span>
            </div>
          </div>
        </div>
      </div>
      <hr className="w-full border-b border-slate-100" />
      <div className="px-8 py-5 flex gap-4">
        <Button
          className="border-red-400 border text-red-500"
          onClick={confirmDelete}
        >
          <BiTrash />
          <span>Remove</span>
        </Button>
        <Button
          className={`border border-neutral-300 ${!drawItem.prizeItemsManagement.itemStatus && "opacity-50 cursor-not-allowed!"}`}
          disabled={!drawItem.prizeItemsManagement.itemStatus}
          onClick={() => {
            changeItemStatus(false);
          }}
        >
          <BiPauseCircle />
          <span>Suspend</span>
        </Button>
        <Button className="bg-amber-500 text-white">
          <BiPencil />
          <span>Edit Details</span>
        </Button>
        <Button
          className={`bg-green-100 border border-green-300 text-green-700 ${drawItem.prizeItemsManagement.itemStatus && "opacity-50 cursor-not-allowed!"}`}
          disabled={drawItem.prizeItemsManagement.itemStatus}
          onClick={() => {
            changeItemStatus(true);
          }}
        >
          <RxLightningBolt />
          <span>Make Live</span>
        </Button>
        <Button className="bg-neutral-100" onClick={() => setOpen(false)}>
          <span>Close</span>
        </Button>
      </div>
    </Modal>
  );
};

export default ItemModal;
