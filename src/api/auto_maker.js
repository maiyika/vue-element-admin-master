import requestHttp from "@/utils/request";

export default { 
    async search(start, size, data) {
        return await requestHttp.post(`/rental/autoMaker/${start}/${size}`, data)
    },
    async delete(data){
        return await requestHttp.delete(`/rental/autoMaker/delete`, data)
    },
    async update(data){
        return await requestHttp.put(`/rental/autoMaker/update`, data)
    },
    async create(data){
        return await requestHttp.post(`/rental/autoMaker/save`, data)
    }
}