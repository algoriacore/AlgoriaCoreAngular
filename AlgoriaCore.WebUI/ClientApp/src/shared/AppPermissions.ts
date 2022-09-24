export class AppPermissions {
    static processes = 'Pages.Processes.Processes_{processId}';
    static processesCreate = 'Pages.Processes.Processes_{processId}.Create';
    static processesEdit = 'Pages.Processes.Processes_{processId}.Edit';
    static processesDelete = 'Pages.Processes.Processes_{processId}.Delete';
    static processesTimeSheetCreate = 'Pages.Processes.Processes_{processId}.TimeSheet.Create';

    static catalogsCustom = 'Pages.CatalogsCustom.CatalogsCustom_{catalogId}';
    static catalogsCustomCreate = 'Pages.CatalogsCustom.CatalogsCustom_{catalogId}.Create';
    static catalogsCustomEdit = 'Pages.CatalogsCustom.CatalogsCustom_{catalogId}.Edit';
    static catalogsCustomDelete = 'Pages.CatalogsCustom.CatalogsCustom_{catalogId}.Delete';

    static calculatePermissionNameForProcess(permissionName: string, templateId: number, tenantId?: number): string {
        const processId = (tenantId ? tenantId + '_' : '') + templateId;

        return permissionName.replace('{processId}', processId);
    }

    static isPermissionNameForProcess(permissionName: string): boolean {
        return permissionName === AppPermissions.processes
            || permissionName === AppPermissions.processesCreate
            || permissionName === AppPermissions.processesEdit
            || permissionName === AppPermissions.processesTimeSheetCreate;
    }

    static calculatePermissionNameForCatalogCustom(permissionName: string, catalogId: string, tenantId?: number): string {
        const processId = (tenantId ? tenantId + '_' : '') + catalogId;

        return permissionName.replace('{catalogId}', processId);
    }

    static isPermissionNameForCatalogCustom(permissionName: string): boolean {
        return permissionName === AppPermissions.catalogsCustom
            || permissionName === AppPermissions.catalogsCustomCreate
            || permissionName === AppPermissions.catalogsCustomEdit;
    }
}
