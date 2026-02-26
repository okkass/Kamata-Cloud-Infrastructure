import { h as useState, f as useNuxtApp } from './server.mjs';
import { computed } from 'vue';

const useUserPermission = () => {
  const user = useState("user", () => null);
  const isAdmin = computed(() => {
    if (!user.value) {
      return false;
    }
    return user.value.isAdmin === true;
  });
  const isImageAdmin = computed(() => {
    if (!user.value) {
      return false;
    }
    return user.value.isImageAdmin === true;
  });
  const isInstanceTypeAdmin = computed(() => {
    if (!user.value) {
      return false;
    }
    return user.value.isInstanceTypeAdmin === true;
  });
  const isNetworkAdmin = computed(() => {
    if (!user.value) {
      return false;
    }
    return user.value.isNetworkAdmin === true;
  });
  const isNodeAdmin = computed(() => {
    if (!user.value) {
      return false;
    }
    return user.value.isNodeAdmin === true;
  });
  const isSecurityGroupAdmin = computed(() => {
    if (!user.value) {
      return false;
    }
    return user.value.isSecurityGroupAdmin === true;
  });
  const isVirtualMachineAdmin = computed(() => {
    if (!user.value) {
      return false;
    }
    return user.value.isVirtualMachineAdmin === true;
  });
  const hasAdminAccess = computed(() => {
    return isAdmin.value || isImageAdmin.value || isInstanceTypeAdmin.value || isNetworkAdmin.value || isNodeAdmin.value || isSecurityGroupAdmin.value || isVirtualMachineAdmin.value;
  });
  const fetchUser = async () => {
    if (user.value !== null) return;
    try {
      const res = await useNuxtApp().$apiFetch("users/me");
      user.value = {
        id: res.id,
        isAdmin: res.isAdmin,
        isImageAdmin: res.isImageAdmin,
        isInstanceTypeAdmin: res.isInstanceTypeAdmin,
        isNetworkAdmin: res.isNetworkAdmin,
        isNodeAdmin: res.isNodeAdmin,
        isSecurityGroupAdmin: res.isSecurityGroupAdmin,
        isVirtualMachineAdmin: res.isVirtualMachineAdmin
      };
    } catch (error) {
      console.error("Failed to fetch user:", error);
      user.value = null;
    }
  };
  return {
    user,
    isAdmin,
    isImageAdmin,
    isInstanceTypeAdmin,
    isNetworkAdmin,
    isNodeAdmin,
    isSecurityGroupAdmin,
    isVirtualMachineAdmin,
    hasAdminAccess,
    fetchUser
  };
};

export { useUserPermission as u };
//# sourceMappingURL=useUserPermission-CgOheY55.mjs.map
