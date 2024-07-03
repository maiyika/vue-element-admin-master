import requestHttp from "@/utils/request";

export default {
    async search(start, size, data) {
        return await requestHttp.post(`/rental/role/${start}/${size}`,data);
    },
}