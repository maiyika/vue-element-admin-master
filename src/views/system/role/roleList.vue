<template>
    <div>
        <el-main>
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
        </el-main>
    </div>
</template>

<script>
import roleApi from '@/api/auto_role'
export default {
    data() {
        return {
            roleModel: {
                roleName: ''
            }
        }
    },
    methods: {
        searchRoleList() {
            this.$refs.roleList.searchRoleList(this.roleModel)
        },
        resetRoleList() {
            this.roleModel.roleName = ''
            this.$refs.roleList.searchRoleList(this.roleModel)
        },
        createRole() {
            this.$refs.roleList.createRole()
        },
        deleteRoles() {
            this.$refs.roleList.deleteRoles()
        }
    }
}
</script>
<style></style>