import Modal from "./Modal";
import { BiPencil } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import Button from "./Button";
import type { ModalProps } from "../types/modal";
import "@/styles/addItem.css";
import { usePrizeDrawStore } from "@/stores/PrizeDrawStore";
import FileUploadPrime from "./FileUpload";
import RichTextEditor from "./RichTextEditor";
import { InputSwitch } from "primereact/inputswitch";
import { useEffect, useState, type HTMLAttributes } from "react";
import type { CreatePrizeDrawProps } from "@/types/graphql";
import Swal from "sweetalert2";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { wprest } from "@/utils/rest";

const AddItemModal = ({ open, setOpen }: ModalProps) => {
  const prizeStore = usePrizeDrawStore();
  const [loading, setLoading] = useState(false);
  const [uploadedMediaIds, setUploadedMediaIds] = useState<number[]>([]);

  // ========== Form Fields States ============
  const {
    control,
    register,
    handleSubmit,
    // watch,
    reset,
    formState: { errors },
  } = useForm<CreatePrizeDrawProps>({
    mode: "onTouched",
    reValidateMode: "onBlur",
  });

  useEffect(() => {
    console.log("USEFFECT UPLOADMEDIAIDS: ", uploadedMediaIds);
  }, [uploadedMediaIds]);

  const createPrizeItem: SubmitHandler<CreatePrizeDrawProps> = async (item) => {
    console.log("UPLOADMEDIAIDS: ", uploadedMediaIds);
    if (uploadedMediaIds.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Upload Required",
        text: "Please upload at least one image before submitting!",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await wprest.CreatePrizeDrawItem(item);
      console.log(response);

      await prizeStore.updateDrawItems();
      Swal.fire({
        icon: "success",
        title: "Created!",
        text: "Item has been added successfully!",
      });
      setOpen(false);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong when adding this item!",
      });
    }
    setLoading(false);

    reset();
  };

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      loading={loading}
      loadingMsg={"Creating"}
    >
      <div className="flex items-center w-191.25 justify-between px-8 py-4">
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
          onClick={() => {
            setOpen(false);
            reset();
          }}
        />
      </div>
      <hr className="w-full border-b border-slate-100" />

      <form onSubmit={handleSubmit(createPrizeItem)}>
        {/* ============== INPUT FIELDS =============== */}
        <div className="flex flex-col min-h-0 max-h-[70vh] pb-12 overflow-auto">
          <div className="relative flex gap-2 flex-col px-12 p-4 -mb-4">
            <span className="font-medium">Category</span>
            <select
              {...register("itemCategory", { required: false })}
              className="input-field "
            >
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
          <InputField label="Item name" field="title">
            <input
              type="text"
              {...register("title", { required: true })}
              className="input-field"
            />
          </InputField>
          <Controller
            name="mediaIds"
            control={control}
            rules={{
              required: "Please upload at least one image",
            }}
            render={({ field }) => (
              <FileUploadPrime
                maxFiles={1}
                onUploadComplete={(ids: number[]) => {
                  field.onChange(ids); // <-- update RHF state
                  setUploadedMediaIds(ids); // optional if you still want local state
                }}
                onFileRemove={(index: number) => {
                  const updatedIds = (field.value || []).filter(
                    (_: number, i: number) => i !== index,
                  );
                  field.onChange(updatedIds);
                  setUploadedMediaIds(updatedIds);
                }}
              />
            )}
          />

          <InputField label="Description" field="itemDescription">
            <Controller
              name="itemDescription"
              control={control}
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  // @ts-ignore
                  onTextChange={(e) => field.onChange(e.htmlValue)}
                  style={{ height: "200px" }}
                  required
                />
              )}
            />
          </InputField>
          <div className="flex w-full justify-between items-center px-14 gap-4">
            <InputField
              label="Price"
              field="price"
              className="flex-1 flex-col flex gap-2 relative"
            >
              <div className="flex gap-4 input-field">
                <span className="font-bold">$</span>
                <input
                  type="number"
                  {...register("price", {
                    required: true,
                    valueAsNumber: true,
                  })}
                  className="outline-none border-none"
                />
              </div>
            </InputField>
            <div className="flex gap-2 flex-col flex-1">
              <span className="font-medium">Stock Quantity</span>
              <input type="number" className="input-field " />
            </div>
          </div>
          <div className="px-2">
            <InputField label="Amounts of Tickets Required" field="tickets">
              <input
                type="number"
                {...register("tickets", {
                  required: true,
                  valueAsNumber: true,
                })}
                className="input-field"
                placeholder="ex. 500"
              />
            </InputField>
          </div>
          <div className="px-14 mt-4 flex place-content-center">
            <div className="flex justify-between w-full p-4 rounded-lg items-center border border-neutral-200">
              <div className="flex flex-col">
                <span>Public Visibility</span>
                <span>Make this item visible to all users immediately</span>
              </div>
              <Controller
                name="itemStatus"
                control={control}
                render={({ field }) => (
                  <InputSwitch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.value)}
                  />
                )}
              />
            </div>
          </div>
        </div>
        <hr className="w-full border-b border-slate-100" />
        <div className="px-8 py-5 flex gap-4 bg-orange-100 justify-end">
          <Button className="bg-white font-bold">
            <BiPencil />
            <span>Save Draft</span>
          </Button>
          <Button
            type="submit"
            className="bg-orange-400 text-white font-bold rounded"
          >
            <span>Make Live</span>
          </Button>
        </div>
      </form>
    </Modal>
  );

  function InputField({
    label,
    field,
    children,
    ...props
  }: HTMLAttributes<HTMLDivElement> & {
    label: string;
    field: keyof CreatePrizeDrawProps;
  }) {
    return (
      <div className="relative flex gap-2 flex-col p-4 px-12" {...props}>
        <span className="font-medium">{label}</span>
        {children}
        {errors[field] && (
          <span
            className={`absolute bottom-0 text-red-500 text-[10px] ${props.className && "-mb-4"}`}
          >
            The field "{field as string}" is required!
          </span>
        )}
      </div>
    );
  }
};

export default AddItemModal;
