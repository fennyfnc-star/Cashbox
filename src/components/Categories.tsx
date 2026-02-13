import { usePrizeDrawStore } from "@/stores/PrizeDrawStore";
import { useState } from "react";
import { FiMenu, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// const categories: Category[] = [
//   { name: "Aircraft", active: true },
//   { name: "Alcohol Tester" },
//   { name: "Binoculars" },
//   { name: "Board Games" },
//   { name: "Boats" },
//   {im using hashrouter name: "Build Kits" },
//   { name: "Cameras" },
//   { name: "Car DVD Recorder" },
//   { name: "Car Models" },
//   { name: "Chargers" },
//   { name: "Educational" },
//   { name: "Electrical" },
//   { name: "Figurines" },
//   { name: "Game Consoles" },
// ];

export function Categories() {
  const [open, setOpen] = useState(false);
  const [searchParams, _] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const prizeStore = usePrizeDrawStore();

  const handleCategoryClick = (cat: string | null) => {
    const label = cat || "";

    // Parse existing query params from the current hash
    const hash = location.hash; // e.g. "#/assets"
    const [routePart, queryPart] = hash.split("?"); // split hash and existing query
    const params = new URLSearchParams(queryPart || "");

    if (label) {
      params.set("category", label);
    } else {
      params.delete("category");
    }

    // Rebuild the hash with updated query params
    const newHash = `${routePart}?${params.toString()}`;

    // Navigate to updated hash (preserves routing)
    navigate(newHash);
  };

  return (
    <div className="w-64">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center cursor-pointer justify-between rounded-md bg-orange-400 px-4 py-3 text-white font-medium"
      >
        <div className="flex items-center gap-3">
          <FiMenu size={20} />
          <span>Categories</span>
        </div>
        <FiChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* List */}
      {open && (
        <ul className="mt-2 space-y-1">
          {prizeStore.categories.map((cat) => {
            const category = searchParams.get("category");
            return (
              <li key={cat.name}>
                <button
                  onClick={() => {
                    handleCategoryClick(cat.name);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-md px-4 py-2 text-sm transition
                  ${
                    category == cat.name
                      ? "bg-orange-50 text-orange-500 font-medium"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <span>{cat.name}</span>
                  {category == cat.name && <FiChevronRight size={16} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
