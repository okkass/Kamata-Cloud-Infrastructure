import { ref, readonly } from "vue";

// デフォルトは閉じている
const isSidebarOpen = ref(false);

export function useSidebar() {
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
    isSidebarOpen: readonly(isSidebarOpen),
    toggleSidebar,
    open,
    close,
  };
}
