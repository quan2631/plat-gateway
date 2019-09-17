<template>
    <div>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.id" placeholder="唯一标识"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getRouter">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" plain @click="addRouter">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>


        <el-table :data="routerInfoList" style="width: 100%">
            <el-table-column :show-overflow-tooltip=true prop="route_definition.id" label="唯一标识" width="400">
            </el-table-column>
            <el-table-column prop="route_definition.uri" label="转发地址" width="200">
            </el-table-column>
            <el-table-column :show-overflow-tooltip=true prop="route_definition.predicates[0].args._genkey_0" label="拦截路径" width="200">
            </el-table-column>  
            <el-table-column :show-overflow-tooltip=true prop="route_definition.filters[0].args._genkey_2" label="描述" width="180">
            </el-table-column>
            <!--第二步  开始进行修改和查询操作-->
            <el-table-column label="操作" align="center" min-width="100">

                <template slot-scope="scope">

                    <el-button type="text" @click="checkDetail(scope.row)">查看详情</el-button>

                    <el-button type="primary" plain @click="modifyRouter(scope.row)">修改</el-button>

                    <el-button type="primary" plain @click="deleteRouter(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--新增界面-->
        <el-dialog title="新增/修改" :visible.sync="dialogVisible" width="70%" :close-on-click-modal="false">
            
            <el-form :model="addFormData" :rules="addRule" ref="addFormData" label-width="100px" class="demo-ruleForm login-container">
                <el-form-item  v-if="!isUpdate" prop="id" label="唯一标识">
                    <el-input type="text" v-model="addFormData.id"  placeholder="如：wish.plat-base.HelloService.sayHello，分别表示组别、工程名、类名、方法名"></el-input>
                </el-form-item>
                <div class="element-switch-patch">
                    <el-form-item prop="protocolType" label="协议类型">
                        <el-radio-group v-model="addFormData.protocolType" @change="protocolTypeChange">
                            <el-radio label="HTTP">HTTP</el-radio>
                            <el-radio label="SOFA">SOFA</el-radio>
                            <el-radio label="FSP">FSP</el-radio>                   
                            <el-radio label="OTHER" disabled>OTHER</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </div>
                <el-form-item prop="hostUrl" label="转发地址">
                    <el-input type="text" v-model="addFormData.hostUrl"  placeholder="如：172.29.12.100:12201，表示重定向的服务器位置、请注意端口">
                        <template  v-if="addFormData.protocolType==='SOFA'"  slot="prepend">bolt://</template>
                        <template  v-if="addFormData.protocolType==='HTTP'"  slot="prepend">http://</template>
                        <template  v-if="addFormData.protocolType==='FSP'"   slot="prepend">fsp://</template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="path" label="拦截路径">
                    <el-input type="text" v-model="addFormData.path"  placeholder="如：/base/api/oper/getOperListByOrg/**，与接口@Path对应、支持POST"></el-input>
                </el-form-item>
                <div class="element-switch-patch">
                    <el-form-item prop="isOn" label="是否启用">
                        <el-switch v-model="addFormData.isOn" active-value="true" inactive-value="false"></el-switch>
                    </el-form-item>
                </div>
                 <el-form-item prop="RPCInterface" label="类名" v-if="addFormData.protocolType==='SOFA'">
                    <el-input type="text" v-model="addFormData.RPCInterface"  placeholder="如：com.wish.plat.base.api.OperService，表示RPC对应接口"></el-input>
                </el-form-item>
                <el-form-item prop="RPCMethod" label="方法名" v-if="addFormData.protocolType==='SOFA'">
                    <el-input type="text" v-model="addFormData.RPCMethod"  placeholder="如：getOperListByOrg，表示接口对应的方法"></el-input>
                </el-form-item>
                <el-form-item prop="RPCParams" label="参数" v-if="addFormData.protocolType==='SOFA'">
                    <el-input type="text" v-model="addFormData.RPCParams"  placeholder="如：{'city_id': 'java.lang.String'}，表示参数名称和类型、可为空。尤其注意'java.lang.String'的格式、使用标准JSON"></el-input>
                </el-form-item>
                <el-form-item prop="descr" label="描述">
                    <el-input type="text" v-model="addFormData.descr" placeholder="请添加描述"></el-input>
                </el-form-item>
                <el-form-item prop="example" label="调用样例">
                    <el-input type="textarea"  :rows="4" v-model="addFormData.example" placeholder="请添加调用样例"></el-input>
                </el-form-item>
            </el-form>
                       
            <span slot="footer" class="dialog-footer">
                <el-button @click.native="dialogVisible = false,addFormData={}">取 消</el-button>
                <el-button v-if="isView & isUpdate" type="primary" @click.native="updateSubmit">保 存</el-button>
                 <el-button v-if="isView & !isUpdate" type="primary" @click.native="addSubmit">确 定</el-button>
            </span>
        </el-dialog>
    </div>

