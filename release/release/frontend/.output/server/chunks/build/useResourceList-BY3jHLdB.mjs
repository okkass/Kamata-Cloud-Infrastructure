import { toValue } from 'vue';
import { u as useFetch } from './fetch-kOzZWayB.mjs';
import { f as useNuxtApp } from './server.mjs';

const useResourceList = (resourceName, params) => {
  const url = `${resourceName}`;
  return useFetch(url, {
    $fetch: useNuxtApp().$apiFetch,
    params,
    default: () => [],
    // paramsがref/computedの場合、変更時に自動再取得を行う
    watch: [() => toValue(params)]
  }, "$JpsYHH5KkQ");
};

export { useResourceList as u };
//# sourceMappingURL=useResourceList-BY3jHLdB.mjs.map
