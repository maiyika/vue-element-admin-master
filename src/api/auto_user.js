import requestHttp from "@/utils/request";

export default {
    async search(start, size, data) {
        return await requestHttp.post(`/rental/user/${start}/${size}`, data);
    },
    async edit(data) {
        return await requestHttp.put(`/rental/user/update`, data);
    },
    async delete(ids) {
        return await requestHttp.delete(`/rental/user/delete/${ids}`);
    },
    async create(data) {
        return await requestHttp.post(`/rental/user/save`, data);
    },
    async hasRole(id) {
        return await requestHttp.get(`/rental/user/hasRole/${id}`);
    },
    async resetPassword(id) {
        return await requestHttp.get(`/rental/user/resetPassword/${id}`);
    },
    async roleTree(data) {
        return await requestHttp.get(`/rental/user/getUserRoleTree`, data);
    },
    async saveUserRole(userId, roleIds) {
        return await requestHttp.get(`/rental/user/saveUserRole/${userId}/${roleIds}`);
    },
    async selectRoleIdByUserId(id) {
        return await requestHttp.get(`/rental/user/role/${id}`);
    },
    async bindRole(userId, roleIds) {
        return await requestHttp.get(`/rental/user/bind/${userId}/${roleIds}`);
    },
    /* async bindRole(userId) {
        return await requestHttp.get(`/rental/user/bind/${userId}`);
    }, */
}