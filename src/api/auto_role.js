import requestHttp from "@/utils/request";

export default {
    async search(start, size, data) {
        return await requestHttp.post(`/rental/role/${start}/${size}`, data);
    },
    async edit(data) {
        return await requestHttp.put(`/rental/role/update`, data);
    },
    async delete(ids) {
        return await requestHttp.delete(`/rental/role/${ids}`);
    },
    async create(data) {
        return await requestHttp.post(`/rental/role/save`, data);
    },
    async hasUser(id) {
        return await requestHttp.get(`/rental/role/hasUser/${id}`);
    },
    async permissionTree(data) {
        return await requestHttp.get(`/rental/role/getRolePermissionTree`, data);
    },
    async saveRolePermission(roleId, permissionIds) {
        return await requestHttp.get(`/rental/role/saveRolePermission/${roleId}/${permissionIds}`);
    },
    async list(){
        return await requestHttp.get(`/rental/role`);
    },
}