<template>
    <div>
        <el-main>
            <!--查询表单-->
            <el-form :inline="true" :model="brandModel" size="small" label-width="100px">
                <el-form-item label="厂商名称">
                    <el-select v-model="brandModel.autoBrand.mid" placeholder="厂商名称">
                        <el-option v-for="item in makerList" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="品牌名称">
                    <el-input v-model="brandModel.autoBrand.brandName" placeholder="品牌名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click="onSubmit">查询</el-button>
                    <el-button type="warning" icon="el-icon-refresh" @click="resetForm">重置</el-button>
                    <el-button type="success" icon="el-icon-plus" @click="handleCreate">新增</el-button>
                    <el-button type="danger" icon="el-icon-delete" @click="deleteAllBox = true;">删除选中</el-button>
                    <el-button type="primary" icon="el-icon-delete" @click="exportExcel">导出</el-button>
                </el-form-item>
            </el-form>
            <!--查询表单结束-->
            <!--数据表格-->
            <el-table ref="table" :data="tableList" style="width: 100%; margin-bottom: 20px; " max-height="500"
                v-loading="loading" row-key="autoBrand.id" border stripe @selection-change="handleSelectionChange">
                <el-table-column fixed type="selection" reserve-selection width="55">
                </el-table-column>
                <el-table-column label="序号" width="55">
                    <template slot-scope="scope">
                        <span>{{ (start - 1) * size + scope.$index + 1 }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="makerName" label="厂商名称">
                </el-table-column>
                <el-table-column prop="autoBrand.brandName" label="品牌名称">
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
                        <el-button type="danger" size="mini" @click="deleteBox = true; line = scope.row">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!--数据表格结束-->
            <!--分页组件-->
            <el-pagination background layout="total, prev, pager, next, jumper" :current-page="start" :page-size="size"
                :total="total" @current-change="search">
            </el-pagination>
            <!--分页组件结束-->
            <!--对话框-->
            <el-dialog title="提示" :visible.sync="deleteBox" width="30%" center>
                <span>确定删除? </span>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="deleteBox = false">取 消</el-button>
                    <el-button type="primary" @click="deleteBox = false; handleDelete(line);">确 定</el-button>
                </span>
            </el-dialog>
            <el-dialog title="提示" :visible.sync="deleteAllBox" width="30%" center>
                <span>确定删除? </span>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="deleteAllBox = false; lines = []">取 消</el-button>
                    <el-button type="primary" @click="deleteAllBox = false; deleteBatch(lines)">确
                        定</el-button>
                </span>
            </el-dialog>
            <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
                <el-form :model="savebrand" ref="form" :rules="rules" label-width="100px">
                    <el-form-item label="厂商名称" prop="mid">
                        <el-select v-model="savebrand.mid" placeholder="厂商名称">
                            <el-option v-for="item in makerList" :key="item.id" :label="item.name" :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="品牌名称" prop="brandName">
                        <el-input v-model="savebrand.brandName" autocomplete="off"></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取 消</el-button>
                    <!--区别新增和修改-->
                    <el-button type="primary" @click="dialogStatus === 'create' ? create() : update();">确
                        定</el-button>
                </div>
            </el-dialog>
            <!--对话框结束-->
        </el-main>
    </div>
</template>

<script>
//导入auto_brand.js
import brandApi from '@/api/auto_brand.js'
import makerApi from '@/api/auto_maker.js'
import { getToken } from '@/utils/auth.js'
export default {
    name: 'brandList',
    data() {
        //数据模型
        return {
            brandModel: {
                autoBrand: {
                    id: '',
                    mid: '',
                    brandName: '',
                },
                makerName: '',
            },
            tableList: [],
            makerList: [],         //厂商列表(下拉列表)
            start: 1,
            size: 7,
            total: 0,
            loading: true,
            savebrand: {},       //新增或修改的数据对象
            dialogFormVisible: false,
            formLabelWidth: '120px',
            rules: {
                mid: [
                    { required: true, message: '请输入厂商名称', trigger: 'blur' },
                    //{ min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                ],
                brandName: [
                    { required: true, message: '请输入品牌名称', trigger: 'blur' },
                ],
            },
            dialogStatus: '',      //新增或修改
            titleMap: {
                create: '新增',
                update: '修改'
            },
            deleteBox: false,
            deleteAllBox: false,
            line: {
                autoBrand: {
                    id: '',
                    mid: '',
                    brandName: '',
                },
                makerName: '',
            },
            lines: [],
        }
    },
    async activated() {
        //页面加载时调用
        const res = await makerApi.search(1, 10000, {});  //查询所有厂商, 在页面加载时调用
        this.makerList = res.data.records;
        this.withLoading(this.search)();
    },


    methods: {
        // 高阶函数，用于设置loading状态
        withLoading(fn) {
            return async (...args) => {
                try {
                    this.loading = true;
                    await fn.apply(this, args);
                } finally {
                    this.loading = false;
                }
            };
        },
        //相关函数
        async search(start = 1) {
            //查询, start为当前页码, 默认为1
            this.start = start;
            const res = await brandApi.search(this.start, this.size, this.brandModel.autoBrand);
            if (res.code == 200) {
                this.tableList = res.data.records;
                this.total = res.data.total;
                this.size = res.data.size;
                this.start = res.data.current;
            }
        },
        onSubmit() {
            //brandModel 读取表单数据, 当前就一个文本框
            this.$refs.table.clearSelection(); //清空勾选的状态
            this.withLoading(this.search)();
        },
        resetForm() {
            resetModel(this.tableList);
            resetModel(this.brandModel);  //不破坏brandModel的结构, 并将它置空
            this.$refs.table.clearSelection(); //清空勾选的状态
            this.withLoading(this.search)();
        },
        handleCreate() {
            this.dialogStatus = 'create';
            resetModel(this.savebrand);
            this.dialogFormVisible = true;
            this.$nextTick(() => { this.$refs['form'].clearValidate(); });
        },
        handleUpdate(row) {
            this.savebrand = row.autoBrand;
            this.dialogStatus = 'update';
            this.dialogFormVisible = true;
            this.$nextTick(() => { this.$refs['form'].clearValidate(); });
        },
        deleteBatch(lines) {
            //将lines中的对象遍历
            lines.forEach(async line => {
                //删除操作
                this.handleDelete(line);
            });
        },
        async create() {
            this.$refs['form'].validate(async valid => {  //校验
                if (!valid) {
                    return false;
                } else {
                    //新增操作
                    this.loading = true;
                    const res = await brandApi.create(this.savebrand);
                    this.loading = false;
                    if (res.code == 200) {
                        this.$message.success('新增成功');
                        this.dialogFormVisible = false;
                        this.withLoading(this.search)();
                    } else {
                        this.$message.error('新增失败');
                    }
                }

            });
        },
        async update() {
            //更新操作
            this.loading = true;
            const res = await brandApi.update(this.savebrand);
            this.loading = false;
            if (res.code == 200) {
                this.$message.success('更新成功');
                this.dialogFormVisible = false;
                this.withLoading(this.search)();
            } else {
                this.$message.error('更新失败');
            }
        },
        async handleDelete(row) {
            //打印删除的数据
            //console.log(row);
            //删除操作
            this.loading = true;
            const res = await brandApi.delete(row.autoBrand.id);
            this.loading = false;
            if (res.code == 200) {
                this.$message.success('删除成功');
                this.withLoading(this.search)();
            } else {
                this.$message.error('删除失败');
            }
        },
        handleSelectionChange(val) {
            // val 是一个包含选中行数据的数组
            this.lines = val;
            //console.log('当前选中项', val);
        },
        exportExcel(){
            let url=`${process.env.VUE_APP_BASE_API}rental/autoBrand/exportExcel?token=${getToken()}`
            window.open(url)
        }
    }
}
function resetModel(model) {
    Object.keys(model).forEach(key => {
        if (typeof model[key] === 'object' && model[key] !== null) {
            // 如果是对象且不为null，递归调用
            resetModel(model[key]);
        } else if (Array.isArray(model[key])) {
            // 如果是数组，置为空数组
            model[key] = [];
        } else if (typeof model[key] === 'string') {
            // 如果是字符串，置为空字符串
            model[key] = '';
        } else if (typeof model[key] === 'number') {
            // 如果是数字，置为0或其他适当的“空”值
            model[key] = '';
        } else if (typeof model[key] === 'boolean') {
            // 如果是布尔值，可能置为false或true，取决于具体情况
            model[key] = false;
        } else {
            // 其他类型根据需要处理
            model[key] = null;
        }
    });
}
</script>
<style></style>