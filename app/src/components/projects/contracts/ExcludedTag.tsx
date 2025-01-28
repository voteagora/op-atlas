// import { FormField } from "@/components/ui/form";
// import { ContractDropdownButton } from "./ContractDropdownButton";

// export function ExcludedTag({form, contractField, deployerIndex, index}: {form: any, contractField: any, deployerIndex: number, index: number}) {

//     return <FormField
//     control={form.control}
//     name={`deployers.${deployerIndex}.contracts.${index}.excluded`}
//     render={({
//       field:
//         excludedField,
//     }) => (
//       <>
//         {excludedField.value &&
//           dbData.contracts.some(
//             (
//               dbContract: any,
//             ) =>
//               dbContract.address ===
//                 contractField
//                   .value
//                   .address &&
//               dbContract.chain ===
//                 contractField
//                   .value
//                   .chain,
//           ) && (
//             <p className="bg-gray-300 rounded-lg px-2 py.5 text-sm">
//               Exclude
//             </p>
//           )}

//         {!excludedField.value &&
//           !dbData.contracts.some(
//             (
//               dbContract: any,
//             ) =>
//               dbContract.address ===
//                 contractField
//                   .value
//                   .address &&
//               dbContract.chain ===
//                 contractField
//                   .value
//                   .chain,
//           ) && (
//             <p className="bg-gray-300 rounded-lg px-2 py.5 text-sm">
//               Include
//             </p>
//           )}

//         <ContractDropdownButton
//           form={form}
//           field={
//             excludedField
//           }
//           index={index}
//         />
//       </>
//     )}
//   />
// }
