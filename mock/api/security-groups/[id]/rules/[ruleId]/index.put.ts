// putのmock
export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const ruleId = event.context.params?.ruleId;
  const body = await readBody(event);
  console.log(`Received put for rule ${ruleId} from security group ${id}:`, body);
  return { message: `Rule ${ruleId} from security group ${id} put successfully`, data: body };
}); 