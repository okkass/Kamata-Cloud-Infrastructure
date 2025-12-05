// deleteのmock

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const ruleId = event.context.params?.ruleId;
  console.log(`Received request to delete rule ${ruleId} from security group ${id}`);
  return { message: `Rule ${ruleId} from security group ${id} deleted successfully` };
});
