import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b px-4 sm:px-6 lg:px-8"
      style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
    >
      <div className="max-w-7xl mx-auto ">
        <div className="h-20 grid grid-cols-3 items-center gap-4">
          {/* Logo — left */}
          <div className="flex items-center gap-2">
            <span
              className="text-2xl font-semibold tracking-tight"
              style={{ color: "#1E3A5F" }}
            >
              Info Academy
            </span>
          </div>

          {/* Nav links — center */}
          <div className="hidden md:flex items-center justify-center gap-8"></div>

          {/* CTAs — right */}
          <div className="hidden md:flex items-center justify-end gap-2">
            <Button
              size="lg"
              className="px-6 py-5 font-medium text-lg text-white"
              style={{ background: "#3B82F6", border: "none" }}
            >
              Начать
            </Button>
          </div>

          {/* Mobile button */}
          <div className="md:hidden flex justify-end col-start-3">
            <Button
              className="text-base font-medium text-white"
              style={{ background: "#3B82F6", border: "none" }}
            >
              Начать
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
