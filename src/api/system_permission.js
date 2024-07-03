import requestHttp from "@/utils/request";

export default {
    async search() {
        return await requestHttp.get(`/rental/permission/list`)
    },
    async delete(data){
        return await requestHttp.delete(`/rental/permission/delete/${data}`)
    },
    async update(data){
        return await requestHttp.put(`/rental/permission/update`, data)
    },
    async create(data){
        return await requestHttp.post(`/rental/permission/save`, data)
    },
    async selectTree(){
        return await requestHttp.get(`/rental/permission/tree`)
    },
    async hasChildren(data){
        return await requestHttp.get(`/rental/permission/children/${data}`)
    },
}