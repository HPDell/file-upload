<template>
    <div class="user-score-wrap" :style="{width: width}">
        <!-- 上传功能 -->
        <h3>在此上传您的成果</h3>
        <div class="upload-area"
            v-loading="isCalculating"
            element-loading-text="文件已上传成功，正在评分中……"
            element-loading-spinner="el-icon-loading"
        >
            <el-upload
                v-loading="isCheckLastSubmit"
                element-loading-text="检查上一次提交……"
                element-loading-spinner="el-icon-loading"
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
            <el-progress :stroke-width="10" type="circle" :percentage="parseFloat((scoreMax + '').slice(0, 9))"></el-progress>
            <p style="margin:5px;">最高分：
                <span style="color:red;font-weight:bold;font-size:24px;text-decoration:underline;">
                    {{(scoreMax + '').slice(0, 10)}}
                </span>
            </p>

            <el-table :data="scoreList" max-height="380px">
                <el-table-column label="分数" sortable prop="score">
                    <template slot-scope="scope">
                        <span :style="{color: scope.row.score == scoreMax ? 'red' : ''}">{{scope.row.score}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="提交时间" sortable :sort-method="scoreSortMethod" prop="time">
                </el-table-column>
            </el-table>
        </div>

        <!-- 得分提示对话框 -->
        <el-dialog
            title="得分"
            :visible.sync="scoreDialogVisible"
            width="30%"
            center>
            <p class="score">{{ totalScore }}</p>
            <el-table :data="[{score1: score1===-1?'Error':score1, score2: score2===-1?'Error':score2}]">
                <el-table-column label="地物分类得分" prop="score1" align="center"></el-table-column>
                <el-table-column label="变化检测得分" prop="score2" align="center"></el-table-column>
            </el-table>
            <span>Tip：若分数出现“Error”，说明该部分评分失败</span>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="handleScoreConfirm">确 定</el-button>
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
			
			lastScoreId: -1,
            score1: 0,
            score2: 0,
            totalScore: 0,
            scoreDialogVisible: false,

            scoreList: [],
            scoreMax: 0,

            // 分数运算模块是否正在加载
            isCalculating: false,
			// 上传按钮是否正在加载状态
			isCheckLastSubmit: true
        }
    },
    created() {
        const self = this;
        self.getScore();

        self.$axios.post('/api/evaluate-result', {
            account: self.account
        }).then(res => {
			const data = res.data;
			if (data.status === 200) {
				self.isCheckLastSubmit = false;

				const result = data.result;
				if (result) {
					// 有待显示的计算结果
					if (result.process === 'show') {

                        console.log(result.score1 === -1)

						self.lastScoreId = result.id;
						self.score1 = result.score1 === -1 ? 'Error' : result.score1;
						self.score2 = result.score2 === -1 ? 'Error' : result.score2;
						self.totalScore = (result.score1 === -1 ? 0 : result.score1) + 
						(result.score2 === -1 ? 0 : result.score2);
						self.scoreDialogVisible = true;

					}
					// 运算正在进行
					else if (result.process === 'ing') {
						self.isCalculating = true;
						self.getEvaluateResult();
					}
				}
			}
        }).catch(err => console.error(err));
    },
    methods: {
		handleScoreConfirm() {
			const self = this;
			self.$axios.post('/api/evaluate-shown', {
				calcId: self.lastScoreId
			}).then(response => {
				self.scoreDialogVisible = false;
			}).catch(err => console.error(err));
		},
        scoreSortMethod(a, b) {
            return new Date(b.time).getTime() - new Date(a.time).getTime();
        },
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
            self.$refs.upload.submit();
        },
        getEvaluateResult() {
            const self = this;

            const i = setInterval(() => {
                self.$axios.post('/api/evaluate-result', {
                    account: self.account
                }).then(response => {
					const data = response.data;
				
					if (data.status === 200) {
						
						const result = data.result;
						if (result) {
							// 有待显示的计算结果
							if (result.process === 'show') {

                                console.log(result.score1 === -1)
                                
								self.lastScoreId = result.id;
								self.score1 = result.score1 === -1 ? 'Error' : result.score1;
								self.score2 = result.score2 === -1 ? 'Error' : result.score2;
								self.totalScore = (result.score1 === -1 ? 0 : result.score1) + 
									(result.score2 === -1 ? 0 : result.score2);
								self.scoreDialogVisible = true;
								self.isCalculating = false;

								clearInterval(i);
								// 获取自己分数
								self.getScore();

								// 刷新所有分数
								self.$emit('fresh');

								// 清空上传成功的文件
								self.$refs.upload.clearFiles();

							}
							// 运算正在进行
							else if (result.process === 'ing') {
								self.isCalculating = true;
							}
						}
						// 没有result说明done
						else {
							clearInterval(i);
						}

					} else {
                        console.error(data);
                        clearInterval(i);
					}
                }).catch(err => console.error(err));
            }, 3000);
        },
        // data is response.data
        handleSuccess (data, file, fileList) {
            const self = this;
            
            if (data.status === 200) {
                // 上传成功，送去评分
                self.$axios.post('/api/file-evaluate', data)
                .then(response => {
                    const resData = response.data;
                    if (resData.status === 200) {
						self.lastScoreId = resData.calcId;
						self.isCalculating = true;

						self.getEvaluateResult();
                        // self.scoreDialogVisible = true;

                        // self.totalScore = resData.score;
                        // self.score1 = resData.score1;
                        // self.score2 = resData.score2;
                        
                        // // 获取自己分数
                        // self.getScore();

                        // // 刷新所有分数
                        // self.$emit('fresh');

                        // // 清空上传成功的文件
                        // self.$refs.upload.clearFiles();

                    } else {
                        console.error(resData);
                        self.$alert(resData.message, '提示', {type: 'error'});
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
    font-size: 36px;
    color: red;
    font-weight: bold;
}
</style>
