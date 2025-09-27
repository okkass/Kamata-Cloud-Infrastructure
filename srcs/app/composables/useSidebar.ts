export const useSidebar = () => {
  const isSidebarOpen = useState("isSidebarOpen", () => true);

  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  const open = () => {
    isSidebarOpen.value = true;
  };

  const close = () => {
    isSidebarOpen.value = false;
  };

  return {
    isSidebarOpen,
    toggleSidebar,
    open,
    close,
  };
};
