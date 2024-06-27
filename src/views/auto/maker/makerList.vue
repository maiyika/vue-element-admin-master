<template>
    <div>
        <el-main>
            <!--查询表单-->
            <el-form :inline="true" :model="makerModel" size="small" label-width="100px">
                <el-form-item label="厂商名称">
                    <el-input v-model="makerModel.name" placeholder="厂商名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click="onSubmit">查询</el-button>
                    <el-button type="warning" icon="el-icon-refresh" @click="resetForm">重置</el-button>
                    <el-button type="success" icon="el-icon-plus" @click="handleCreate">新增</el-button>
                    <el-button type="danger" icon="el-icon-delete" @click="deleteAllBox = true;">删除选中</el-button>
                </el-form-item>
            </el-form>
            <!--查询表单结束-->
            <!--数据表格-->
            <el-table ref="table" :data="tableList" style="width: 100%; margin-bottom: 20px; " max-height="500"
                v-loading="loading" row-key="id" border stripe @selection-change="handleSelectionChange">
                <el-table-column fixed type="selection" reserve-selection width="55">
                </el-table-column>
                <el-table-column label="序号" width="55">
                    <template slot-scope="scope">
                        <span>{{ (start - 1) * size + scope.$index + 1 }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="厂商名称">
                </el-table-column>
                <el-table-column prop="orderLetter" label="排序字母">
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
                <el-form :model="saveMaker" ref="form" :rules="rules" label-width="100px">
                    <el-form-item label="厂商名称" prop="name">
                        <el-input v-model="saveMaker.name" autocomplete="off"></el-input>
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
//导入auto_maker.js
import makerApi from '@/api/auto_maker.js'
export default {
    name: 'makerList',
    data() {
        //数据模型
        return {
            makerModel: {},
            updateModel: {},
            tableList: [],
            start: 1,
            size: 7,
            total: 0,
            loading: true,
            saveMaker: {},
            dialogFormVisible: false,
            formLabelWidth: '120px',
            rules: {
                name: [
                    { required: true, message: '请输入厂商名称', trigger: 'blur' },
                    //{ min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                ],
            },
            dialogStatus: '',      //新增或修改
            titleMap: {
                create: '新增厂商',
                update: '修改厂商'
            },
            deleteBox: false,
            deleteAllBox: false,
            line: {},
            lines: [],
        }
    },
    created() {
        //页面加载时调用
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
            const res = await makerApi.search(this.start, this.size, this.makerModel);
            if (res.code == 200) {
                this.tableList = res.data.records;
                this.total = res.data.total;
                this.size = res.data.size;
                this.start = res.data.current;
            }
        },
        onSubmit() {
            //makerModel 读取表单数据, 当前就一个文本框
            this.$refs.table.clearSelection(); //清空勾选的状态
            this.withLoading(this.search)();
        },
        resetForm() {
            this.tableList = [];
            this.makerModel = {};
            this.$refs.table.clearSelection(); //清空勾选的状态
            this.withLoading(this.search)();
        },
        handleCreate() {
            this.dialogStatus = 'create';
            this.saveMaker = {};
            this.dialogFormVisible = true;
            this.$nextTick(() => { this.$refs['form'].clearValidate(); });
        },
        handleUpdate(row) {
            this.saveMaker = row;
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
            this.$refs['form'].validate(async (valid) => {  //校验
                if (!valid) {
                    return false;
                } else {
                    //新增操作
                    this.loading = true;
                    const res = await makerApi.create(this.saveMaker);
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
            const res = await makerApi.update(this.saveMaker);
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
            const res = await makerApi.delete(row);
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
        }
    }
}

</script>
<style></style>