import "@/styles/loaders.css";
const CircleLoader = () => {
  return (
    <div className="z-20 flex flex-col gap-4 items-center justify-center ">
      <span className="text-orange-400 font-bold text-lg mr-8">Loading</span>
      <span className="circle-loader"></span>;
    </div>
  );
};

export default CircleLoader;
