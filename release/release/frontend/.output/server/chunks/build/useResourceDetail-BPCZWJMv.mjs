import { unref } from 'vue';
import { u as useFetch } from './fetch-kOzZWayB.mjs';
import { f as useNuxtApp } from './server.mjs';

const useResourceDetail = (resourceName, id) => {
  const resourceId = unref(id) ?? "";
  const url = `${resourceName}/${resourceId}`;
  return useFetch(url, {
    $fetch: useNuxtApp().$apiFetch,
    default: () => void 0,
    key: `useResourceDetail-${resourceName}-${resourceId}`
  }, "$OPb2fzk3EB");
};

export { useResourceDetail as u };
//# sourceMappingURL=useResourceDetail-BPCZWJMv.mjs.map
