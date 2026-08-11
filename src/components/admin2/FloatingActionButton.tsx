import Icon from "./Icon";

function FloatingActionButton() {
  return (
    <button
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#154212] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label="Add location"
    >
      <Icon name="add_location" />
    </button>
  );
}

export default FloatingActionButton;
