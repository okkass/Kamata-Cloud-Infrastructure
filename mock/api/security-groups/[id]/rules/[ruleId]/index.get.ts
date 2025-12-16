// getのmock
export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const ruleId = event.context.params?.ruleId;
  console.log(`Received request for rule ${ruleId} from security group ${id}`);
  return { message: `Details of rule ${ruleId} from security group ${id}` };
});
