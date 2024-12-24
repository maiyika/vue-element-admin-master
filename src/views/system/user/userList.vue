<template>
    <div>
        <el-container :style="{ height: containerHeight + 'px' }" class="contain">
            <!--左侧导航栏 部门树-->
            <el-aside width="200px" class="el-aside">
                <el-tree :data="treeData" :props="defaultProps" node-key="id" empty-text="暂无数据"
                    :expand-on-click-node="false" :highlight-current="true" :default-expand-all="true"
                    @node-click="handleNodeClick1">
                </el-tree>
            </el-aside>
            <!--右侧内容区-->
            <!--查询表单-->
            <el-main>
                <el-form :inline="true" :model="userModel" size="small" style="width:100%; ">
                    <el-form-item style="width:150px;">
                        <el-input v-model="userModel.username" placeholder="请输入用户名"></el-input>
                    </el-form-item>
                    <el-form-item style="width:150px;">
                        <el-input v-model="userModel.realname" placeholder="真实姓名"></el-input>
                    </el-form-item>
                    <el-form-item style="width:150px;">
                        <el-input v-model="userModel.nickname" placeholder="昵称"></el-input>
                    </el-form-item>
                    <el-form-item style="width:150px;">
                        <el-input v-model="userModel.phone" placeholder="联系电话"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-search" @click="searchUser">查询</el-button>
                        <el-button type="warning" icon="el-icon-refresh" @click="reset">重置</el-button>
                        <el-button type="success" icon="el-icon-plus" @click="createUser">新增</el-button>
                        <el-button type="danger" icon="el-icon-delete" @click="deleteUsers">删除选中</el-button>
                    </el-form-item>
                </el-form>
                <!--表格-->
                <el-table :data="tableData" border stripe style="width: 100%; margin-bottom: 20px;"
                    @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="55"></el-table-column>
                    <el-table-column label="序号" width="55">
                        <template slot-scope="scope">
                            <span>{{ (start - 1) * size + scope.$index + 1 }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="username" label="用户名" :min-width="columnWidths[0]"
                        show-overflow-tooltip></el-table-column>
                    <el-table-column prop="realname" label="真实姓名" :min-width="columnWidths[1]"
                        show-overflow-tooltip></el-table-column>
                    <el-table-column prop="nickname" label="昵称" :min-width="columnWidths[2]"
                        show-overflow-tooltip></el-table-column>
                    <el-table-column prop="deptName" label="部门" :min-width="columnWidths[3]"
                        show-overflow-tooltip></el-table-column>
                    <el-table-column prop="gender" label="性别" :min-width="columnWidths[4]">
                        <template slot-scope="scope">
                            <el-tag v-if="scope.row.gender === 1" type="success">男</el-tag>
                            <el-tag v-else type="danger">女</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="phone" label="手机号" :min-width="columnWidths[5]"
                        show-overflow-tooltip></el-table-column>
                    <el-table-column prop="email" label="邮箱" :min-width="columnWidths[6]"
                        show-overflow-tooltip></el-table-column>
                    <el-table-column prop="avatar" label="头像" :min-width="columnWidths[7]">
                        <template slot-scope="scope">
                            <a :href="scope.row.avatar" target="_blank"><el-tag>查看头像</el-tag></a>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200" :min-width="columnWidths[8]">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini"
                                @click="editUser(scope.row)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini"
                                @click="deleteUser(scope.row)">删除</el-button>
                            <el-button type="text" icon="el-icon-plus" size="mini"
                                @click="handleRole(scope.row)">绑定角色</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <!--分页组件-->
                <el-pagination background layout="total, prev, pager, next, jumper" :current-page="start"
                    :page-size="size" :total="total" @current-change="search">
                </el-pagination>
                <!--新增,修改弹框-->
                <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible" width="65%">
                    <el-form :model="saveUser" :rules="rules" ref="form" label-width="80px" :inline="true">
                        <el-form-item label="部门" prop="deptName">
                            <el-input v-model="saveUser.deptName" :readonly="true" ref="deptName"
                                @click.native="openDeptSelect"></el-input>
                        </el-form-item>
                        <el-form-item label="用户名" prop="username">
                            <el-input v-model="saveUser.username"></el-input>
                        </el-form-item>
                        <el-form-item label="密码" prop="password" v-if="dialogStatus == 'create'">
                            <el-input v-model="saveUser.password" type="password"></el-input>
                        </el-form-item>
                        <el-form-item label="真实姓名" prop="realname">
                            <el-input v-model="saveUser.realname"></el-input>
                        </el-form-item>
                        <el-form-item label="昵称" prop="nickname">
                            <el-input v-model="saveUser.nickname"></el-input>
                        </el-form-item>
                        <el-form-item label="性别" prop="gender">
                            <el-radio-group v-model="saveUser.gender">
                                <el-radio-button label="1">男</el-radio-button>
                                <el-radio-button label="2">女</el-radio-button>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="手机号" prop="phone">
                            <el-input v-model="saveUser.phone"></el-input>
                        </el-form-item>
                        <el-form-item label="邮箱" prop="email">
                            <el-input v-model="saveUser.email"></el-input>
                        </el-form-item>
                        <el-form-item label="头像" prop="avatar">
                            <el-upload class="avatar-uploader" :action="uploadPath" list-type="picture-card"
                                :before-upload="beforeAvatarUpload" :on-success="handleAvatarSuccess"
                                :show-file-list="false" :data="uploadToken">
                                <img v-if="saveUser.avatar" :src="saveUser.avatar" class="avatar">
                                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                            </el-upload>
                        </el-form-item>
                    </el-form>
                    <div slot="footer" class="dialog-footer">
                        <el-button @click="cancelForm">取 消</el-button>
                        <el-button type="primary" @click="confirmForm">确 定</el-button>
                    </div>
                </el-dialog>
                <!--选择部门树-->
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
                <!--绑定角色-->
                <el-dialog title="角色绑定" :visible.sync="dialogRoleVisible">
                    <el-checkbox-group v-model="roleIds" >
                        <el-checkbox v-for="item in roleList" :label="item.id" :key="item.id">{{ item.roleName
                            }}</el-checkbox>
                    </el-checkbox-group>
                    <div slot="footer" class="dialog-footer">
                        <el-button @click="clearBind">取消</el-button>
                        <el-button type="primary" @click="handleBindRole">确定</el-button>
                    </div>
                </el-dialog>
            </el-main>
        </el-container>
    </div>
</template>

<script>
import deptApi from '@/api/system_dept'
import userApi from '@/api/auto_user'
import roleApi from '@/api/auto_role'
import { getToken } from '@/utils/auth';
export default {
    computed: {
        columnWidths() {
            const ratios = [0.7, 0.7, 0.7, 1, 0.6, 0.8, 0.9, 0.8, 2];
            const totalRatio = ratios.reduce((sum, current) => sum + current, 0);
            // 将每个比例转换为百分比字符串
            return ratios.map(ratio => `${(ratio / totalRatio * 100).toFixed(2)}%`);
        }
    },
    data() {
        return {
            treeData: [],
            defaultProps: {
                children: 'children',
                label: 'deptName'
            },
            containerHeight: document.documentElement.clientHeight - 85,
            userModel: {},
            tableData: [],
            start: 1,
            size: 7,
            total: 0,
            dialogFormVisible: false,
            titleMap: {
                create: '新增用户',
                edit: '编辑用户'
            },
            dialogStatus: '',
            saveUser: {},
            rules: {
                deptName: [
                    { required: true, message: '请选择部门', trigger: 'blur' }
                ],
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                ],
                realname: [
                    { required: true, message: '请输入真实姓名', trigger: 'blur' }
                ],
                gender: [
                    { required: true, message: '请选择性别', trigger: 'blur' }
                ],
            },
            treeDialogVisible: false,
            uploadPath: process.env.VUE_APP_BASE_API + 'rental/oss/upload',
            uploadToken: {
                token: getToken()
            },
            deleteIds: [],
            dialogRoleVisible: false,
            roleList: [],
            roleIds: [],
        }
    },
    created() {
        this.getTreeData();
        this.search();
    },
    mounted() {
        window.onresize = () => {  // 监听窗口大小变化
            this.containerHeight = document.documentElement.clientHeight - 85;
        }
    },
    methods: {
        async getTreeData() {
            let res = await deptApi.selectTree();
            if (res.code == 200) {
                this.treeData = res.data;
            }
        },
        async search(start = 1) {
            let res = await userApi.search(this.start, this.size, this.userModel);
            if (res.code == 200) {
                this.tableData = res.data.records;
                this.total = res.data.total;
            }
        },
        handleNodeClick1(data) {
            this.userModel.deptId = data.id;
            this.search();
        },
        searchUser() {
            this.search();
        },
        reset() {
            this.userModel = {};
            this.tableData = [];
            this.search();
        },
        createUser() {
            this.dialogStatus = 'create';
            this.dialogFormVisible = true;
            this.saveUser = {};
            this.$nextTick(() => {
                this.$refs.form.clearValidate();
            });
        },
        deleteUsers() {
            if (this.deleteIds.length == 0) {
                this.$message.warning('请选择要删除的数据');
                return;
            }
            this.$confirm('此操作将永久删除选中的用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteIds.forEach(id => {
                    if (id == this.$store.getters.createrId) {
                        this.$message.warning('不能删除自己');
                        return;
                    }
                    if (id == 1) {
                        this.$message.warning('不能删除超级管理员');
                        return;
                    }
                    userApi.delete(id).then(res => {
                        if (res.code == 200) {
                            this.$message.success('删除成功');
                            this.search();
                        } else {
                            this.$message.error('删除失败');
                        }
                    })
                });
            }).catch(() => {
                this.$message.info('已取消删除');
            });
        },
        editUser(row) {
            this.dialogStatus = 'edit';
            this.dialogFormVisible = true;
            this.saveUser = row;
            this.$nextTick(() => {
                this.$refs.form.clearValidate();
            });
        },
        async handleRole(row) {
            this.saveUser = row;
            //获取所有角色列表
            roleApi.list().then(res => {
                if (res.success) {
                    this.roleList = res.data;
                }
            })
            //获取用户绑定过的角色
            userApi.selectRoleIdByUserId(row.id).then(res => {
                if (res.success) {
                    this.roleIds = res.data;
                }
            })
            //绑定角色
            this.dialogRoleVisible = true;
        },
        deleteUser(row) {
            if (row.id == this.$store.getters.createrId) {
                this.$message.warning('不能删除自己');
                return;
            }
            if (row.id == 1) {
                this.$message.warning('不能删除超级管理员');
                return;
            }
            this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                userApi.delete(row.id).then(res => {
                    if (res.code == 200) {
                        this.$message.success('删除成功');
                        this.search();
                    } else {
                        this.$message.error('删除失败');
                    }
                });
            }).catch(() => {
                this.$message.info('已取消删除');
            });
        },
        handleSelectionChange(val) {
            this.deleteIds = val.map(item => item.id);
            console.log(this.deleteIds);
        },
        openDeptSelect() {
            this.treeDialogVisible = true;
            deptApi.selectTree().then(res => {
                if (res.code == 200) {
                    this.treeData = res.data;
                }
            });
        },
        cancelForm() {
            this.dialogFormVisible = false;
        },
        confirmForm() {
            if (this.dialogStatus == 'create') {
                this.create();
            } else {
                this.update();
            }
        },
        create() {
            this.$refs.form.validate(async valid => {
                if (valid) {
                    let res = await userApi.create(this.saveUser);
                    if (res.code == 200) {
                        this.$message.success('新增成功');
                        this.dialogFormVisible = false;
                        this.search();
                    }
                }
            });
        },
        update() {
            this.$refs.form.validate(async valid => {
                if (valid) {
                    let res = await userApi.edit(this.saveUser);
                    if (res.code == 200) {
                        this.$message.success('修改成功');
                        this.dialogFormVisible = false;
                        this.search();
                    }
                }
            });
        },
        closeTree() {
            this.treeDialogVisible = false;
            this.saveUser.deptId = '';
            this.saveUser.deptName = '';
        },
        handleTreeConfirm() {
            this.treeDialogVisible = false;
            this.$refs.form.clearValidate('deptName');
        },
        handleNodeClick(data) {
            this.saveUser.deptId = data.id;
            this.saveUser.deptName = data.deptName;
        },
        beforeAvatarUpload(file) {
            const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
            const isLt2M = file.size / 1024 / 1024 < 2;

            if (!isJPG) {
                this.$message.error('上传头像图片只能是 JPG或PNG 格式!');
            }
            if (!isLt2M) {
                this.$message.error('上传头像图片大小不能超过 2MB!');
            }
            return isJPG && isLt2M;
        },
        handleAvatarSuccess(res, file) {
            this.saveUser.avatar = res.data;
            this.$forceUpdate();
        },
        clearBind() {
            this.dialogRoleVisible = false;
            this.roleIds = [];
        },
        handleBindRole() {
            
            this.roleIds = this.roleIds.filter(item => item != null);
            if (this.roleIds.length == 0) {
                this.$message.warning('请选择绑定角色');
                return;
            }
            userApi.bindRole(this.saveUser.id, this.roleIds).then(res => {
                if (res.code == 200) {
                    this.$message.success('绑定成功');
                    this.dialogRoleVisible = false;
                }else{
                    this.$message.error('绑定失败');
                    this.dialogRoleVisible = false;
                }
            });
        },

    }
}
</script>
<style>
.contain {
    height: 100%;
    overflow: hidden;
}

.el-aside {
    background-color: white;
    border-right: 2px solid #ebeef5;
    padding: 10px;
    height: 100%;
    overflow: auto;
}

.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar-uploader .el-upload:hover {
    border-color: #409EFF;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
}

.avatar {
    width: 178px;
    height: 178px;
    display: block;
}
</style>
