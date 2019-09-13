import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '*',
      redirect: '/admin'
    },
    {
      path: '/login',
      name: 'Login Page',
      component: () => import('./views/Login.vue')
    },
    {
      path: '/user',
      name: 'User Dashboard',
      component: () => import('./views/UserDashboard.vue')
    },
    {
      path: '/admin',
      name: 'Admin Dashboard',
      component: () => import('./views/AdminDashboard.vue'),
      children: [
        {
          path: '/ad-main',
          name: 'Admin Dashboard Main Page',
          component: () => import('./views/AD_main.vue')
        },
        {
          path: '/ad-stats',
          name: 'Admin Dashboard Statistic',
          component: () => import('./views/AD_stats.vue')
        },
        {
          path: '/ad-user',
          name: 'Admin Dashboard User Manager',
          component: () => import('./views/AD_user.vue')
        }
      ]
    },
  ]
})

// 钩子函数进行权限跳转
// router.beforeEach( (to, from, next) => {
//   const role = sessionStorage.getItem('permission');
//   if (!role && to.path !== '/login') {
//     next('/login');
//   } else {
//     next();
//   }
// })

export default router;
