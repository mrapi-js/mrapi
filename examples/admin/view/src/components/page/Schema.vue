<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> schema list
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
             <div class="handle-box">
                <el-button type="primary" icon="el-icon-plus" @click="handleAdd">create</el-button>
            </div>
            <el-table
                v-loading="loading"
                :data="tableData"
                border
                class="table"
                ref="multipleTable"
                header-cell-class-name="table-header"
                @selection-change="handleSelectionChange"
            >
                <el-table-column prop="name" label="schema name"></el-table-column>
                <el-table-column prop="ctime" label="ctime"></el-table-column>
                <el-table-column prop="mtime" label="mtime"></el-table-column>
                <el-table-column prop="birthtime" label="birthtime"></el-table-column>
                <el-table-column prop="size" label="size" width="100"></el-table-column>
                <el-table-column label="operation" width="360" align="center">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            icon="el-icon-edit"
                            @click="handleEdit(scope.$index, scope.row)"
                        >edit</el-button>
                        <el-button
                            type="text"
                            icon="el-icon-delete"
                            class="red"
                            @click="handleDelete(scope.$index, scope.row)"
                        >delete</el-button>
                        <el-button 
                            type="text"
                            icon="el-icon-lx-edit"
                            class="black"
                            @click="handleGenerate(scope.$index, scope.row)"
                        >{{scope.row.client?'re-generate':'generate'}}</el-button>
                         <el-button v-if="scope.row.client"
                            type="text"
                            icon="el-icon-delete"
                            class="red"
                            @click="handleRemove(scope.$index, scope.row)"
                        >remove-client</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="query.pageIndex"
                    :page-size="query.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog :title="addFlag?'create new':'edit'" :visible.sync="editVisible" width="70%">
            <el-form ref="form" :model="form" label-width="120px">
                <el-form-item label="schema name">
                    <el-input v-model="form.name" :readOnly="!addFlag"></el-input>
                </el-form-item>
                <el-form-item label="content">
                    <el-input type="textarea" :rows="20" v-model="form.content"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">cancel</el-button>
                <el-button type="primary" @click="saveEdit">submit</el-button>
            </span>
        </el-dialog>
    </div>
</template>


<script>
import { schemaList,schemaGet,schemaDelete ,schemaUpdate,schemaCreate,schemaGenerate,schemaGenerateRemove} from '../../api/schema';
export default {
    name: 'basetable',
    data() {
        return {
            query: {
                address: '',
                name: '',
                pageIndex: 1,
                pageSize: 10
            },
            tableData: [],
            multipleSelection: [],
            delList: [],
            editVisible: false,
            pageTotal: 0,
            form: {},
            idx: -1,
            id: -1,
            addFlag:false,
            loading:false
        };
    },
    created() {
        this.getData();
    },
    methods: {
        // 获取 easy-mock 的模拟数据
        getData() {
            schemaList(this.query).then(res => {
                console.log(res);
                this.tableData = res;
                this.pageTotal = res.length;
            });
        },
        //新增
        handleAdd(){
           this.addFlag=true
           this.form={ content:null,name:null }
            this.editVisible = true;

        },
        // 触发搜索按钮
        handleSearch() {
            this.$set(this.query, 'pageIndex', 1);
            this.getData();
        },
        // 删除操作
        handleDelete(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    schemaDelete(row.name).then(res=>{
                       this.$message.success('删除成功');
                       this.getData();
                    })
                    
                })
                .catch(() => {});
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
       
        // 编辑操作
        handleEdit(index, row) {
            this.addFlag=false
            this.idx = index;
            //this.form = row;
           
            schemaGet(row.name).then(res=>{
                
                this.form={
                    content:res,
                    name:row.name
                }
            })
            this.editVisible = true;

        },
        handleGenerate(index,row){
             this.$confirm('执行generate前确保schema文件格式正确', '提示', {
                type: 'warning'
            }).then(() => {
                  this.loading=true
                    schemaGenerate(row.name).then(res=>{
                        this.$message.success(`generate 执行成功`);
                         this.loading=false
                    }).catch(err=>{
                        this.loading=false
                    })
                })
        },
        handleRemove(index,row){
            this.$confirm('删除client将卸载路由', '提示', {
                type: 'warning'
            }).then(() => {
                 this.loading=true
                schemaGenerateRemove(row.name).then(res=>{
                    this.$message.success(`remove client 执行成功`);
                    this.loading=false
                    this.getData();
                 }).catch(err=>{
                        this.loading=false
                 })
            })
        },
        // 保存编辑
        saveEdit() {
            if(!this.addFlag){
                schemaUpdate(this.form.name,this.form).then(res=>{
                    this.editVisible = false;
                    this.$message.success(`修改${this.form.name} 行成功`);
                    this.getData();
                })
            }else{
                 schemaCreate(this.form.name,this.form).then(res=>{
                    this.editVisible = false;
                    this.$message.success(`add new success`);
                    this.getData();
                })
            }
           
        },
        // 分页导航
        handlePageChange(val) {
            this.$set(this.query, 'pageIndex', val);
            this.getData();
        }
    }
};
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 300px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 14px;
}
.red {
    color: #ff0000;
}
.black{
    color: #000000;

}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
</style>
