<template>
    <div>
        <el-main>
            <!--表单-->
            <el-form :model="roleModel" :inline="true" style="margin-bottom: 15px" size="small">
                <el-form-item label="角色名称">
                    <el-input v-model="roleModel.roleName" placeholder="请输入角色名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click="searchRoleList">查询</el-button>
                    <el-button type="warning" icon="el-icon-refresh" @click="resetRoleList">重置</el-button>
                    <el-button type="success" icon="el-icon-plus" @click="createRole">新增</el-button>
                    <el-button type="danger" icon="el-icon-delete" @click="deleteRoles">删除选中</el-button>
                </el-form-item>
            </el-form>
            <!--表单结束-->
            <!--表格-->
            <el-table :data="roleList" border stripe style="width:100% ; margin-bottom:20px" row-key="id"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="序号" width="55">
                    <template slot-scope="scope">
                        <span>{{ (start - 1) * size + scope.$index + 1 }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="roleName" label="角色名称" :min-width="columnWidths[0]">
                </el-table-column>
                <el-table-column prop="roleCode" label="角色编码" :min-width="columnWidths[1]">
                </el-table-column>
                <el-table-column prop="remark" label="角色描述" :min-width="columnWidths[2]">
                </el-table-column>
                <el-table-column label="操作" :min-width="columnWidths[3]">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="editRole(scope.row)"
                            icon="el-icon-edit">编辑</el-button>
                        <el-button type="danger" size="mini" @click="deleteRole(scope.row)"
                            icon="el-icon-delete">删除</el-button>
                        <el-button type="success" size="mini" @click="assignPermission(scope.row)"
                            icon="el-icon-setting">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!--表格结束-->
            <!--分页组件-->
            <el-pagination background layout="total, prev, pager, next, jumper" :current-page="start" :page-size="size"
                :total="total" @current-change="search">
            </el-pagination>
            <!--分页组件结束---->
            <!--新增,修改弹框-->
            <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
                <el-form :model="saveRole" :rules="rules" ref="form" label-width="80px">
                    <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="saveRole.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色编码" prop="roleCode">
                        <el-input v-model="saveRole.roleCode"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" prop="remark">
                        <el-input v-model="saveRole.remark" type="textarea" :rows="3"></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="cancelForm">取 消</el-button>
                    <el-button type="primary" @click="confirmForm">确 定</el-button>
                </div>
            </el-dialog>
            <!--弹框结束-->
            <!--分配权限弹框-->
            <el-dialog :title="title" :visible.sync="dialogPermissionVisible" width="40%">
                <el-tree :data="permissionTree" show-checkbox :default-checked-keys="defaultCheckedKeys"
                    ref="permissionTree" node-key="id" :props="defaultProps" default-expand-all empty-text="暂无数据"
                    check-strictly>
                </el-tree>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="cancelPermission">取 消</el-button>
                    <el-button type="primary" @click="confirmPermission">确 定</el-button>
                </div>
            </el-dialog>
            <!--弹框结束-->
        </el-main>
    </div>
</template>

<script>
import roleApi from '@/api/auto_role'
export default {
    computed: {
        columnWidths() {
            const ratios = [2, 2, 3, 2.5];
            const totalRatio = ratios.reduce((sum, current) => sum + current, 0);
            // 将每个比例转换为百分比字符串
            return ratios.map(ratio => `${(ratio / totalRatio * 100).toFixed(2)}%`);
        }
    },
    data() {
        return {
            roleModel: {},
            roleList: [],
            total: 0,
            start: 1,
            size: 7,
            titleMap: {
                create: '新增角色',
                edit: '编辑角色'
            },
            dialogStatus: '',
            dialogFormVisible: false,
            dialogPermissionVisible: false,
            saveRole: {},
            rules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' }
                ],
                roleCode: [
                    { required: true, message: '请输入角色编码', trigger: 'blur' }
                ],
            },
            lines: [],
            permissionTree: [],
            title: '',
            defaultProps: {
                children: 'children',
                label: 'permissionLabel'
            },
            defaultCheckedKeys: [],
            roleId: '',
        }
    },
    created() {
        this.search();
    },
    methods: {
        async search(start = 1) {
            this.start = start;
            this.roleModel.createrId = this.$store.getters.createrId;
            const res = await roleApi.search(this.start, this.size, this.roleModel);
            if (res.code == 200) {
                this.roleList = res.data.records;
                this.total = res.data.total;
                this.size = res.data.size;
                this.start = res.data.current;
            }
        },
        searchRoleList() {
            this.search();
        },
        resetRoleList() {
            this.roleModel = {};
            this.roleList = [];
            this.search();
        },
        createRole() {
            this.dialogStatus = 'create';
            this.dialogFormVisible = true;
            this.saveRole = {};
            this.$nextTick(() => {
                this.$refs.form.clearValidate();
            });
        },
        deleteRoles() {
            if (this.lines.length == 0) {
                this.$message.error('请选择要删除的数据');
                return;
            } else {
                this.$confirm('此操作将永久删除选中的角色, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    //每个角色依次删除
                    this.lines.forEach(async item => {
                        const res = await roleApi.hasUser(item);
                        if (res.message == 'yes') {
                            this.$message.error('该角色下有用户，无法删除');
                        } else {
                            const res = await roleApi.delete(item);
                            if (res.code == 200) {
                                this.$message.success('删除成功');
                                this.search();
                            } else {
                                this.$message.error(res.msg);
                            }
                        }
                    });
                }).catch(() => {
                    //不抓取异常
                });
            }
        },
        editRole(row) {
            this.dialogStatus = 'edit';
            this.saveRole = row;
            this.dialogFormVisible = true;
            this.$nextTick(() => {
                this.$refs.form.clearValidate();
            });
        },
        deleteRole(row) {
            roleApi.hasUser(row.id).then(res => {
                if (res.message == 'yes') {
                    this.$message.error('该角色下有用户，无法删除');
                } else {
                    this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(async () => {
                        const res = await roleApi.delete(row.id);
                        if (res.code == 200) {
                            this.$message.success('删除成功');
                            this.search();
                        } else {
                            this.$message.error(res.msg);
                        }
                    }).catch(() => {
                        //不抓取异常
                    });
                }
            }

            )
        },
        handleSelectionChange(val) {
            this.lines = [];
            val.forEach(item => {
                this.lines.push(item.id);
            });
        },
        cancelForm() {
            this.dialogFormVisible = false;
            this.$refs.form.clearValidate();
            this.resetRoleList();
        },
        confirmForm() {
            if (this.dialogStatus == 'create') {
                this.create();
            } else {
                this.edit();
            }
        },
        assignPermission(row) {
            this.roleId = row.id;
            this.title = `${row.roleName}权限分配`;
            this.dialogPermissionVisible = true;
            let data = { roleId: row.id, userId: this.$store.getters.createrId };
            roleApi.permissionTree(data).then(res => {
                if (res.code == 200) {
                    this.permissionTree = res.data.permissionList;
                    this.$refs.permissionTree.setCheckedKeys(res.data.checkedList);
                    //this.defaultCheckedKeys= res.data.checkedList;
                }
            });
        },
        cancelPermission() {
            this.dialogPermissionVisible = false;
            this.$refs.permissionTree.setCheckedKeys([]);
        },
        confirmPermission() {
            let checkedKeys = this.$refs.permissionTree.getCheckedKeys();  //选中的节点
            let halfCheckedKeys = this.$refs.permissionTree.getHalfCheckedKeys();  //半选中的节点
            let checkedList = checkedKeys.concat(halfCheckedKeys);  //合并选中的节点和半选中的节点, 结果为: 例如 [1,2,3,4,5]

            roleApi.saveRolePermission(this.roleId, checkedList).then(res => {
                if (res.code == 200) {
                    this.$message.success('分配成功');
                    this.dialogPermissionVisible = false;
                    //清除一下选中的节点
                    this.$refs.permissionTree.setCheckedKeys([]);
                } else {
                    this.$message.error(res.msg);
                }
            });
        },
        create() {
            this.$refs.form.validate(async valid => {
                if (valid) {
                    this.saveRole.createrId = this.$store.getters.createrId;
                    const res = await roleApi.create(this.saveRole);
                    if (res.code == 200) {
                        this.$message.success('新增成功');
                        this.dialogFormVisible = false;
                        this.search();
                    } else {
                        this.$message.error(res.msg);
                    }
                }
            });
        },
        edit() {
            this.$refs.form.validate(async valid => {
                if (valid) {
                    const res = await roleApi.edit(this.saveRole);
                    if (res.code == 200) {
                        this.$message.success('编辑成功');
                        this.dialogFormVisible = false;
                        this.search();
                    } else {
                        this.$message.error(res.msg);
                    }
                }
            });
        }
    }
}
</script>
<style></style>