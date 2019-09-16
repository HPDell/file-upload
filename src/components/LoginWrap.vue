<template>
    <div class="login-wrap" >
        <el-form class="form" ref="loginForm" :model="form" label-width="70px">
            <el-form-item label="账户">
                <el-input style="width:300px;" v-model="form.account" placeholder="账户"></el-input>
            </el-form-item>
            <el-form-item label="密码">
                <el-input style="width:300px;" v-model="form.password" placeholder="密码" type="password"></el-input>
            </el-form-item>
            <el-form-item label="完成验证">
                <span v-if="isGtOk" id="gtModule"></span>
                <span v-else>正在加载验证模块...</span>
            </el-form-item>
        </el-form>
        <br>
        <div class="bottom-btn">
            <el-button type="primary" @click="login()">登录</el-button>
            <el-button @click="register()">注册</el-button>
        </div>
    </div>
</template>

<script>
// 引入initGeetest
require('../assets/js/gt');

export default {
    data() {
        return {
            i: 0,
            form: {
                account: 'admin',
                password: '123456'
            },
            isGtOk: false,
            captchaObj: {}
        }
    },
    methods: {
        handleGtInit(captchaObj) {
            this.isGtOk = true;
            this.captchaObj = captchaObj;
            this.captchaObj.appendTo('#gtModule');
        },
        login(loginForm='loginForm') {
            const self = this;
            
            if (!self.captchaObj) {
                self.$alert('请先完成验证', '提示', {
                    type: 'warning'
                });
                return;
            }

            // 极验验证
            let valid = self.captchaObj.getValidate();
            if (valid) {

                // 表单提交
                self.$refs.loginForm.validate()
                .then(valid => {
                    if (valid) {
                        self.$axios.post('/api/user/login', self.form)
                        .then(response => {
                            const data = response.data;
                            if (data.status === 200) {
                                self.$message({
                                    message: data.message,
                                    type: 'success'
                                });

                                // 设置用户权限
                                sessionStorage.setItem('permission', data.permission);

                                // 分权限浏览页面
                                if (data.permission === 'user') {
                                    self.$router.push('/user');
                                    localStorage.setItem('user_name', data.name);
                                    localStorage.setItem('user_account', self.form.account);
                                } else if (data.permission === 'admin') {
                                    self.$router.push('/admin');
                                    localStorage.setItem('user_name', data.name);
                                    localStorage.setItem('user_account', self.form.account);
                                }
                            } else {
                                self.$message({
                                    message: '[' + data.status + ']' + data.message,
                                    type: 'error'
                                });
                            }
                        })
                        .catch(err => {
                            if (err) {
                                self.$message({
                                    message: err,
                                    type: 'error'
                                });
                                console.error(err);
                            }
                        })
                    }
                })
                .catch(valid => {
                    if (!valid) {
                        console.error(valid);
                    }
                })

            } else {
                self.$alert('请先完成验证', '提示', {
                    type: 'warning'
                });
            }
        },
        register() {
            this.$emit('register');
        }
    },
    created() {
        const self = this;
        self.$axios.get('/gt/register?t=' + (new Date()).getTime())
        .then(response => {
            if (response.status === 200) {
                const data = response.data;
                initGeetest({
                    gt: data.gt,
                    challenge: data.challenge,
                    new_captcha: data.new_captcha,
                    offline: !data.success,
                    product: "float", // float/popup
                    width: "100%"
                }, self.handleGtInit)
            }
        }).catch(error => {
            if (error) {
                console.error(error);
            }
        });

        // 设置迭代器，定期处理sessionStorage，避免恶意添加
        self.i = setInterval(() => {
            sessionStorage.clear();
        }, 100);
    },
    destroyed() {
        // 删除迭代器
        clearInterval(this.i);
        
        // 清空会话
        sessionStorage.clear();
    }
}
</script>

<style scoped>
.login-wrap {
    display: inline-block;
    vertical-align: middle;
    line-height: 0;
    text-align: left;
}
.form {
    text-align: center;
}
.bottom-btn {
    line-height: 0;
    text-align: center;
}
</style>