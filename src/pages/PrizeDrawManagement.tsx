import { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { FiPlus } from "react-icons/fi";
import ItemModal from "@/components/ItemModal";
import AddItemModal from "@/components/AddItemModal";
import itemImage from "@/assets/images/plane.jpg";
import type { PrizeDrawNode } from "@/types/graphql";
import { usePrizeDrawStore } from "@/stores/PrizeDrawStore";
import { useLocation, useSearchParams } from "react-router-dom";
import CircleLoader from "@/components/CircleLoader";
import { wpgraphql } from "@/utils/graphql";

const PrizeDrawManagement = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSeletecItem] = useState<PrizeDrawNode | undefined>();
  const location = useLocation();
  const [searchParams, _] = useSearchParams();

  const prizeStore = usePrizeDrawStore();

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      const search = searchParams.get("category");
      await prizeStore.updatePrizeCategories();
      prizeStore.updateDrawItems(search).then(() => {
        setLoading(false);
      });
    }

    fetchItems();
  }, [location.search]);

  const openItemModal = (item: PrizeDrawNode) => {
    console.log("selected Item: ", item);
    setSeletecItem(item);
    setOpen(true);
  };

  async function fireRest() {
    await wpgraphql.fethcRest();
  }

  useEffect(() => {
    fireRest();
  }, []);

  return (
    <MainLayout>
      <AddItemModal open={openAdd} setOpen={setOpenAdd} />

      {selectedItem && (
        <ItemModal open={open} setOpen={setOpen} item={selectedItem} />
      )}
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col md:flex-row gap-4 pb-6 border-b border-neutral-200 bg-white sticky top-8 justify-between w-full">
          <div className="flex flex-col gap-2 flex-1">
            <span className="text-2xl font-bold">Prize Draw Management</span>
            <span className="text-sm text-neutral-400">
              Manage your listings, prieces, and tickets.
            </span>

            <span className="mt-4 text-neutral-400">
              Prize Draw Management{" "}
              {searchParams.get("category") && (
                <span>
                  / Categories /{" "}
                  <strong className="text-[#333]">
                    {searchParams.get("category")}
                  </strong>
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-end items-start">
            <button
              onClick={() => {
                setOpenAdd(true);
              }}
              className="rounded-lg flex gap-2 items-center justify-center px-4 py-2 bg-orange-400 text-white cursor-pointer font-semibold"
            >
              <FiPlus /> <span>Add New Item</span>
            </button>
          </div>
        </div>

        <div className="flex flex-1 " id="side_nav">
          {loading ? (
            <div className="w-full h-120 flex items-center! justify-center!">
              <CircleLoader />
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 min-h-0 items-center">
              {prizeStore.drawItems
                ? prizeStore.drawItems.length > 0
                  ? prizeStore.drawItems.map((item, index) => {
                      const details = item.prizeItemsManagement;
                      const imgUrl = details?.itemImage?.node.sourceUrl;

                      return (
                        <div
                          key={`${item.id}-${index}`}
                          onClick={() => openItemModal(item)}
                          className="cursor-pointer 2xl:w-120 w-80 rounded-xl overflow-hidden border border-slate-200"
                        >
                          <img
                            src={imgUrl || itemImage}
                            className="object-contain h-62 w-full"
                            alt=""
                          />
                          <div className="flex flex-col items-start p-4">
                            <span className="text-xl font-bold">
                              {item.title}
                            </span>
                            <div className="flex items-center justify-between w-full font-semibold text-neutral-400/80">
                              <span>
                                {" "}
                                $
                                {new Intl.NumberFormat().format(
                                  Number(details.price),
                                )}
                              </span>
                              <span>
                                {" "}
                                {new Intl.NumberFormat().format(
                                  Number(details.tickets),
                                )}{" "}
                                Tickets
                              </span>
                            </div>

                            {details.itemStatus ? (
                              <span className="px-2 py-1 mt-4 text-[10px] font-bold rounded-md bg-green-200 text-green-900 uppercase">
                                Live Now
                              </span>
                            ) : (
                              <span className="px-2 py-1 mt-4 text-[10px] font-bold rounded-md bg-amber-200 text-amber-900 uppercase">
                                Suspended
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  : "Found 0 Results"
                : "No items found"}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PrizeDrawManagement;
