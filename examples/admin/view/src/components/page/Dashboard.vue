<template>
    <div>
        <el-card shadow="hover" class="mgb20" style="height:252px;">
          <div>server info:</div>
          <div>{{serverData}}</div>
          <div>server operations:</div>
          <div>port:1358</div>
          <div>...</div>
           <el-button type="primary" @click="serverStart">service start</el-button>

           <el-button type="info" @click="serverStop">service stop</el-button>
        </el-card>
       
    </div>
</template>

<script>
import bus from '../common/bus';
import {serverInfo,serverStart,serverStop} from '../../api/server'
export default {
    name: 'dashboard',
    data() {
        return {
            serverData:{}
        };
    },
    components: {
        
    },
    computed: {

    },
    mounted() {
        this.init()
    },
    methods: {
       async init(){
           this.serverData=await serverInfo()
        },
     async serverStart(){
         if( await serverStart()=="OK"){
             this.$message.success('启动成功');
         }
     },
     async serverStop(){
           if( await serverStop()=="OK"){
             this.$message.success('服务已停止');
         }
     }
    }
};
</script>


<style scoped>
.el-row {
    margin-bottom: 20px;
}

.grid-content {
    display: flex;
    align-items: center;
    height: 100px;
}

.grid-cont-right {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: #999;
}

.grid-num {
    font-size: 30px;
    font-weight: bold;
}

.grid-con-icon {
    font-size: 50px;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
    color: #fff;
}

.grid-con-1 .grid-con-icon {
    background: rgb(45, 140, 240);
}

.grid-con-1 .grid-num {
    color: rgb(45, 140, 240);
}

.grid-con-2 .grid-con-icon {
    background: rgb(100, 213, 114);
}

.grid-con-2 .grid-num {
    color: rgb(45, 140, 240);
}

.grid-con-3 .grid-con-icon {
    background: rgb(242, 94, 67);
}

.grid-con-3 .grid-num {
    color: rgb(242, 94, 67);
}

.user-info {
    display: flex;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 2px solid #ccc;
    margin-bottom: 20px;
}

.user-avator {
    width: 120px;
    height: 120px;
    border-radius: 50%;
}

.user-info-cont {
    padding-left: 50px;
    flex: 1;
    font-size: 14px;
    color: #999;
}

.user-info-cont div:first-child {
    font-size: 30px;
    color: #222;
}

.user-info-list {
    font-size: 14px;
    color: #999;
    line-height: 25px;
}

.user-info-list span {
    margin-left: 70px;
}

.mgb20 {
    margin-bottom: 20px;
}

.todo-item {
    font-size: 14px;
}

.todo-item-del {
    text-decoration: line-through;
    color: #999;
}

.schart {
    width: 100%;
    height: 300px;
}
</style>
