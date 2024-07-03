<template>
    <el-main>
        <el-button type="primary" @click="handleAdd" icon="el-icon-plus" style="margin-bottom: 20px;">新增</el-button>
        <!--表格-->
        <el-table :data="tableData" style="width: 100%" border stripe row-key="id"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" :height="tableHeight">
            <el-table-column prop="permissionLabel" label="菜单名称" :min-width="columnWidths[0]">
            </el-table-column>
            <!-- <el-table-column prop="parentLabel" label="上级菜单" :min-width="columnWidths[1]">
            </el-table-column> -->
            <el-table-column prop="permissionType" label="菜单类型" :min-width="columnWidths[2]" align="center">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.permissionType == 0">目录</el-tag>
                    <el-tag v-else-if="scope.row.permissionType == 1" type="success">菜单</el-tag>
                    <el-tag v-else-if="scope.row.permissionType == 2" type="warning">按钮</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="routeName" label="路由名称" :min-width="columnWidths[3]">
            </el-table-column>
            <el-table-column prop="routePath" label="路由地址" :min-width="columnWidths[4]">
            </el-table-column>
            <el-table-column prop="routeUrl" label="路由路径" :min-width="columnWidths[5]" show-overflow-tooltip>
            </el-table-column>
            <el-table-column prop="icon" label="菜单图标" :min-width="columnWidths[6]" align="center">
                <template slot-scope="scope">
                    <i :class="scope.row.icon" v-if="scope.row.icon.indexOf('el-icon') != -1"></i>
                    <svg-icon :icon-class="scope.row.icon" v-else></svg-icon>


                </template>
            </el-table-column>
            <el-table-column label="操作" :min-width="columnWidths[7]">
                <template slot-scope="scope">
                    <el-button type="primary" size="mini" icon="el-icon-edit"
                        @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button type="danger" size="mini" icon="el-icon-delete"
                        @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--表格结束-->
        <!--新增&修改的弹出框-->
        <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
            <el-form :model="savePermission" :rules="rules" ref="form" label-width="80px">
                <el-form-item label="上级菜单" prop="parentLabel">
                    <el-input v-model="savePermission.parentLabel" :readonly="true" placeholder="(不输入该项默认为最上级菜单)"
                        @click.native="selectParent"></el-input>
                </el-form-item>
                <el-form-item label="菜单名称" prop="permissionLabel">
                    <el-input v-model="savePermission.permissionLabel"></el-input>
                </el-form-item>
                <el-form-item label="菜单类型" prop="permissionType">
                    <el-radio-group v-model="savePermission.permissionType">
                        <el-radio-button v-for="(item, index) in typeList" :label="item.value" :key="index">{{
                            item.label }}</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="权限标识" prop="permissionCode">
                    <el-input v-model="savePermission.permissionCode"></el-input>
                </el-form-item>
                <el-form-item label="组件路径" prop="routeUrl" v-if="savePermission.permissionType != 2">
                    <el-input v-model="savePermission.routeUrl"></el-input>
                </el-form-item>
                <el-form-item label="菜单图标" prop="icon">
                    <el-select v-model="savePermission.icon" placeholder="请选择图标">
                        <el-option v-for="item in iconList" :key="item.value" :label="item.label" :value="item.value">
                            <span style="float: left">{{ item.label }}</span>
                            <span style="float:right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelForm">取 消</el-button>
                <el-button type="primary" @click="confirmForm">确 定</el-button>
            </div>
        </el-dialog>
        <!--新增&修改的弹出框结束---->
        <!--上级菜单选择对话框-->
        <el-dialog title="选择上级菜单" :visible.sync="parentDialogVisible">
            <el-tree :data="treeData" :props="{ label: 'permissionLabel', children: 'children', disabled: 'disabled' }"
                @node-click="handleNodeClick" node-key="id" ref="tree" highlight-current empty-text="未获取菜单数据"
                :expand-on-click-node="false" :default-expand-all="true"></el-tree>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelParentDialog">取 消</el-button>
                <el-button type="primary" @click="confirmParentDialog">确 定</el-button>
            </div>
        </el-dialog>
        <!--上级菜单选择对话框结束---->
    </el-main>
</template>

<script>
import permissionApi from '@/api/system_permission';

