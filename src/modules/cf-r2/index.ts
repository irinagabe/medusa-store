import CFR2FileProviderService from "./service"
import { ModuleProvider, Modules } from "@medusajs/framework/utils"

export default ModuleProvider(Modules.FILE, {
  services: [
    CFR2FileProviderService]
})