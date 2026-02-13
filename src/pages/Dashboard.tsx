
import MainLayout from "@/layouts/MainLayout";

const Dashboard = () => {

  const pageTitle = "Dashboard"

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between w-full">
          <div className="flex flex-col gap-2 flex-1">
            <span className="text-2xl font-bold">{pageTitle}</span>
            <span className="text-sm text-neutral-400">
              This is the dashboard
            </span>

            <span className="mt-4 text-neutral-400">
              Home / {" "}
              <strong className="text-[#333]">{pageTitle}</strong>
            </span>
          </div>
          <div className="flex justify-end items-start">
          </div>
        </div>

       {/* Insert content here */}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
