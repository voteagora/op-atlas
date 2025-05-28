import { TENANT_NAMESPACES } from "@/lib/constants"
import { optimismTenantUIConfig } from "@/lib/tenants/configs/ui/optimism"
import { TenantNamespace } from "@/lib/types"

export default class TenantUIFactory {
  public static create(namespace: TenantNamespace): any {
    console.log("Creating tenant UI for namespace: ", namespace)
    switch (namespace) {
      case TENANT_NAMESPACES.OPTIMISM:
        return optimismTenantUIConfig
      default:
        throw new Error(`Invalid namespace: ${namespace}`)
    }
  }
}
