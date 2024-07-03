<template>
    <div>
        <el-main>
            <!--查询表单-->
            <el-form :inline="true" :model="deptModel" size="small" label-width="100px">
                <el-form-item label="部门名称">
                    <el-input v-model="deptModel.deptName" placeholder="品牌名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click="onSubmit">查询</el-button>
                    <el-button type="warning" icon="el-icon-refresh" @click="resetForm">重置</el-button>
                    <el-button type="success" icon="el-icon-plus" @click="handleCreate">新增</el-button>
                </el-form-item>
            </el-form>
            <!--查询表单结束-->
            <!--数据表格-->
            <el-table ref="table" :data="tableList" style="width: 100%; margin-bottom: 20px; " max-height="500"
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" :default-expand-all="true"
                row-key="id" v-loading="loading" border stripe>
                <el-table-column prop="deptName" label="部门名称"></el-table-column>
                <el-table-column prop="parentName" label="上级部门"></el-table-column>
                <el-table-column prop="phone" label="部门电话"></el-table-column>
                <el-table-column prop="address" label="部门地址"></el-table-column>
                <el-table-column label="操作" width="200">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" icon="el-icon-edit"
                            @click="handleUpdate(scope.row)">编辑</el-button>
                        <el-button type="danger" size="mini" icon="el-icon-delete"
                            @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!--数据表格结束-->
            <!--分页组件-->
            <!--分页组件结束-->
            <!--对话框-->
            <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible" width="30%">
                <el-form :model="saveDept" :rules="rules" ref="form" label-width="100px">
                    <el-form-item label="上级部门" prop="pid">
                        <el-input v-model="saveDept.parentName" placeholder="(不输入该项默认为最上级部门)" :readonly="true"
                            @click.native="selectDept">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="部门名称" prop="deptName">
                        <el-input v-model="saveDept.deptName" placeholder="请输入部门名称"></el-input>
                    </el-form-item>
                    <el-form-item label="部门电话" prop="phone">
                        <el-input v-model="saveDept.phone" placeholder="请输入部门电话"></el-input>
                    </el-form-item>
                    <el-form-item label="部门地址" prop="address">
                        <el-input v-model="saveDept.address" placeholder="请输入部门地址"></el-input>
                    </el-form-item>
                    <el-form-item label="部门排序" prop="orderNum">
                        <el-input-number v-model="saveDept.orderNum" placeholder="请输入部门排序"></el-input-number>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="cancel">取 消</el-button>
                    <el-button type="primary" @click="dialogStatus === 'create' ? create() : update();">确 定</el-button>
                </div>
            </el-dialog>
            <!--对话框结束-->
            <!--树状对话框 -->
            <el-dialog title="选择上级部门" :visible.sync="treeDialogVisible" width="30%">
                <el-tree :data="treeData" node-key="id"
                    :props="{ label: 'deptName', children: 'children', disabled: 'disabled' }"
                    @node-click="handleNodeClick" :default-expand-all="true" empty-text="未获取部门数据"
                    :highlight-current="true" :expand-on-click-node="false">
                </el-tree>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="closeTree">取 消</el-button>
                    <el-button type="primary" @click="handleTreeConfirm">确 定</el-button>
                </div>
            </el-dialog>
            <!--树状对话框结束-->
        </el-main>
    </div>
</template>

<script>
//导入auto_dept.js
import deptApi from '@/api/system_dept.js'
export default {
    name: 'deptList',
    data() {
        //数据模型
        return {
            deptModel: {
                "deptName": "",
                "phone": "",
                "address": "",
                "parentName": "",
                "pid": "",
            },
            tableList: [],
            loading: false,
            dialogFormVisible: false,
            treeDialogVisible: false,
            rules: {
                deptName: [
                    { required: true, message: '请输入部门名称', trigger: 'blur' }
                ],
                pid: [
                    { required: true, message: '请输入上级部门', trigger: 'blur' }
                ],
            },
            deptList: [],
            saveDept: {

            },
            dialogStatus: '',
            titleMap: {
                create: '新增部门',
                update: '修改部门'
            },
            treeData: [],
            defaultProps: {
                children: 'children',
                label: 'deptName'
            }
        }
    },
    async created() {
        //页面加载时调用
        this.withLoading(this.search)();
        const res = await deptApi.search({});
        if (res.code == 200) {
            this.deptList = res.data;
        }
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
        async search() {
            const res = await deptApi.search(this.deptModel);
            if (res.code == 200) {
                this.tableList = res.data;
            }
        },
        onSubmit() {
            this.withLoading(this.search)();
        },
        resetForm() {
            resetModel(this.deptModel);
            resetModel(this.tableList);
            this.withLoading(this.search)();
        },
        handleCreate() {
            this.dialogStatus = 'create';
            this.saveDept = {};
            this.dialogFormVisible = true;
            this.$nextTick(() => { this.$refs.form.clearValidate(); });
        },
        handleUpdate(row) {
            this.saveDept = row;
            this.dialogStatus = 'update';
            this.dialogFormVisible = true;
            this.$nextTick(() => { this.$refs.form.clearValidate(); });
        },
        handleDelete(row) {
            this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const hasChildren = await deptApi.hasChildren(row.id);
                if (hasChildren.message == 'yes') {
                    this.$message.error('请先删除子部门');
                    return;
                }
                const res = await deptApi.delete(row.id);
                if (res.code == 200) {
                    this.$message.success('删除成功');
                    this.withLoading(this.search)();
                } else {
                    this.$message.error('删除失败');
                }
            }).catch(() => {
                this.$message.info('已取消删除');
            });
        },
        async create() {
            this.$refs['form'].validate(async valid => {  //校验
                if (!valid) {
                    return false;
                } else {
                    //新增操作
                    this.loading = true;
                    const res = await deptApi.create(this.saveDept);
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
            this.$refs['form'].validate(async valid => {  //校验
                if (!valid) {
                    return false;
                } else {
                    //更新操作
                    this.loading = true;
                    const res = await deptApi.update(this.saveDept);
                    this.loading = false;
                    if (res.code == 200) {
                        this.$message.success('更新成功');
                        this.dialogFormVisible = false;
                        this.withLoading(this.search)();
                    } else {
                        this.$message.error('更新失败');
                    }
                }

            });
        },
        cancel() {
            this.dialogFormVisible = false;
            //将表单数据回溯
            this.saveDept = {};
            this.resetForm();
        },
        handleNodeClick(data) {
            //先判断是否是顶级节点
            if (data.pid == -1) {
                this.$message.error('顶级节点不可选择');
                return;
            }
            this.saveDept.pid = data.id;
            this.saveDept.parentName = data.deptName;
        },
        async handleTreeConfirm(data) {
            this.treeDialogVisible = false;
            this.$refs.form.clearValidate('pid');
        },
        closeTree() {
            this.treeDialogVisible = false;
            this.saveDept.pid = -1;
            this.saveDept.parentName = "";
        },
        selectDept() {
            // 将树形结构从接口端查询到的数据赋值给treeData
            this.treeDialogVisible = true;
            deptApi.selectTree().then(res => {
                if (res.code == 200) {
                    res.data[0].disabled = true; // 设置顶级节点为不可选择
                    //console.log(res.data);
                    this.treeData = res.data;
                }
            });
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
            model[key] = 0;
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