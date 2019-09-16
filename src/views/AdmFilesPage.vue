<template>
    <div class="adm-file-page">
        <el-tree
            ref="fileTree"
            show-checkbox
            :props="props"
            lazy
            accordion
            :load="loadNode"
        >
            <div class="custom-tree-node" slot-scope="{node, data}">
                <div>
                    <span v-if="data.isDir">
                        <i class="el-icon-folder-opened"></i>&nbsp;
                        {{data.label}}
                    </span>
                    <span v-else>
                        &emsp;
                        {{data.label}}
                    </span>
                </div>
                <div>
                    <span v-if="data.isDir">
                        <el-button type="text" @click="deleteSelection(node, data)">清理</el-button>
                        <el-button type="text" @click="deleteDir(node, data)">删除</el-button>
                    </span>
                    <span v-else>
                        <el-button type="text" style="color:red;" @click="deleteFile(node, data)">删除文件</el-button>
                    </span>
                </div>
            </div>
        </el-tree>
    </div>
</template>

<script>
import EventProxy from 'eventproxy';

export default {
    data() {
        return {
            props: {
                label: 'label',
                children: 'children'
            }
        }
    },
    methods: {
        loadNode(node, resolve) {
            const self = this;
            if (node.level === 0) {
                // 文件根目录
                resolve([
                    {
                        label: 'files',
                        isDir: true,
                        disabled: true
                    }
                ])
            } else if (node.data.isDir){
                const ep = new EventProxy().after('node', node.level, (list) => {
                    
                    self.$axios.post('/api/admin/dir-list', {
                        pathList: list
                    })
                    .then(response => {
                        const data = response.data;
                        if (data.status === 200) {
                            let resultData = data.list.map(i => {
                                return {
                                    label: i.name,
                                    isDir: i.isDir
                                }
                            });
                            resolve(resultData);
                        } else {
                            console.error(data);
                            resolve([]);
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    }) 
                })
                while (node.data) {
                    ep.emit('node', node.data.label)
                    node = node.parent;
                }
            } else {
                resolve([]);
            }
        },
        deleteDir(node, data) {
            const self = this;
            const ep = new EventProxy().after('node', node.level, (list) => {
                let path = '/' + list.reverse().join('/');
                
                self.$confirm(`是否删除 ${path} ？`, '提示', {type: 'warning'})
                .then(() => {
                    self.$axios.post('/api/delete-files', {
                        list: [
                            {
                                path: path,
                                isDir: true
                            }
                        ]
                    }).then( response => {
                        const data = response.data;
                        if (data.status === 200) {
                            self.$message({
                                type: 'success',
                                message: '成功'
                            })
                        } else {
                            console.error(data);
                            return self.$message({
                                type: 'error',
                                message: '[' + data.status + ']' + data.message
                            });
                        }
                    }).catch(err => console.error(err));

                }).catch(()=>{});
                
            });

            // 文件路径
            while(node.data) {
                ep.emit('node', node.label);
                node = node.parent;
            };
        },
        deleteSelection(node, data) {
            const self = this;
            
            const ep = EventProxy.create('children', 'path', (children, path) => {
                if (children.length > 0) {
                    self.$confirm(`是否删除 ${path} 中选中的所有文件？`, '提示', {type: 'warning'})
                    .then(() => {
                        self.$axios.post('/api/delete-files', {
                            list: children.map(i => {
                                return {
                                    path: path + i.data.label,
                                    isDir: i.data.isDir
                                };
                            })
                        }).then( response => {
                            const data = response.data;
                            if (data.status === 200) {
                                self.$message({
                                    type: 'success',
                                    message: '成功'
                                })
                            } else {
                                console.error(data);
                                return self.$message({
                                    type: 'error',
                                    message: '[' + data.status + ']' + data.message
                                });
                            }
                        }).catch(err => console.error(err));

                    }).catch(()=>{});
                }
            })

            // 获取已选取的子节点
            ep.emit('children', node.childNodes.map(node => {
                if (node.checked) {
                    return node
                }
            }).filter(r=>r))

            // 获取路径
            const epPath = new EventProxy().after('node', node.level, (list) => {
                let path = '/' + list.reverse().join('/') + '/';
                ep.emit('path', path);
            });
            // 文件路径
            while(node.data) {
                epPath.emit('node', node.label);
                node = node.parent;
            };
        },
        deleteFile(node, data) {
            const self = this;
            const ep = new EventProxy().after('node', node.level, (list) => {
                let path = '/' + list.reverse().join('/');
                
                self.$confirm(`是否删除 ${path} ？`, '提示', {type: 'warning'})
                .then(() => {
                    self.$axios.post('/api/delete-files', {
                        list: [
                            {
                                path: path,
                                isDir: true
                            }
                        ]
                    }).then( response => {
                        const data = response.data;
                        if (data.status === 200) {
                            self.$message({
                                type: 'success',
                                message: '成功'
                            })
                        } else {
                            console.error(data);
                            return self.$message({
                                type: 'error',
                                message: '[' + data.status + ']' + data.message
                            });
                        }
                    }).catch(err => console.error(err));

                }).catch(()=>{});
                
            });

            // 文件路径
            while(node.data) {
                ep.emit('node', node.label);
                node = node.parent;
            };
        }
    },
}
</script>

<style>
.adm-file-page {
    padding: 0 150px;
    height: 100%;
}
.adm-file-page .el-tree-node__content {
    height: 35px;
}
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
}
</style>