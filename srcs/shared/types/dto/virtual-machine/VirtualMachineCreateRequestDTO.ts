/**
 * 仮想マシン作成リクエストオブジェクト (パターンAまたはパターンBのどちらか)
 */
export type VirtualMachineCreateRequestDTO =
  | VirtualMachineCreateWithInstanceTypeRequest
  | VirtualMachineCreateWithCustomConfigRequest;
