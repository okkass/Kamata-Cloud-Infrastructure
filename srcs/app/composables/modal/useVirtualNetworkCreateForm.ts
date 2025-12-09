/**
 * =================================================================================
 * 仮想ネットワーク作成フォーム Composable (useVirtualNetworkCreateForm.ts)
 * ---------------------------------------------------------------------------------
 * ・バリデーションに z.cidrv4() を使用
 * =================================================================================
 */
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

// ==============================================================================
// Validation Schema
// ==============================================================================

// サブネット単体のスキーマ
const subnetSchema = z.object({
  name: z.string().min(1, "サブネット名は必須です。"),
  cidr: z.cidrv4(),
  possibleExternalConnection: z.boolean(),
});

// フォーム全体のスキーマ
const zodSchema = z.object({
  name: z.string().min(1, "ネットワーク名は必須です。"),
  // ★★★ 修正箇所: z.cidrv4() を使用 ★★★
  cidr: z.cidrv4(),
  initialSubnets: z.array(subnetSchema),
});

const validationSchema = toTypedSchema(zodSchema);

// フォーム内の型定義 (VeeValidate用)
interface SubnetFormValue {
  name: string;
  cidr: string;
  possibleExternalConnection: boolean;
}

interface FormValues {
  name: string;
  cidr: string;
  initialSubnets: SubnetFormValue[];
}

/**
 * 仮想ネットワーク作成フォームのロジック
 */
export function useVirtualNetworkCreateForm() {
  const { addToast } = useToast();

  const { executeCreate, isCreating } = useResourceCreate<
    VirtualNetworkCreateRequest,
    VirtualNetworkResponse
  >("virtual-networks");

  // ============================================================================
  // Form Setup
  // ============================================================================
  const { errors, handleSubmit, defineField } = useForm<FormValues>({
    validationSchema,
    initialValues: {
      name: "",
      cidr: "",
      initialSubnets: [],
    },
  });

  const [name, nameAttrs] = defineField("name");
  const [cidr, cidrAttrs] = defineField("cidr");

  // --- サブネット配列 (useFieldArray) ---
  const {
    fields: initialSubnets,
    push: pushSubnet,
    remove: removeSubnet,
  } = useFieldArray<SubnetFormValue>("initialSubnets");

  // サブネット追加ヘルパー
  const addSubnet = () => {
    pushSubnet({
      name: "",
      cidr: "",
      possibleExternalConnection: false,
    });
  };

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: (event: "success" | "close") => void) =>
    handleSubmit(async (formValues) => {
      // 自動インポートされる型 (VirtualNetworkCreateRequest) を使用
      const payload: VirtualNetworkCreateRequest = {
        name: formValues.name,
        cidr: formValues.cidr,
        initialSubnets: formValues.initialSubnets.map((s) => ({
          name: s.name,
          cidr: s.cidr,
          possibleExternalConnection: s.possibleExternalConnection,
        })),
      };

      const result = await executeCreate(payload);

      if (result.success) {
        addToast({
          type: "success",
          message: `仮想ネットワーク「${payload.name}」を作成しました。`,
        });
        emit("success");
        emit("close");
      } else {
        addToast({
          type: "error",
          message: "作成に失敗しました。",
          details: result.error?.message,
        });
      }
    });

  return {
    errors,
    name,
    nameAttrs,
    cidr,
    cidrAttrs,
    initialSubnets,
    addSubnet,
    removeSubnet,
    isCreating,
    onFormSubmit,
  };
}
