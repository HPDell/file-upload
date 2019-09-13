<template>
    <div class="login-main">
        <div class="login-dialog">
            <!-- 注册界面 -->
            <register-wrap v-if="isRegisterShow" @back="isRegisterShow = false;"></register-wrap>
            <!-- 登录界面 -->
            <login-wrap v-else @register="isRegisterShow = true;">
            </login-wrap>
        </div>
    </div>
</template>

<script>
// 登录组件
import LoginWrap from '../components/LoginWrap';
// 注册组件
import RegisterWrap from '../components/RegisterWrap';

export default {
    components: {
        LoginWrap, RegisterWrap
    },
    data() {
        return {
            isRegisterShow: false
        }
    },
}
</script>

<style>
.login-main {
    background-color: rgb(50, 52, 59);
    height: 800px;
    line-height: 800px;
    width: 100%;
}
.login-dialog {
    vertical-align: middle;
    display: inline-block;
    height: 350px;
    line-height: 350px;
    width: 450px;
    border-radius: 25px;
    /* opacity: 0.8; (改成background)*/
    background-color: rgba(255, 255, 255, 0.8)

}
</style>