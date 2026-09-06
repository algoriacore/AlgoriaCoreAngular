export class AppPermissions {
    static processes = 'Pages.Processes.Processes_{processId}';
    static processesCreate = 'Pages.Processes.Processes_{processId}.Create';
    static processesEdit = 'Pages.Processes.Processes_{processId}.Edit';
    static processesDelete = 'Pages.Processes.Processes_{processId}.Delete';
    static processesTimeSheetCreate = 'Pages.Processes.Processes_{processId}.TimeSheet.Create';

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
}
