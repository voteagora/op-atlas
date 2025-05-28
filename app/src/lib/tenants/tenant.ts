import { TenantUI } from "@/lib/tenants/tenantUI"
import TenantUIFactory from "@/lib/tenants/tenantUIFactory"
import { TenantNamespace } from "@/lib/types"
import "dotenv/config"

export default class Tenant {
  private static instance: Tenant

  private readonly _ui: TenantUI
  private readonly _isProd: boolean
  private readonly _namespace: TenantNamespace

  private constructor() {
    console.log("Tenant namespace: ", process.env.NEXT_PUBLIC_TENANT_NAMESPACE)

    this._namespace = process.env
      .NEXT_PUBLIC_TENANT_NAMESPACE as TenantNamespace
    this._isProd = process.env.PUBLIC_AGORA_ENV === "prod"
    this._ui = TenantUIFactory.create(this._namespace)
  }

  public static current(): Tenant {
    if (!Tenant.instance) {
      Tenant.instance = new Tenant()
    }
    return Tenant.instance
  }

  public get namespace(): TenantNamespace {
    return this._namespace
  }

  public get ui(): TenantUI {
    return this._ui
  }
}
