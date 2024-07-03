import requestHttp from "@/utils/request";

export default {
    async search(data) {
        return await requestHttp.post(`/rental/dept/search`, data)
    },
    async delete(data){
        return await requestHttp.delete(`/rental/dept/delete/${data}`)
    },
    async update(data){
        return await requestHttp.put(`/rental/dept/update`, data)
    },
    async create(data){
        return await requestHttp.post(`/rental/dept/save`, data)
    },
    async selectTree(){
        return await requestHttp.get(`/rental/dept/tree`)
    },
    async hasChildren(data){
        return await requestHttp.get(`/rental/dept/children/${data}`)
    },
}