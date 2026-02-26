import { d as defineEventHandler, u as useRuntimeConfig, g as getTokenFromEvent, c as createError, a as getHeaders, b as getQuery, s as sendStream } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@iconify/utils';
import 'consola';

const ____slug_ = defineEventHandler(async (event) => {
  var _a;
  const runtimeConfig = useRuntimeConfig();
  const token = runtimeConfig.public.runMode === "mock" ? "mock-token" : getTokenFromEvent(event);
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const baseUrl = runtimeConfig.public.backendUrl;
  const slug = (_a = event.context.params) == null ? void 0 : _a.slug;
  const headers = {
    ...getHeaders(event),
    Authorization: `Bearer ${token}`
  };
  const url = `${baseUrl}${slug}`;
  const method = event.node.req.method || "GET";
  if (method === "GET" || method === "DELETE") {
    return await $fetch(url, {
      method,
      headers,
      query: getQuery(event),
      ignoreResponseError: true
    });
  }
  const body = event.node.req;
  const res = await fetch(url, {
    method,
    headers,
    body
  });
  return sendStream(event, res.body);
});

export { ____slug_ as default };
//# sourceMappingURL=_...slug_.mjs.map