export default {
    name: 'PermissionList',
    computed: {
        columnWidths() {
            const ratios = [1, 1, 0.6, 1, 1.5, 2, 0.6, 1.5];
            const totalRatio = ratios.reduce((sum, current) => sum + current, 0);
            // 将每个比例转换为百分比字符串
            return ratios.map(ratio => `${(ratio / totalRatio * 100).toFixed(2)}%`);
        }
    },
    data() {
        return {
            tableData: [],
            tableHeight: 0,
            titleMap: {
                create: '新增菜单',
                edit: '编辑菜单'
            },
            dialogStatus: '',
            dialogFormVisible: false,
            parentDialogVisible: false,
            savePermission: {

            },
            typeList: [
                { label: '目录', value: 0 },
                { label: '菜单', value: 1 },
                { label: '按钮', value: 2 }
            ],
            iconList: [
                {
                    value: 'component',
                    label: '根目录'
                },
                {
                    value: 'guide',
                    label: '菜单'
                },
                {
                    value: 'el-icon-plus',
                    label: '新增'
                },
                {
                    value: 'el-icon-delete',
                    label: '删除'
                },
                {
                    value: 'el-icon-edit',
                    label: '修改'
                },
                {
                    value: 'el-icon-search',
                    label: '查询'
                },
            ],
            rules: {
                parentLabel: [
                    { required: true, message: '请输入上级菜单', trigger: 'blur' }
                ],
                permissionLabel: [
                    { required: true, message: '请输入菜单名称', trigger: 'blur' }
                ],
                permissionType: [
                    { required: true, message: '请选择菜单类型', trigger: 'change' }
                ],
                permissionCode: [
                    { required: true, message: '请输入权限标识', trigger: 'blur' }
                ],
                routeUrl: [
                    { required: true, message: '请输入组件路径', trigger: 'blur' }
                ],
                icon: [
                    { required: true, message: '请选择菜单图标', trigger: 'blur' }
                ]
            },
            treeData: [],
        };
    },
    created() {
        this.search();
    },
    mounted() {
        this.$nextTick(() => {
            this.tableHeight = window.innerHeight - 200;
        });
    },
    methods: {
        async search() {
            const res = await permissionApi.search();
            if (res.code == 200) {
                this.tableData = res.data;
            }
        },
        handleAdd() {
            this.dialogStatus = 'create';
            this.dialogFormVisible = true;
            this.savePermission = {};
            this.savePermission.pid = 0;
            this.$nextTick(() => {
                this.$refs.form.clearValidate();
            });
        },
        handleEdit(row) {
            this.savePermission = row;
            this.dialogStatus = 'edit';
            this.dialogFormVisible = true;
            this.$nextTick(() => { this.$refs.form.clearValidate(); });
        },
        handleDelete(row) {
            this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const hasChildren = await permissionApi.hasChildren(row.id);
                if (hasChildren.message == 'yes') {
                    this.$message.error('请先删除子目录');
                    return;
                }
                const res = await permissionApi.delete(row.id);
                if (res.code == 200) {
                    this.$message.success('删除成功');
                    this.search();
                } else {
                    this.$message.error('删除失败');
                }
            }).catch(() => {
                this.$message.info('已取消删除');
            });
        },
        handleNodeClick(data) {
            this.savePermission.pid = data.id;
            this.savePermission.parentLabel = data.permissionLabel;
        },
        confirmForm() {
            if (this.dialogStatus == 'create') {
                this.create();
            } else {
                this.edit();
            }
        },
        cancelForm() {
            this.dialogFormVisible = false;
            this.$refs.form.clearValidate();
        },
        cancelParentDialog() {
            this.parentDialogVisible = false;
            this.savePermission.pid = -1;
            this.savePermission.parentLabel = '';
        },
        confirmParentDialog(data) {
            this.parentDialogVisible = false;
            this.$refs.form.clearValidate('parentLabel');
        },
        async create() {
            this.$refs['form'].validate(async valid => {  //校验
                if (!valid) {
                    return false;
                } else {
                    //新增操作
                    const res = await permissionApi.create(this.savePermission);
                    if (res.code == 200) {
                        this.$message.success('新增成功');
                        this.dialogFormVisible = false;
                        this.search();
                    } else {
                        this.$message.error('新增失败');
                    }
                }

            });
        },
        async edit() {
            this.$refs['form'].validate(async valid => {  //校验
                if (!valid) {
                    return false;
                } else {
                    //更新操作
                    const res = await permissionApi.update(this.savePermission);
                    if (res.code == 200) {
                        this.$message.success('更新成功');
                        this.dialogFormVisible = false;
                        this.search();
                    } else {
                        this.$message.error('更新失败');
                    }
                }

            });
        },
        selectParent() {
            this.parentDialogVisible = true;
            permissionApi.selectTree().then(res => {
                if (res.code == 200) {
                    res.data[0].disabled = true;
                    this.treeData = res.data;
                }
            });
        }
    },
};
</script>

<style></style>