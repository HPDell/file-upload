<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <el-divider>上传模块</el-divider>
    <div class="upload-area">
      <el-input placeholder="请输入您的ID" v-model="userInfo.userId" style="width:250px; margin: 0 5px;"
        @keyup.enter.native="renewFiles"></el-input>
      <el-button size="small" type="primary" style="margin: 0 5px;" @click="renewFiles">刷新文件</el-button>
      <br><br>
      <el-upload
        ref="upload"
        action="/api/upload-file"
        multiple
        :data="userInfo"
        :on-remove="handleRemove"
        :on-change="handleFileChange"
        :on-success="handleSuccess"
        :file-list="fileList"
        :auto-upload="false">
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
      </el-upload>
    </div>
    <el-divider>文件列表</el-divider>
    <div class="file-list">
      <el-table
        ref="fileList"
        @selection-change="handleSelectionChange"
        :data="uploadedFileList">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="fileName" label="文件名" width="300"></el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" sortable></el-table-column>
        <el-table-column label="操作" fixed="right" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="onDownload(scope.row.url)">下载</el-button>
            <el-button type="text" @click="onDelete(scope.row.url)"
              style="color:red;">删除</el-button>
            <el-button type="text" @click="onScore(scope.row.url)"
              style="color:green;">评分</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="text-align: right; margin: 3px 5px;">
        <el-button size="small" @click="$refs.fileList.toggleAllSelection();">全选/全不选</el-button>
        <el-button type="danger" size="small" @click="onMultiDelete();">批量删除</el-button>
        <el-button type="primary" size="small" @click="renewFiles();">刷新文件</el-button>
      </div>
    </div>
    <el-dialog
      title="得分"
      :visible.sync="scoreDialogVisible"
      width="30%"
      center>
      <p class="score">{{ score }}</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="scoreDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="scoreDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'home',
  data() {
    return {
      userInfo: {
        userId: '2016302590075'
      },
      fileList: [],
      uploadedFileList: [],
      multiSelection: [],

      score: -1,
      scoreDialogVisible: false
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.multiSelection = val;
    },
    onMultiDelete(files) {
      const self = this;
      if (self.multiSelection.length < 1) return;

      console.log(self.multiSelection)

      self.$confirm('确定删除[' + self.multiSelection.length + ']个文件吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).then( () => {
        self.multiSelection.forEach( file => {
          self.$axios.post('/api/delete-file', {
            url: file.url
          }).then( response => {
            if (response.status == 200) {
              self.$message({
                type: 'success',
                message: '删除成功: ' + file.fileName
              });
              self.renewFiles();
            } else {
              self.$message({
                type: 'error',
                message: '删除失败[' + response.status + ']：' + file.name
              })
            }
          })
        })
      }).catch( () => {
          self.$message({
            type: 'info',
            message: '已取消删除'
          });
      })
    },
    onScore(url) {
      const self = this;
      self.$axios.post('/api/score', {
        url: url
      }).then(response => {
        if (response.data.status == 200) {
          self.score = response.data.result;
          self.scoreDialogVisible = true;
        } else {
          self.$message({
            message: response.data.message,
            type: 'error'
          });
        }
      }).catch(error => {
        if (error) {
          console.error(error)
        }
      });
    },
    onDownload(url) {
      console.log('下载：' + url);
      window.open(url);
    },
    onDelete(url) {
      console.log('删除：' + url);

      const self = this;
      let fileName = url.split('/').slice(-1);
      self.$confirm('确定删除 [' + fileName + '] ？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          self.$axios.post('/api/delete-file', {
            url: url
          }).then( response => {
            console.log(response)
            if (response.status == 200) {
              self.$message({
                type: 'success',
                message: '删除成功'
              });
              self.renewFiles();
            } else {
              self.$message({
                type: 'error',
                message: '删除失败：' + response.status
              })
            }
          }).catch((err) => {
            if (err) console.error(err);
          });
        }).catch(() => {
          self.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    },
    submitUpload() {
      const self = this;
      
      if (!self.userInfo.userId) {
        return self.$message({
          type: 'warning',
          message: '请输入唯一标识符'
        });
      } else {
        let nameList1 = self.uploadedFileList.map( file => { return file.fileName; }); // 已上传
        let nameList2 = self.fileList.map( file => { return file.name; }); // 未上传

        let existNameList = nameList2.map( file => {
          if (nameList1.indexOf(file) === -1) return 0;
          else return 1;
        });
        
        if (existNameList.join('') > 0) {
          self.$confirm('上传列表中存在同名文件，继续上传将覆盖', '提示', {
            confirmButtonText: '继续',
            cancelButtonText: '取消',
            type: 'warning'
          }).then( () => {
            self.$refs.upload.submit();
          }).catch( () => {});
        } else {
          self.$refs.upload.submit();
        }
      }
    },
    handleRemove(file, fileList) {
      this.fileList = fileList;
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList;
    },
    handleSuccess(response, file, fileList) {
      const self = this;
      if (response == 'OK' || response == 200) {
        self.$message({
          type: 'success',
          message: '文件[' + file.name + ']上传成功'
        });

        fileList.splice(fileList.indexOf(file), 1);
        self.renewFiles();
      } else {
        self.$message({
          type: 'error',
          message: response
        })
      }
    },
    renewFiles() {
      const self = this;
      if (self.userInfo.userId) {
        self.$axios.get('/api/files' + '?userId=' + self.userInfo.userId)
        .then( response => {
          if (response.data.status == 200) {
            self.uploadedFileList = response.data.result;
            self.$message({
              type: 'success',
              message: '已刷新'
            });
          } else {
            self.$message({
              message: response.data.message,
              type: 'error'
            });
            self.uploadedFileList = [];
          }
        })
        .catch( error => {
          if (error) console.error(error);
        })
      }
    }
  },
  created () {
    const self = this;
    self.renewFiles();
  }
}
</script>

<style>
.upload-area, .file-list {
  border: 2px dashed rgb(112, 109, 109);
  width: 50%;
  margin: auto;
  padding: 5px;
  border-radius: 10px;
}
.score {
  text-align: center;
  font-size: 24px;
  color: red;
  font-weight: bold;
}
</style>
