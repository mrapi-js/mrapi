<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> service roouter list
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" icon="el-icon-plus" @click="handleAdd">add</el-button>
            </div>
            <el-table
                :data="tableData"
                border
                class="table"
                ref="multipleTable"
                header-cell-class-name="table-header"
                @selection-change="handleSelectionChange"
            >
                <el-table-column prop="name" label="router type"></el-table-column>
                <el-table-column prop="regexp" label="regexp"></el-table-column>
                <el-table-column label="操作" width="220" align="center">
                    <template slot-scope="scope">
                       
                        <el-button
                            type="text"
                            icon="el-icon-delete"
                            class="red"
                            @click="handleDelete(scope.$index, scope.row)"
                        >remove</el-button>
                        <el-button
                            type="text"
                            icon="el-icon-lx-attention"
                            class="red"
                            @click="handleGraphqlUi(scope.$index, scope.row)"
                        >graphql-ui</el-button>
                    </template>
                </el-table-column>
            </el-table>
           
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="add router" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="120px">
                
                <el-form-item label="select schema">
                     <el-select v-model="form.name" placeholder="请选择" >
                         <el-option
                            v-for="item in schemaSelectData"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                            </el-option>
                        
                     </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { routerList,routerRemove ,routerAdd} from '../../api/router';
import { schemaList} from '../../api/schema';
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
            schemaSelectData:[]
        };
    },
    created() {
        this.getData();
        this.schemaSelect()
    },
   
    methods: {
        async schemaSelect(){
           const res=await schemaList()
           let arr=[]
               for(let item of res){
                   if(!item.client){
                       continue
                   }
                   arr.push({
                       label:item.name,
                       value:item.name
                   })
               }
               this.schemaSelectData= arr
        },
        // 获取 easy-mock 的模拟数据
        getData() {
            routerList(this.query).then(res => {
                console.log(res);
                let arr=[]
                for(let item of res){
                   if(item.name=="graphqlMiddleware"){
                      arr.push(item) 
                   }
                }
                this.tableData = arr;
                this.pageTotal = arr.length;
            });
        },
        
       async  handleAdd() {
           await this.schemaSelect()
           this.editVisible=true
        },
        // 删除操作
        handleDelete(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                 routerRemove(row.regexp).then(res=>{
                   this.$message.success('删除成功');
                    this.getData();
                 }).catch(err=>{
                      this.$message.error(`删除失败`);
                 })
            })
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        delAllSelection() {
            const length = this.multipleSelection.length;
            let str = '';
            this.delList = this.delList.concat(this.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += this.multipleSelection[i].name + ' ';
            }
            this.$message.error(`删除了${str}`);
            this.multipleSelection = [];
        },
        // 编辑操作
        handleEdit(index, row) {
            this.idx = index;
            this.form = row;
            this.editVisible = true;
        },
        // 保存编辑
        saveEdit() {
            this.editVisible = false;
             routerAdd(this.form.name).then(res=>{
                this.$message.success(`add success`);
                this.getData();
             })
        },
        handleGraphqlUi(index, row){
            
           let name=row.regexp.replace("/^\/",'')
           
           window.open(`http://localhost:1358/${name}`, "_blank"); 
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