</template>

<script>
    import {} from '../api/api';
    import axios from 'axios';
    import qs from 'qs';
    export default {
        name: 'home',
        data() {
            return {
                routerInfoList: [], // 列表显示数据
                isUpdate: true, // 表示修改数据
                dialogVisible: false,
                isView: true, // 是否显示提交按钮
                // 当前页面的表单数据
                addFormData: {
                    id : '', // 唯一标识
                    protocolType: 'HTTP', // 协议类型，默认Http
                    hostUrl: '',
                    path: '',
                    isOn: 'true',
                    RPCInterface: '',
                    RPCMethod: '',
                    RPCParams: '',
                    descr: '', // 描述
                    example: '' // 调用样例
                },
                // 提交到后的封装数据
                submitData: {
                    id: '', // 路由ID
                    hostUrl: '', // 拦截后重定向的服务器位置
                    predicates: [
                        {name: "Path", args: {_genkey_0: ''}} // 拦截路径
                    ],
                    // 过滤器
                    filters:[
                        {name: "SofaAdapt", args: {
                            _genkey_0: true, // 是否启动
                            _genkey_1: "", // 协议类型
                            _genkey_2: "", // 描述
                            _genkey_3: "" // 调用样例
                        }}
                    ]
                },
                addRule: {
                    id: [{
                        required: true,
                        message: '该字段不能为空',
                        trigger: 'blur'
                    }],
                    protocolType: [{
                        required: true,
                        message: '该字段不能为空',
                        trigger: 'blur'
                    }],
                    RPCInterface: [{
                        required: true,
                        message: '该字段不能为空',
                        trigger: 'blur'
                    }],
                    hostUrl: [{
                        required: true,
                        message: '该字段不能为空',
                        trigger: 'blur'
                    }],
                    path: [{
                        required: true,
                        message: '该字段不能为空',
                        trigger: 'blur'
                    }],
                    isOn: [{
                        required: true,
                        message: '该字段不能为空',
                        trigger: 'blur'
                    }],
                    RPCMethod: [{
                        required: true,
                        message: '该字段不能为空',
                        trigger: 'blur'
                    }],
                    RPCParams: [{
                        required: true,
                        message: '该字段不能为空',
                        trigger: 'blur'
                    }]
                },
                // 顶部根据类名过滤
                filters: {
                    id: ''
                }
            }
        },
        
        mounted: function () {
            this.loadData();
        },

        methods: {
            loadData() {
                axios.get('/routes').then((result) => {
                    var _data = result.data;
                    this.routerInfoList = _data;
                });
            },
            getRouter() {
                this.loadData();
            },
            addRouter() {
                this.isView = true;
                this.dialogVisible = true;
                this.isUpdate = false;
                this.setFormDataNull();
            },
            checkDetail(rowData) {
                this.setFormData(rowData);
                this.isView = false;
                this.dialogVisible = true;
                this.isUpdate = false;
            },
            modifyRouter(rowData) {
                this.setFormData(rowData);
                this.isView = true;
                this.dialogVisible = true;
                this.isUpdate = true;
            },
            deleteRouter(rowData) {
                this.$alert('是否删除这条记录', '信息删除', {
                    confirmButtonText: '确定',
                    callback: action => {
                        axios.delete("/routes/" + rowData.route_id).then((result) => {
                            console.info(result);
                            if (result.data.code == 200) {
                                this.$message({
                                    type: 'info',
                                    message: `已删除`
                                });
                            } else {
                                this.$message({
                                    type: 'info',
                                    message: `删除失败`
                                });

                            }
                            this.loadData();
                        });

                    }
                });

            },
            // 调整为提交格式
            setSubmitData(){
                // 设置公共属性  
                this.submitData.id =  this.addFormData.id;
                this.submitData.predicates[0].args._genkey_0 = this.addFormData.path;
                this.submitData.filters[0].args._genkey_1 = this.addFormData.protocolType;
                this.submitData.filters[0].args._genkey_2 = this.addFormData.descr;
                this.submitData.filters[0].args._genkey_3 = this.addFormData.example;
                // 根据类型设置自有属性
                if(this.addFormData.protocolType === 'HTTP'){
                    this.submitData.hostUrl =  'http://' + this.addFormData.hostUrl;
                    this.submitData.filters[0].name = 'HttpAdapt';
                    
                }else if(this.addFormData.protocolType === 'SOFA'){
                    this.submitData.hostUrl =  'bolt://' + this.addFormData.hostUrl;
                    // 自定义过滤器名称
                    this.submitData.filters[0].name = 'SofaAdapt';
                    this.submitData.filters[0].args._genkey_4 = this.addFormData.RPCInterface;
                    this.submitData.filters[0].args._genkey_5 = this.addFormData.RPCMethod;
                    this.submitData.filters[0].args._genkey_6 = this.addFormData.RPCParams;
                    
                }else if(this.addFormData.protocolType === 'FSP'){
                    this.submitData.hostUrl =  'fsp://' + this.addFormData.hostUrl;
                    this.submitData.filters[0].name = 'FspAdapt';
                }   
            },
            // 列表格式调整为表单格式
            setFormData(rowData){

                this.addFormData.id = rowData.route_id,
                this.addFormData.hostUrl = rowData.route_definition.uri.slice(7), // 去掉前边的bolt://
                this.addFormData.path = rowData.route_definition.predicates[0].args._genkey_0,

                this.addFormData.isOn = rowData.route_definition.filters[0].args._genkey_0;
                this.addFormData.protocolType = rowData.route_definition.filters[0].args._genkey_1;
                this.addFormData.descr = rowData.route_definition.filters[0].args._genkey_2;
                this.addFormData.example = rowData.route_definition.filters[0].args._genkey_3;

                this.addFormData.RPCInterface = rowData.route_definition.filters[0].args._genkey_4,
                this.addFormData.RPCMethod = rowData.route_definition.filters[0].args._genkey_5,
                this.addFormData.RPCParams = rowData.route_definition.filters[0].args._genkey_6
            },
            // 设置表单数据为空
            setFormDataNull(){
                this.addFormData.id = '',
                this.addFormData.protocolType = 'HTTP',
                this.addFormData.hostUrl = '',
                this.addFormData.path = '',
                this.addFormData.isOn = 'true',
                this.addFormData.RPCInterface = '',
                this.addFormData.RPCMethod = '',
                this.addFormData.RPCParams = '',
                this.addFormData.descr = '',
                this.addFormData.example = ''
            },
            //增加一条记录
            addSubmit() {
                //先判断表单是否通过了判断
                this.$refs.addFormData.validate((valid) => {
                    //代表通过验证 ,将参数传回后台
                    if (valid) {
                        // 设置为提交格式
                        this.setSubmitData();
                        axios.post("/routes", this.submitData, {
                            headers: {
                                'Content-Type': 'application/json;charset=UTF-8'
                            }
                        }).then((result) => {
                            if (result.data.code == 200) {
                                this.$message({
                                    type: 'info',
                                    message: result.data.message
                                });
                                this.loadData();
                            } else {
                                this.$message({
                                    type: 'info',
                                    message: '添加失败',
                                });
                            }
                            this.dialogVisible = false;
                        });
                    }

                });
            },
            // 更新记录
            updateSubmit(){
                //先判断表单是否通过了判断
                this.$refs.addFormData.validate((valid) => {
                    //代表通过验证 ,将参数传回后台
                    if (valid) {
                        // 设置为提交格式
                        this.setSubmitData();
                        axios.post("/routes/" + this.submitData.id, this.submitData, {
                            headers: {
                                'Content-Type': 'application/json;charset=UTF-8'
                            }
                        }).then((result) => {
                            if (result.data.code == 200) {
                                this.$message({
                                    type: 'info',
                                    message: result.data.message
                                });
                                this.loadData();
                            } else {
                                this.$message({
                                    type: 'info',
                                    message: '添加失败',
                                });
                            }
                            this.dialogVisible = false;
                        });
                    }

                });
            },
            protocolTypeChange:function(val){
            }

        }

    };
    
    
</script>

<style>
    body {
        background: #DFE9FB;
    }
    .element-switch-patch .el-form-item__content{float:left;margin-left:0px !important;}
</style>