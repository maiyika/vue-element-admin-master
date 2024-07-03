import requestHttp from "@/utils/request";

export default { 
    async search(start, size, data) {
        return await requestHttp.post(`/rental/autoBrand/${start}/${size}`, data)
    },
    async delete(data){
        return await requestHttp.delete(`/rental/autoBrand/delete/${data}`)
    },
    async update(data){
        return await requestHttp.put(`/rental/autoBrand/update`, data)
    },
    async create(data){
        return await requestHttp.post(`/rental/autoBrand/save`, data)
    },
    async hasChildren(data){
        return await requestHttp.get(`/rental/autoBrand/hasChildren/${data}`)
    }
}