<template>
  <div class="user-score-wrap" :style="{width: width}">
    <!-- 上传功能 -->
    <h3>在此上传您的成果</h3>
    <div class="upload-area">
      <el-upload
        ref="upload"
        action="/api/upload-file"
        :data="userInfo"
        :on-success="handleSuccess"
        :auto-upload="false"
        :limit="1"
      >
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">提交成果</el-button>
      </el-upload>
    </div>

    <!-- 得分与历史得分 -->
    <h3>您的得分情况</h3>
    <div class="score-area">
      <el-progress :stroke-width="10" type="circle" :percentage="parseFloat(scoreMax.toFixed(5))"></el-progress>
      <p style="margin:5px;">最高分：<span style="color:red;font-weight:bold;font-size:24px;text-decoration:underline;">{{scoreMax.toFixed(5)}}</span></p>

      <el-table :data="scoreList" max-height="380px">
        <el-table-column label="分数" sortable prop="score">
          <template slot-scope="scope">
            <span :style="{color: scope.row.score == scoreMax ? 'red' : ''}">{{scope.row.score}}</span>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" sortable prop="time">
        </el-table-column>
      </el-table>
    </div>

    <!-- 得分提示对话框 -->
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
  props : {
    width: {
      default: '475px',
      type: String
    },
    account: {
      require: true,
      type: String
    }
  },
  data() {
    return {
      userInfo: {
        userId: this.account
      },

      score: -1,
      scoreDialogVisible: false,

      scoreList: [],
      scoreMax: 0,

    }
  },
  created() {
    this.getScore();
  },
  methods: {
    getScore() {
      const self = this;

      self.$axios.post('/api/user/my-score', {
        account: self.account
      })
      .then(response => {
        const data = response.data;
        if (data.status === 200) {
          self.scoreList = data.result;

          // 最高分
          if (self.scoreList.length > 0) {
            self.scoreMax = data.result.sort((a,b) => {
              return b.score - a.score;
            })[0].score;
          }

        } else {
          console.error(data.message);
          self.$message({
            type: 'error',
            message: '[' + data.status + ']' + data.message
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
    },
    submitUpload() {
      const self = this;
      self.$refs.upload.submit()
    },
    // data is response.data
    handleSuccess (data, file, fileList) {
      const self = this;
      
      if (data.status === 200) {
        const loading = self.$loading({
          lock: true,
          text: '文件已上传成功，正在评分中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0,0,0,0.7)'
        });

        // 上传成功，送去评分
        self.$axios.post('/api/file-evaluate', data)
        .then(response => {
          const resData = response.data;
          if (resData.status === 200) {
            loading.close();
            self.scoreDialogVisible = true;
            self.score = resData.score;
            
            // 获取自己分数
            self.getScore();

            // 刷新所有分数
            self.$emit('fresh');

            // 清空上传成功的文件
            self.$refs.upload.clearFiles();

          } else {
            loading.close();
            console.error(resData);
            self.$alert('评分失败，请检查文件或联系管理员', '提示', {type: 'error'});
          }
        })
        .catch(err => {
          console.error(err)
        });

      } else {
        console.error(data);
        self.$message({
          type: 'error',
          message: '[' + data.status + ']' + data.message
        });
      }
    },
  }
}
</script>

<style scoped>
.user-score-wrap {
  line-height: 20px;
  height: 800px;
}
.upload-area, .score-area {
  border: 2px dashed rgb(112, 109, 109);
  width: 90%;
  margin: auto;
  padding: 10px 5px;
  border-radius: 10px;
  height: 70px;
}
.score-area {
  height: 550px;
}
.score {
  text-align: center;
  font-size: 24px;
  color: red;
  font-weight: bold;
}
</style>
